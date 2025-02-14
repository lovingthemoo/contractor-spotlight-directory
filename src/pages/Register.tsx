import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const Register = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 relative">
        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-primary mb-4">Coming Soon</h2>
          <p className="text-xl text-gray-600 text-center max-w-lg px-4">
            We're currently working on making our business registration system available. 
            Check back soon to list your trade business!
          </p>
        </div>

        {/* Existing content (dimmed in background) */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-8">List Your Business</h1>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Join the UK's leading trade directory and connect with customers actively seeking your services.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Basic Plan */}
              <Card className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Basic Listing</h3>
                  <div className="text-3xl font-bold mb-4">£9.99<span className="text-base font-normal text-gray-600">/month</span></div>
                </div>
                <ul className="space-y-4 mb-6">
                  {["Basic profile listing", "Contact information display", "3 photos upload", "Customer inquiries"].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline">Get Started</Button>
              </Card>

              {/* Premium Plan */}
              <Card className="p-6 border-primary">
                <div className="text-center mb-6">
                  <div className="text-primary font-semibold mb-2">Most Popular</div>
                  <h3 className="text-xl font-bold mb-2">Premium Listing</h3>
                  <div className="text-3xl font-bold mb-4">£19.99<span className="text-base font-normal text-gray-600">/month</span></div>
                </div>
                <ul className="space-y-4 mb-6">
                  {[
                    "Everything in Basic",
                    "Priority listing placement",
                    "10 photos upload",
                    "Customer reviews",
                    "Social media links",
                    "Business hours display"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full">Get Started</Button>
              </Card>

              {/* Pro Plan */}
              <Card className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Pro Listing</h3>
                  <div className="text-3xl font-bold mb-4">£29.99<span className="text-base font-normal text-gray-600">/month</span></div>
                </div>
                <ul className="space-y-4 mb-6">
                  {[
                    "Everything in Premium",
                    "Featured listing status",
                    "Unlimited photos",
                    "Custom business page",
                    "Lead generation tools",
                    "Analytics dashboard",
                    "Priority support"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline">Get Started</Button>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Register;
