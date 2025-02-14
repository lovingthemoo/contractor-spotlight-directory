
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Star, Mail, AtSign } from "lucide-react";

const GetQuotes = () => {
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [numCompanies, setNumCompanies] = useState<number[]>([5]);
  const [distance, setDistance] = useState<number[]>([10]);
  const [minRating, setMinRating] = useState<number[]>([3]);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please provide your email address to receive quotes.",
        variant: "destructive"
      });
      return;
    }
    // This would connect to a backend service
    toast({
      title: "Quote Request Sent",
      description: `Your request will be sent to ${numCompanies[0]} companies. Responses will be sent to ${email}`,
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-8">Get Multiple Quotes</h1>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Save time by sending your project details to multiple trusted traders at once.
              Compare quotes and choose the best professional for your needs.
            </p>

            <Card className="max-w-3xl mx-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Email Address</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      type="email"
                      placeholder="Enter your email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Traders will send their quotes to this email address
                  </p>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Service</label>
                  <Select
                    value={service}
                    onValueChange={setService}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="What service do you need?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electrical">Electrical Work</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="building">Building Work</SelectItem>
                      <SelectItem value="roofing">Roofing</SelectItem>
                      <SelectItem value="gardening">Gardening</SelectItem>
                      <SelectItem value="painting">Painting & Decorating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="Enter your postcode" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Number of Companies Slider */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Companies to Contact: {numCompanies[0]}
                  </label>
                  <Slider
                    value={numCompanies}
                    onValueChange={setNumCompanies}
                    max={25}
                    min={1}
                    step={1}
                  />
                </div>

                {/* Distance Slider */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Distance: {distance[0]} miles
                  </label>
                  <Slider
                    value={distance}
                    onValueChange={setDistance}
                    max={50}
                    min={1}
                    step={1}
                  />
                </div>

                {/* Minimum Rating Slider */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Minimum Rating: {minRating[0]} <Star className="inline h-4 w-4 text-yellow-400" />
                  </label>
                  <Slider
                    value={minRating}
                    onValueChange={setMinRating}
                    max={5}
                    min={1}
                    step={0.5}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Project Details</label>
                  <Textarea
                    placeholder="Describe your project requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Quote Requests
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default GetQuotes;
