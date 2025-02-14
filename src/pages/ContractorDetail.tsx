
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
