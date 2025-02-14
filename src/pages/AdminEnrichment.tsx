
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminEnrichment = () => {
  const { data: contractors, isLoading } = useQuery({
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
        <h2 className="text-2xl font-bold mb-2">Data Enrichment Queue</h2>
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
