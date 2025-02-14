
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Database, Building2, Wrench, Leaf } from "lucide-react";
import { useState } from "react";
import ContractorsQueue from "@/components/admin/ContractorsQueue";
import EnrichmentLogs from "@/components/admin/EnrichmentLogs";

const AdminEnrichment = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const { data: contractors, isLoading: isLoadingData, refetch: refetchContractors } = useQuery({
    queryKey: ['contractors-enrichment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .or('needs_google_enrichment.eq.true,needs_image_enrichment.eq.true,needs_contact_enrichment.eq.true')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: enrichmentLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ['enrichment-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrichment_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const handleEnrichData = async (category: string) => {
    try {
      setIsLoading(category);
      
      console.log('Calling enrichment function with category:', category);
      
      const { data, error } = await supabase.functions.invoke('enrich-google-data', {
        body: { category },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (error) {
        console.error('Function error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to collect data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.error) {
        console.error('Data error:', data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to collect data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Data Collection Started",
        description: `Started collecting data for ${data.totalFound || 0} London ${category} providers.`,
      });

      await Promise.all([refetchContractors(), refetchLogs()]);
    } catch (error) {
      console.error('Error invoking function:', error);
      toast({
        title: "Error",
        description: "Failed to start data collection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('enrichment_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: "Log deleted",
        description: "The enrichment log has been removed.",
      });

      refetchLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the enrichment log.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex flex-col space-y-4 mb-4">
          <h2 className="text-2xl font-bold">Data Enrichment Queue</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => handleEnrichData('construction')} 
              disabled={isLoading !== null}
              className="flex-1"
            >
              <Building2 className="mr-2 h-4 w-4" />
              {isLoading === 'construction' ? "Collecting..." : "Collect Construction & Roofing"}
            </Button>
            <Button 
              onClick={() => handleEnrichData('maintenance')} 
              disabled={isLoading !== null}
              className="flex-1"
            >
              <Wrench className="mr-2 h-4 w-4" />
              {isLoading === 'maintenance' ? "Collecting..." : "Collect Plumbing & Electrical"}
            </Button>
            <Button 
              onClick={() => handleEnrichData('outdoor')} 
              disabled={isLoading !== null}
              className="flex-1"
            >
              <Leaf className="mr-2 h-4 w-4" />
              {isLoading === 'outdoor' ? "Collecting..." : "Collect Home Repair & Gardening"}
            </Button>
          </div>
        </div>
        <p className="text-gray-600">
          Service providers that need additional data or verification.
        </p>
      </div>

      <ContractorsQueue 
        contractors={contractors || []} 
        isLoading={isLoadingData} 
      />

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Enrichment Runs</h3>
        <EnrichmentLogs 
          logs={enrichmentLogs} 
          onDeleteLog={handleDeleteLog}
        />
      </div>
    </Card>
  );
};

export default AdminEnrichment;
