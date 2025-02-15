import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImportFileUpload from "@/components/admin/ImportFileUpload";
import ImportLogs from "@/components/admin/ImportLogs";
import SpecialtyImageGrid from "@/components/admin/SpecialtyImageGrid";
import { useUploadLogs } from "@/hooks/useUploadLogs";
import { useSpecialtyImages } from "@/hooks/useSpecialtyImages";
import type { Database } from "@/integrations/supabase/types";

type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

const AdminImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const { logs, isLoadingLogs, deleteLog, clearOldLogs } = useUploadLogs();
  const { fetchHistory, fetchSpecialtyImagesForType } = useSpecialtyImages();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Handle file upload logic here
      // This is just a placeholder - implement your actual file upload logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowPreview(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
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

        <SpecialtyImageGrid 
          fetchHistory={fetchHistory}
          onFetchImages={fetchSpecialtyImagesForType}
        />

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
