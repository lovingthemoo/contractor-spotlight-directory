
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "lucide-react";

const AdminEnrichment = () => {
  const { toast } = useToast();
  const { data: contractors, isLoading, refetch } = useQuery({
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

  const handleEnrichData = async () => {
    try {
      const { error } = await supabase.functions.invoke('enrich-google-data');
      
      if (error) throw error;

      toast({
        title: "Data Collection Started",
        description: "The system is now collecting data for high-rated London builders.",
      });

      // Refetch the data after a short delay to show new entries
      setTimeout(() => {
        refetch();
      }, 5000);

    } catch (error) {
      console.error('Error invoking function:', error);
      toast({
        title: "Error",
        description: "Failed to start data collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Data Enrichment Queue</h2>
          <Button onClick={handleEnrichData}>
            <Database className="mr-2 h-4 w-4" />
            Collect London Builders Data
          </Button>
        </div>
        <p className="text-gray-600">
          Contractors that need additional data or verification.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business Name</TableHead>
            <TableHead>Missing Data</TableHead>
            <TableHead>Last Attempt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contractors?.map((contractor) => (
            <TableRow key={contractor.id}>
              <TableCell className="font-medium">
                {contractor.business_name}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
                  {contractor.needs_google_enrichment && (
                    <Badge variant="secondary">Google Data</Badge>
                  )}
                  {contractor.needs_image_enrichment && (
                    <Badge variant="secondary">Images</Badge>
                  )}
                  {contractor.needs_contact_enrichment && (
                    <Badge variant="secondary">Contact Info</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {contractor.last_enrichment_attempt 
                  ? new Date(contractor.last_enrichment_attempt).toLocaleDateString()
                  : 'Never'}
              </TableCell>
            </TableRow>
          ))}
          {!contractors?.length && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                No contractors need data enrichment at this time
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default AdminEnrichment;
