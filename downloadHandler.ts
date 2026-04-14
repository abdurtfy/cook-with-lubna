import { Request, Response } from "express";
import { getOrderByDownloadToken, markOrderAsDownloaded } from "./db";

/**
 * Secure download endpoint handler.
 * Validates download token and payment status before serving ebook.
 * This would be called as: GET /api/download/:token
 */
export async function handleDownload(req: Request, res: Response) {
  try {
    const { token } = req.params;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Invalid download token" });
    }

    // Verify token and check payment status
    const order = await getOrderByDownloadToken(token);

    if (!order) {
      return res.status(404).json({ error: "Download link not found or expired" });
    }

    if (order.paymentStatus !== "completed") {
      return res.status(403).json({ error: "Payment not verified" });
    }

    // Mark as downloaded
    await markOrderAsDownloaded(order.id);

    // In a real implementation, this would serve the actual ebook file from S3
    // For now, we return a JSON response indicating successful verification
    // The actual file download would happen like this:
    // const fileBuffer = await downloadFromS3(ebookPath);
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", `attachment; filename="Cook-with-Lubna-Recipes.pdf"`);
    // res.send(fileBuffer);

    return res.json({
      success: true,
      message: "Download verified. Ebook file would be served here.",
      order: {
        id: order.id,
        buyerName: order.buyerName,
        downloadedAt: order.downloadedAt,
      },
    });
  } catch (error) {
    console.error("[Download] Error:", error);
    return res.status(500).json({ error: "Failed to process download request" });
  }
}

/**
 * Verify download token without marking as downloaded.
 * Used by frontend to check if token is valid before showing download button.
 */
export async function verifyDownloadToken(req: Request, res: Response) {
  try {
    const { token } = req.params;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ valid: false });
    }

    const order = await getOrderByDownloadToken(token);

    if (!order || order.paymentStatus !== "completed") {
      return res.status(200).json({ valid: false });
    }

    return res.json({
      valid: true,
      buyerName: order.buyerName,
      downloadedAt: order.downloadedAt,
    });
  } catch (error) {
    console.error("[Verify Download] Error:", error);
    return res.status(500).json({ valid: false });
  }
}
