
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface ImportFileUploadProps {
  isUploading: boolean;
  showPreview: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImportFileUpload = ({ isUploading, showPreview, onFileUpload }: ImportFileUploadProps) => {
  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={onFileUpload}
          disabled={isUploading || showPreview}
          className="max-w-md"
        />
        {isUploading && (
          <div className="animate-spin">
            <Upload className="h-5 w-5" />
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Expected CSV headers: Business Name (required), Trading Name, Specialty, Phone, Email, Website, Location, 
        Postal Code, Description. Various formats accepted.
      </p>
    </Card>
  );
};

export default ImportFileUpload;
