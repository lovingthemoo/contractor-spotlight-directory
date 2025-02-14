
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, ChevronRight, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Contractor {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  specialty: string;
  location: string;
  description: string;
}

const contractors: Contractor[] = [
  {
    id: 1,
    name: "John Smith Electrical",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    rating: 4.8,
    reviews: 127,
    specialty: "Electrical",
    location: "Central London",
    description: "Experienced electrical contractor specializing in residential and commercial installations."
  },
  {
    id: 2,
    name: "Thames Plumbing Co.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    rating: 4.9,
    reviews: 89,
    specialty: "Plumbing",
    location: "South London",
    description: "Professional plumbing services with 15+ years of experience in London."
  },
  {
    id: 3,
    name: "BuildRight Construction",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    rating: 4.7,
    reviews: 156,
    specialty: "Construction",
    location: "North London",
    description: "Full-service construction company delivering quality projects on time."
  }
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center animate-in">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Find Trusted London
              <span className="block text-primary">Contractors</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl">
              Connect with verified contractors in London. Quality service, guaranteed satisfaction.
            </p>
            
            {/* Search Bar */}
            <div className="flex items-center max-w-md mx-auto mt-8 overflow-hidden bg-white border rounded-full">
              <Search className="w-5 h-5 mx-3 text-gray-400" />
              <Input
                type="text"
                placeholder="Search contractors..."
                className="flex-1 border-0 focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Badge variant="secondary" className="mr-2">
                <MapPin className="w-4 h-4 mr-1" />
                London
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Contractors */}
      <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="animate-in">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured Contractors</h2>
          <p className="mt-2 text-gray-500">Top-rated professionals in London</p>
          
          <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
            {contractors
              .filter(contractor => 
                contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contractor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contractor.location.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((contractor) => (
                <Link key={contractor.id} to={`/contractor/${contractor.id}`}>
                  <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer">
                    <img
                      src={contractor.image}
                      alt={contractor.name}
                      className="object-cover w-full h-48"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{contractor.name}</h3>
                        <Badge>{contractor.specialty}</Badge>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {contractor.location}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">{contractor.rating}</span>
                          <span className="ml-1 text-sm text-gray-500">
                            ({contractor.reviews} reviews)
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
