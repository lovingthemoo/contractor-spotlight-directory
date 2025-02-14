
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    name: "Elite Electrical Solutions",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e",
    rating: 4.8,
    reviews: 127,
    specialty: "Electrical",
    location: "Central London",
    description: "Expert electrical contractors specializing in residential and commercial installations, rewiring, and emergency repairs. Licensed and insured with 15+ years of experience."
  },
  {
    id: 2,
    name: "Thames Valley Plumbing",
    image: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13",
    rating: 4.9,
    reviews: 89,
    specialty: "Plumbing",
    location: "South London",
    description: "Professional plumbing services for all your needs. Specializing in emergency repairs, bathroom installations, and central heating systems. Available 24/7."
  },
  {
    id: 3,
    name: "Roofing Masters London",
    image: "https://images.unsplash.com/photo-1632759145355-8b8f6d37d27c",
    rating: 4.7,
    reviews: 156,
    specialty: "Roofing",
    location: "North London",
    description: "Expert roofing contractors providing comprehensive services including repairs, replacements, and maintenance. Fully insured with proven track record."
  },
  {
    id: 4,
    name: "Green Gardens & Landscapes",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
    rating: 4.8,
    reviews: 92,
    specialty: "Gardening",
    location: "West London",
    description: "Professional garden design and maintenance services. Specializing in landscape design, lawn care, and garden maintenance for residential and commercial properties."
  },
  {
    id: 5,
    name: "Homefix Repairs",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
    rating: 4.6,
    reviews: 78,
    specialty: "Home Repair",
    location: "East London",
    description: "Comprehensive home repair and maintenance services. From minor fixes to major renovations, we handle all aspects of home improvement."
  },
  {
    id: 6,
    name: "London Build Pro",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
    rating: 4.9,
    reviews: 143,
    specialty: "Building",
    location: "Greater London",
    description: "Premier building contractors specializing in new builds, extensions, and major renovations. Fully licensed and insured with outstanding project management."
  }
];

const ContractorDetail = () => {
  const { id } = useParams();
  const contractor = contractors.find(c => c.id === Number(id));

  if (!contractor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Contractor not found</h1>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>
        </Link>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <img
              src={contractor.image}
              alt={contractor.name}
              className="object-cover w-full rounded-lg shadow-lg aspect-video"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {contractor.name}
              </h1>
              <div className="flex items-center mt-2 space-x-4">
                <Badge>{contractor.specialty}</Badge>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="ml-1 font-medium">{contractor.rating}</span>
                  <span className="ml-1 text-gray-500">
                    ({contractor.reviews} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center mt-4 text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                {contractor.location}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900">About</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {contractor.description}
              </p>
            </div>
            
            {/* Additional sections can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorDetail;
