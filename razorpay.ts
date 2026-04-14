import crypto from "crypto";
import { ENV } from "./_core/env";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

/**
 * Initialize Razorpay API client with auth headers.
 */
function getRazorpayAuth() {
  const auth = Buffer.from(`${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`).toString("base64");
  return `Basic ${auth}`;
}

/**
 * Create a Razorpay order for the ebook purchase.
 * Amount should be in paise (₹199 = 19900 paise).
 */
export async function createRazorpayOrder(amount: number, buyerEmail: string, buyerName: string) {
  const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: getRazorpayAuth(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      customer_notify: 1,
      notes: {
        buyerEmail,
        buyerName,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay API error: ${error}`);
  }

  return response.json();
}

/**
 * Verify Razorpay payment signature.
 * This ensures the payment came from Razorpay and wasn't tampered with.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const data = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", ENV.razorpayKeySecret)
    .update(data)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Fetch payment details from Razorpay API.
 * Used to verify payment status and details.
 */
export async function getPaymentDetails(paymentId: string) {
  const response = await fetch(`${RAZORPAY_API_BASE}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: getRazorpayAuth(),
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay API error: ${error}`);
  }

  return response.json();
}
