
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useUploadLogs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return {
    logs,
    isLoadingLogs,
    deleteLog,
    clearOldLogs
  };
};
