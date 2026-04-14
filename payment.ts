import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createRazorpayOrder, verifyRazorpaySignature } from "../razorpay";
import { createOrder, getOrderByPaymentId, completeOrder, getOrderByDownloadToken, markOrderAsDownloaded, getOrderByRazorpayOrderId } from "../db";
import { nanoid } from "nanoid";
import { notifyOwner } from "../_core/notification";

const EBOOK_PRICE_INR = 199;
const EBOOK_PRICE_PAISE = EBOOK_PRICE_INR * 100;

export const initiatePayment = publicProcedure
  .input(
    z.object({
      buyerName: z.string().min(1, "Name is required"),
      buyerEmail: z.string().email("Valid email is required"),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const razorpayOrder = await createRazorpayOrder(
        EBOOK_PRICE_PAISE,
        input.buyerEmail,
        input.buyerName
      );

      const downloadToken = nanoid(32);

      const order = await createOrder({
        buyerName: input.buyerName,
        buyerEmail: input.buyerEmail,
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: "",
        amount: EBOOK_PRICE_PAISE,
        currency: "INR",
        paymentStatus: "pending",
        downloadToken,
      });

      return {
        success: true,
        orderId: order?.id,
        razorpayOrderId: razorpayOrder.id,
        amount: EBOOK_PRICE_PAISE,
        currency: "INR",
        buyerName: input.buyerName,
        buyerEmail: input.buyerEmail,
      };
    } catch (error) {
      console.error("[Payment] Error initiating payment:", error);
      throw new Error("Failed to initiate payment. Please try again.");
    }
  });

export const verifyPayment = publicProcedure
  .input(
    z.object({
      razorpayOrderId: z.string(),
      razorpayPaymentId: z.string(),
      razorpaySignature: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const isSignatureValid = verifyRazorpaySignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature
      );

      if (!isSignatureValid) {
        throw new Error("Invalid payment signature");
      }

      const order = await getOrderByRazorpayOrderId(input.razorpayOrderId);

      if (!order) {
        throw new Error("Order not found");
      }

      await completeOrder(order.id, input.razorpayPaymentId);

      await notifyOwner({
        title: "New Ebook Purchase",
        content: `New purchase from ${order.buyerName} (${order.buyerEmail})\nPayment ID: ${input.razorpayPaymentId}\nAmount: ₹${EBOOK_PRICE_INR}`,
      });

      return {
        success: true,
        orderId: order.id,
        downloadToken: order.downloadToken,
      };
    } catch (error) {
      console.error("[Payment] Error verifying payment:", error);
      throw new Error("Failed to verify payment. Please contact support.");
    }
  });

export const getDownloadLink = publicProcedure
  .input(
    z.object({
      downloadToken: z.string(),
    })
  )
  .query(async ({ input }) => {
    try {
      const order = await getOrderByDownloadToken(input.downloadToken);

      if (!order) {
        throw new Error("Invalid download token");
      }

      if (order.paymentStatus !== "completed") {
        throw new Error("Payment not verified");
      }

      await markOrderAsDownloaded(order.id);

      return {
        success: true,
        downloadUrl: `/api/download/${input.downloadToken}`,
      };
    } catch (error) {
      console.error("[Payment] Error getting download link:", error);
      throw new Error("Failed to get download link");
    }
  });

export const paymentRouter = router({
  initiatePayment,
  verifyPayment,
  getDownloadLink,
});
