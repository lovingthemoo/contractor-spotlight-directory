import { useParams, Link, Navigate } from "react-router-dom";
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

const ContractorDetail = () => {
  const { region, service, companyName, id } = useParams();
  
  // Handle old URL format and redirect
  if (id) {
    const contractor = contractors.find(c => c.id === Number(id));
    if (contractor) {
      const region = contractor.location.toLowerCase().replace(' ', '-');
      const service = contractor.specialty.toLowerCase();
      return <Navigate to={`/${region}/${service}/${contractor.slug}`} replace />;
    }
  }

  // Handle new URL format
  const contractor = contractors.find(c => 
    c.slug === companyName && 
    c.specialty.toLowerCase() === service &&
    c.location.toLowerCase().replace(' ', '-') === region
  );

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
