
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ContractorsQueueProps {
  contractors: any[];
  isLoading: boolean;
}

const ContractorsQueue = ({ contractors, isLoading }: ContractorsQueueProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    );
  }

  return (
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
                ? formatDistanceToNow(new Date(contractor.last_enrichment_attempt), { addSuffix: true })
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
  );
};

export default ContractorsQueue;
