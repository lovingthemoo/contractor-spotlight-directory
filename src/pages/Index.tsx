import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, ChevronRight, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Contractor {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  specialty: string;
  location: string;
  description: string;
  slug: string;
}

const contractors: Contractor[] = [
  {
    id: 1,
    name: "Elite Electrical Solutions - Licensed Electrician Near Me",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e",
    rating: 4.8,
    reviews: 127,
    specialty: "Electrical",
    location: "Central London",
    description: "24 hour electrician and emergency electrician services in Central London. Commercial electrician services available. Our licensed electricians provide professional electrical services with 15+ years of experience. Local electrician serving all areas of London.",
    slug: "elite-electrical-solutions"
  },
  {
    id: 2,
    name: "Thames Valley Plumbing - Emergency Plumber Near Me",
    image: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13",
    rating: 4.9,
    reviews: 89,
    specialty: "Plumbing",
    location: "South London",
    description: "24 hour plumber and emergency plumber services. Best plumbers near me in South London. Local plumbers providing comprehensive plumbing services near me. Commercial plumber services available. Emergency repairs, bathroom installations, and central heating systems.",
    slug: "thames-valley-plumbing"
  },
  {
    id: 3,
    name: "Roofing Masters London - Local Roofers Near Me",
    image: "https://images.unsplash.com/photo-1632759145355-8b8f6d37d27c",
    rating: 4.7,
    reviews: 156,
    specialty: "Roofing",
    location: "North London",
    description: "Roof repair near me and emergency roof repair services. One of the leading roofing companies near me in North London. Local roofers providing commercial roofing and comprehensive roofing services near me. Fully insured with proven track record.",
    slug: "roofing-masters-london"
  },
  {
    id: 4,
    name: "Green Gardens & Landscapes - Professional Gardener Near Me",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
    rating: 4.8,
    reviews: 92,
    specialty: "Gardening",
    location: "West London",
    description: "Expert landscaping services and gardener near me in West London. Professional lawn care near me and garden maintenance services. Tree trimming services available. Comprehensive gardening services for all your needs. Quality lawn care services for residential and commercial properties.",
    slug: "green-gardens-landscapes"
  },
  {
    id: 5,
    name: "Homefix Repairs - Handyman Services Near Me",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
    rating: 4.6,
    reviews: 78,
    specialty: "Home Repair",
    location: "East London",
    description: "Professional handyman near me and home repair services in East London. Trusted handyman services and home maintenance solutions. House repair near me and home renovation services available. General handyman for all your repair needs.",
    slug: "homefix-repairs"
  },
  {
    id: 6,
    name: "London Build Pro - Best Home Builders Near Me",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
    rating: 4.9,
    reviews: 143,
    specialty: "Building",
    location: "Greater London",
    description: "Local builders near me specializing in new home builders and residential builders services. Trusted builders in my area and best home builders in Greater London. House builders near me providing commercial builders services. Premier building contractors for new builds and extensions.",
    slug: "london-build-pro"
  }
];

const MIN_RATING = 4.0;
const specialties = ["All", "Electrical", "Plumbing", "Roofing", "Gardening", "Home Repair", "Building"];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  
  const filteredContractors = contractors
    .filter(contractor => contractor.rating >= MIN_RATING)
    .filter(contractor => 
      selectedSpecialty === "All" || contractor.specialty === selectedSpecialty
    )
    .filter(contractor => 
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

      {/* Specialty Filter */}
      <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="animate-in">
          <h2 className="text-lg font-semibold text-gray-900">Filter by Service Type</h2>
          <RadioGroup 
            className="flex flex-wrap gap-4 mt-4"
            defaultValue="All"
            onValueChange={setSelectedSpecialty}
          >
            {specialties.map((specialty) => (
              <div key={specialty} className="flex items-center space-x-2">
                <RadioGroupItem value={specialty} id={specialty} />
                <Label htmlFor={specialty}>{specialty}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </section>

      {/* Featured Contractors */}
      <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="animate-in">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured Contractors</h2>
          <p className="mt-2 text-gray-500">Top-rated professionals in London (4★ and above)</p>
          
          <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredContractors.map((contractor) => (
              <Link 
                key={contractor.id} 
                to={`/${contractor.location.toLowerCase().replace(' ', '-')}/${contractor.specialty.toLowerCase()}/${contractor.slug}`}
              >
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
