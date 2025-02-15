import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ImportFileUpload from "@/components/admin/ImportFileUpload";
import ImportLogs from "@/components/admin/ImportLogs";
import { fetchSpecialtyImages } from "@/utils/image-fetching";

const AdminImport = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for upload logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['uploadLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upload_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Delete log function
  const deleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('upload_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Log deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['uploadLogs'] });
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "Error",
        description: "Failed to delete log",
        variant: "destructive",
      });
    }
  };

  // Handle specialty image fetching
  const handleFetchSpecialtyImages = async (specialty: string) => {
    setIsProcessing(true);
    setCurrentSpecialty(specialty);
    try {
      await fetchSpecialtyImages(specialty as any);
      toast({
        title: "Success",
        description: `Started fetching images for ${specialty}`,
      });
    } catch (error) {
      console.error('Error fetching specialty images:', error);
      toast({
        title: "Error",
        description: `Failed to fetch images for ${specialty}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCurrentSpecialty(null);
    }
  };

  // Clear old logs function
  const clearOldLogs = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await supabase
        .from('upload_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      toast({
        title: "Success",
        description: "Old logs cleared successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['uploadLogs'] });
    } catch (error) {
      console.error('Error clearing old logs:', error);
      toast({
        title: "Error",
        description: "Failed to clear old logs",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Import & Image Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearOldLogs}
            className="text-red-500 hover:text-red-600"
          >
            Clear Old Logs
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Import Data</h3>
          <ImportFileUpload />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Fetch Specialty Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Electrical", "Plumbing", "Roofing", "Building", "Home Repair", "Gardening", "Construction", "Handyman"].map((specialty) => (
              <Button
                key={specialty}
                onClick={() => handleFetchSpecialtyImages(specialty)}
                disabled={isProcessing && currentSpecialty === specialty}
                variant="outline"
                className="h-auto py-4"
              >
                {isProcessing && currentSpecialty === specialty ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  specialty
                )}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Import Logs</h3>
          <ImportLogs logs={logs} onDelete={deleteLog} />
        </div>
      </div>
    </Card>
  );
};

export default AdminImport;
