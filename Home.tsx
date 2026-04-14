import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, Star, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePaymentMutation = trpc.payment.initiatePayment.useMutation();
  const verifyPaymentMutation = trpc.payment.verifyPayment.useMutation();

  const handleBuyClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerEmail.trim()) return;

    setIsProcessing(true);
    try {
      const result = await initiatePaymentMutation.mutateAsync({
        buyerName,
        buyerEmail,
      });

      if (result.razorpayOrderId) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          order_id: result.razorpayOrderId,
          amount: result.amount,
          currency: result.currency,
          name: "Cook with Lubna",
          description: "Recipe Ebook",
          prefill: {
            name: buyerName,
            email: buyerEmail,
          },
          handler: async (response: any) => {
            try {
              const verifyResult = await verifyPaymentMutation.mutateAsync({
                razorpayOrderId: result.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              sessionStorage.setItem("downloadToken", verifyResult.downloadToken);
              setLocation(`/thank-you?orderId=${verifyResult.orderId}`);
            } catch (error) {
              console.error("Payment verification failed:", error);
              setLocation(`/thank-you?error=verification_failed`);
            }
          },
          theme: {
            color: "#8B4513",
          },
        };

        const Razorpay = (window as any).Razorpay;
        if (Razorpay) {
          const rzp = new Razorpay(options);
          rzp.open();
        }
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const faqs = [
    {
      question: "What's included in the ebook?",
      answer: "The ebook includes 50+ authentic Indian recipes, step-by-step instructions, ingredient lists, nutritional information, and cooking tips from Lubna's kitchen.",
    },
    {
      question: "How will I receive the ebook?",
      answer: "After successful payment, you'll receive an instant download link via email. The ebook is in PDF format and can be read on any device.",
    },
    {
      question: "Is there a refund policy?",
      answer: "We offer a 7-day money-back guarantee if you're not satisfied with the ebook. Contact support for refunds.",
    },
    {
      question: "Can I share the ebook with others?",
      answer: "The ebook is for personal use only. Sharing or distributing it violates our terms of service.",
    },
    {
      question: "What format is the ebook?",
      answer: "The ebook is provided as a PDF file, which can be read on computers, tablets, and smartphones.",
    },
  ];

  const recipes = [
    "Butter Chicken",
    "Paneer Tikka",
    "Biryani",
    "Samosas",
    "Dal Makhani",
    "Tandoori Chicken",
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      text: "The recipes are so easy to follow and absolutely delicious! My family loved every dish.",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      text: "Worth every rupee. Lubna's tips and tricks make cooking so much easier.",
      rating: 5,
    },
    {
      name: "Anjali Patel",
      text: "Finally, authentic recipes that actually work! Highly recommended.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-900">Cook with Lubna</h1>
          <Button variant="outline" size="sm" className="text-amber-900 border-amber-200 hover:bg-amber-50">
            Scroll to Buy
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-amber-100 text-amber-900 px-4 py-2 rounded-full text-sm font-semibold">
              ✓ Trusted by 4M+ YouTube Subscribers
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-amber-950 leading-tight">
              Master Authentic Indian Cooking
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Learn 50+ authentic recipes from Lubna's kitchen. From everyday curries to festive feasts, everything you need to cook like a pro.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-gray-600">4.9/5 from 2,000+ buyers</span>
            </div>
            <Button
              size="lg"
              className="bg-amber-700 hover:bg-amber-800 text-white text-lg px-8 py-6 rounded-lg"
              onClick={() => setShowPaymentForm(true)}
            >
              Buy Now for ₹199
            </Button>
          </div>
          <div className="bg-gradient-to-br from-amber-200 to-orange-200 rounded-2xl aspect-square flex items-center justify-center shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-amber-950 font-semibold">Recipe Ebook</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-amber-950 mb-12 text-center">About the Author</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-amber-100">
              <div className="text-5xl mb-4">👩‍🍳</div>
              <h4 className="text-2xl font-bold text-amber-950 mb-2">Lubna</h4>
              <p className="text-gray-600">Professional Chef & Content Creator</p>
            </Card>
            <Card className="p-8 text-center border-amber-100">
              <div className="text-5xl mb-4">📺</div>
              <h4 className="text-2xl font-bold text-amber-950 mb-2">4M+ Subscribers</h4>
              <p className="text-gray-600">Trusted by millions on YouTube</p>
            </Card>
            <Card className="p-8 text-center border-amber-100">
              <div className="text-5xl mb-4">🏆</div>
              <h4 className="text-2xl font-bold text-amber-950 mb-2">20+ Years</h4>
              <p className="text-gray-600">Cooking experience & expertise</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-amber-950 mb-12 text-center">What's Inside</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-amber-950">Sample Recipes</h4>
              <div className="grid grid-cols-2 gap-4">
                {recipes.map((recipe) => (
                  <div key={recipe} className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-center gap-3">
                    <Check size={20} className="text-amber-700" />
                    <span className="text-amber-950 font-medium">{recipe}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-amber-950">Ebook Features</h4>
              <ul className="space-y-3">
                {[
                  "50+ authentic Indian recipes",
                  "Step-by-step instructions",
                  "Ingredient lists & substitutions",
                  "Nutritional information",
                  "Cooking tips & tricks",
                  "Beautiful food photography",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-700">
                    <Check size={20} className="text-amber-700 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-amber-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-amber-950 mb-12 text-center">What Customers Say</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="p-6 border-amber-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-amber-950">{testimonial.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-4xl font-bold text-amber-950 mb-12 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card
                key={i}
                className="border-amber-100 overflow-hidden cursor-pointer hover:border-amber-300 transition-colors"
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <div className="p-6 flex justify-between items-center bg-white hover:bg-amber-50">
                  <h4 className="font-semibold text-amber-950">{faq.question}</h4>
                  <ChevronDown
                    size={20}
                    className={`text-amber-700 transition-transform ${
                      expandedFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {expandedFaq === i && (
                  <div className="px-6 py-4 bg-amber-50 border-t border-amber-100 text-gray-700">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-700 to-amber-800 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-4xl md:text-5xl font-bold">Ready to Master Indian Cooking?</h3>
          <p className="text-xl text-amber-100">Get instant access to 50+ authentic recipes for just ₹199</p>
          <Button
            size="lg"
            className="bg-white text-amber-800 hover:bg-amber-50 text-lg px-8 py-6 rounded-lg"
            onClick={() => setShowPaymentForm(true)}
          >
            Buy Now for ₹199
          </Button>
        </div>
      </section>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-amber-100">
            <div className="p-8">
              <h4 className="text-2xl font-bold text-amber-950 mb-6">Get Your Ebook</h4>
              <form onSubmit={handleBuyClick} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    required
                  />
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-gray-600 mb-2">Price</p>
                  <p className="text-3xl font-bold text-amber-900">₹199</p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Proceed to Payment"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-amber-200 text-amber-900 hover:bg-amber-50"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
