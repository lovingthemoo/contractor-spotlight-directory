
import { useParams, Link, Navigate } from "react-router-dom";
import { MapPin, Star, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Contractor {
  id: string;
  business_name: string;
  images: string[];
  rating: number;
  review_count: number;
  specialty: string;
  location: string;
  description: string;
  slug: string;
}

const ContractorDetail = () => {
  const { region, service, companyName } = useParams();
  
  const { data: contractor, isLoading, error } = useQuery({
    queryKey: ['contractor', companyName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('slug', companyName)
        .eq('specialty', service?.toUpperCase())
        .single();
      
      if (error) throw error;
      return data as Contractor;
    },
    enabled: !!companyName && !!service
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    );
  }

  if (error || !contractor) {
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
              src={contractor.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e'}
              alt={contractor.business_name}
              className="object-cover w-full rounded-lg shadow-lg aspect-video"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {contractor.business_name}
              </h1>
              <div className="flex items-center mt-2 space-x-4">
                <Badge>{contractor.specialty}</Badge>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="ml-1 font-medium">{contractor.rating}</span>
                  <span className="ml-1 text-gray-500">
                    ({contractor.review_count} reviews)
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorDetail;
