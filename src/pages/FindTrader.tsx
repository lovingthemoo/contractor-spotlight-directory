
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FindTrader = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Search Hero Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-8">Find a Trusted Trader</h1>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Connect with verified professionals in your area. Browse reviews, compare quotes, and hire with confidence.
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="What service do you need?" 
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Postcode" 
                    className="pl-10 w-full md:w-[200px]"
                  />
                </div>
                <Button className="w-full md:w-auto">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Popular Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                "Electricians",
                "Plumbers",
                "Builders",
                "Roofers",
                "Gardeners",
                "Painters",
                "Carpenters",
                "Plasterers"
              ].map((category) => (
                <Card 
                  key={category}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/search?category=${category.toLowerCase()}`)}
                >
                  <h3 className="font-semibold mb-2">{category}</h3>
                  <p className="text-sm text-gray-600">Find trusted {category.toLowerCase()} in your area</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default FindTrader;
