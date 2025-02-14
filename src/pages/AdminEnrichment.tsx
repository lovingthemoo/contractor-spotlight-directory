
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
import { Database, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";

interface EnrichmentLog {
  id: string;
  created_at: string;
  status: string;
  businesses_found: number;
  businesses_processed: number;
  errors?: any;
  start_time?: string;
  end_time?: string;
}

const AdminEnrichment = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
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
      return data as EnrichmentLog[];
    },
  });

  const handleEnrichData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('enrich-google-data');
      
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
        description: `Started collecting data for ${data.totalFound || 0} businesses.`,
      });

      // Refetch both contractors and logs
      await Promise.all([refetchContractors(), refetchLogs()]);

    } catch (error) {
      console.error('Error invoking function:', error);
      toast({
        title: "Error",
        description: "Failed to start data collection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const formatDuration = (start?: string, end?: string) => {
    if (!start) return "Not started";
    if (!end) return "In progress...";
    
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return `${Math.round(duration / 1000)}s`;
  };

  if (isLoadingData) {
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
          <Button 
            onClick={handleEnrichData} 
            disabled={isLoading}
          >
            <Database className="mr-2 h-4 w-4" />
            {isLoading ? "Collecting Data..." : "Collect London Builders Data"}
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

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Enrichment Runs</h3>
        <div className="space-y-4">
          {enrichmentLogs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={log.status === 'completed' ? 'success' : 'secondary'}>
                      {log.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">
                      Found: {log.businesses_found}
                    </span>
                    <span className="text-sm text-gray-600">
                      Processed: {log.businesses_processed}
                    </span>
                    <span className="text-sm text-gray-600">
                      Duration: {formatDuration(log.start_time, log.end_time)}
                    </span>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Enrichment Log</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this enrichment log? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteLog(log.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
          {!enrichmentLogs.length && (
            <div className="text-center py-8 text-gray-500">
              No enrichment runs recorded yet
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AdminEnrichment;
