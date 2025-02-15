
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ImportFileUpload from "@/components/admin/ImportFileUpload";
import ImportLogs from "@/components/admin/ImportLogs";
import { fetchSpecialtyImages } from "@/utils/image-fetching";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

const specialties: ContractorSpecialty[] = [
  "Electrical",
  "Plumbing",
  "Roofing",
  "Building",
  "Home Repair",
  "Gardening",
  "Construction",
  "Handyman"
];

const AdminImport = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState<ContractorSpecialty | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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

  // Query for specialty image fetch history
  const { data: fetchHistory = {} } = useQuery({
    queryKey: ['specialtyImageFetchHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialty_image_fetch_history')
        .select('*')
        .order('completed_at', { ascending: false });
      
      if (error) throw error;

      // Convert array to object keyed by specialty
      return (data || []).reduce((acc, curr) => {
        if (!acc[curr.specialty] || new Date(acc[curr.specialty].completed_at) < new Date(curr.completed_at)) {
          acc[curr.specialty] = curr;
        }
        return acc;
      }, {} as Record<ContractorSpecialty, typeof data[0]>);
    }
  });

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Handle file upload logic here
      // This is just a placeholder - implement your actual file upload logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      setShowPreview(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

      // Immediately refresh the logs
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
  const handleFetchSpecialtyImages = async (specialty: ContractorSpecialty) => {
    setIsProcessing(true);
    setCurrentSpecialty(specialty);
    try {
      // Create fetch history record
      const { error: historyError } = await supabase
        .from('specialty_image_fetch_history')
        .insert({
          specialty,
          started_at: new Date().toISOString(),
        });

      if (historyError) throw historyError;

      const result = await fetchSpecialtyImages(specialty);
      
      // Update fetch history record
      const { error: updateError } = await supabase
        .from('specialty_image_fetch_history')
        .update({
          completed_at: new Date().toISOString(),
          success: true,
          images_processed: result.processedCount || 0,
        })
        .eq('specialty', specialty)
        .is('completed_at', null);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Completed fetching images for ${specialty}`,
      });

      // Refresh the fetch history
      queryClient.invalidateQueries({ queryKey: ['specialtyImageFetchHistory'] });
    } catch (error) {
      console.error('Error fetching specialty images:', error);
      
      // Update fetch history with error
      await supabase
        .from('specialty_image_fetch_history')
        .update({
          completed_at: new Date().toISOString(),
          success: false,
          error_message: error.message,
        })
        .eq('specialty', specialty)
        .is('completed_at', null);

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

      // Immediately refresh the logs
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
          <ImportFileUpload 
            isUploading={isUploading}
            showPreview={showPreview}
            onFileUpload={handleFileUpload}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Fetch Specialty Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specialties.map((specialty) => {
              const lastFetch = fetchHistory[specialty];
              const lastCompleted = lastFetch?.completed_at ? 
                format(new Date(lastFetch.completed_at), 'dd/MM/yyyy HH:mm') : 
                'Never';
              
              return (
                <div key={specialty} className="flex flex-col gap-2">
                  <Button
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
                      <div className="flex flex-col gap-1">
                        <span>{specialty}</span>
                        <span className="text-xs text-gray-500">
                          Last completed: {lastCompleted}
                        </span>
                      </div>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Import Logs</h3>
          {isLoadingLogs ? (
            <div className="text-center py-4">Loading logs...</div>
          ) : (
            <ImportLogs logs={logs} onDelete={deleteLog} />
          )}
        </div>
      </div>
    </Card>
  );
};

export default AdminImport;
