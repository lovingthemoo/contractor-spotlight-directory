
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformContractor } from "@/utils/contractor";
import { toast } from "sonner";
import { HeroImage } from "@/components/contractor/HeroImage";
import { CompanyOverview } from "@/components/contractor/CompanyOverview";
import { Reviews } from "@/components/contractor/Reviews";
import { ContactSidebar } from "@/components/contractor/ContactSidebar";
import { BusinessLocation } from "@/components/contractor/BusinessLocation";

const ContractorDetail = () => {
  const { slug } = useParams();
  
  const { data: contractor, isLoading, error } = useQuery({
    queryKey: ['contractor', slug],
    queryFn: async () => {
      console.log('Fetching contractor by slug:', slug);
      const { data, error } = await supabase
        .from('contractors')
        .select(`
          *,
          google_reviews,
          google_photos,
          project_types,
          certifications,
          insurance_details
        `)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching contractor:', error);
        toast.error('Failed to load contractor details');
        throw error;
      }
      
      if (!data) {
        throw new Error('Contractor not found');
      }
      
      console.log('Found contractor:', data);
      return transformContractor(data);
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" role="alert">
        <h1 className="text-2xl font-bold">Contractor not found</h1>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  const businessName = contractor.google_place_name || contractor.business_name;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6" aria-label="Back to listings">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Listings
          </Button>
        </Link>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Left 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            <HeroImage contractor={contractor} businessName={businessName} />
            <CompanyOverview contractor={contractor} businessName={businessName} />
            <BusinessLocation 
              address={contractor.location}
              google_formatted_address={contractor.google_formatted_address}
              google_place_id={contractor.google_place_id}
              google_photos={contractor.google_photos}
            />
            {contractor.google_reviews && <Reviews reviews={contractor.google_reviews} />}
          </div>

          {/* Contact Sidebar - Right Column */}
          <div className="lg:col-span-1">
            <ContactSidebar contractor={contractor} businessName={businessName} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorDetail;
