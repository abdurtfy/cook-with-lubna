import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, Mail, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ThankYou() {
  const [location] = useLocation();
  const [downloadToken, setDownloadToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  const getDownloadLinkQuery = trpc.payment.getDownloadLink.useQuery(
    { downloadToken },
    { enabled: !!downloadToken }
  );

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const orderId = params.get("orderId");
    const errorParam = params.get("error");

    if (errorParam === "verification_failed") {
      setError("Payment verification failed. Please contact support.");
      setIsLoading(false);
      return;
    }

    if (orderId) {
      const token = sessionStorage.getItem("downloadToken");
      if (token) {
        setDownloadToken(token);
        setIsLoading(false);
      } else {
        setError("Download token not found. Please try again.");
        setIsLoading(false);
      }
    }
  }, [location]);

  useEffect(() => {
    if (getDownloadLinkQuery.data?.downloadUrl) {
      setDownloadUrl(getDownloadLinkQuery.data.downloadUrl);
    }
    if (getDownloadLinkQuery.error) {
      setError("Failed to generate download link. Please refresh the page.");
    }
  }, [getDownloadLinkQuery.data, getDownloadLinkQuery.error]);

  const handleDownload = () => {
    if (downloadUrl) {
      window.location.href = downloadUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-green-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">Thank you for your purchase. Your ebook is ready to download.</p>
        </div>

        {/* Main Content */}
        <Card className="border-green-100 p-8 mb-6">
          {error ? (
            <div className="flex items-start gap-4 text-red-600">
              <AlertCircle size={24} className="flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Unable to Generate Download Link</h3>
                <p className="text-sm">{error}</p>
                <p className="text-sm mt-2">Please check your email for the download link, or contact support.</p>
              </div>
            </div>
          ) : isLoading || getDownloadLinkQuery.isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Preparing your download...</p>
            </div>
          ) : downloadUrl ? (
            <div className="space-y-6">
              {/* Download Section */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Your Recipe Ebook</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">Cook with Lubna - Recipe Ebook</p>
                    <p className="text-sm text-gray-600">PDF Format • 50+ Recipes</p>
                  </div>
                  <Download size={32} className="text-green-600" />
                </div>
                <Button
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                >
                  Download Ebook Now
                </Button>
              </div>

              {/* Email Confirmation */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3">
                <Mail size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Email Confirmation</p>
                  <p>A download link has also been sent to your email address. Check your inbox or spam folder.</p>
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Next Steps */}
        <Card className="border-amber-100 p-6 bg-amber-50">
          <h3 className="font-semibold text-amber-950 mb-4">What's Next?</h3>
          <ol className="space-y-3 text-sm text-amber-900">
            <li className="flex gap-3">
              <span className="font-bold flex-shrink-0">1.</span>
              <span>Download the ebook using the button above</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold flex-shrink-0">2.</span>
              <span>Open the PDF file on your device</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold flex-shrink-0">3.</span>
              <span>Start cooking! Follow the recipes step-by-step</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold flex-shrink-0">4.</span>
              <span>Share your cooking experience with us on social media</span>
            </li>
          </ol>
        </Card>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Have questions? We're here to help!</p>
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            Contact Support
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Thank you for supporting Cook with Lubna!</p>
          <p className="mt-2">Enjoy your culinary journey 🍳</p>
        </div>
      </div>
    </div>
  );
}
