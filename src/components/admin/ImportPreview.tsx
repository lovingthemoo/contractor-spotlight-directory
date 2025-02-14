
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

interface PreviewData {
  business_name: string;
  trading_name?: string;
  specialty: string;
  phone?: string;
  email?: string;
  location: string;
  isValid: boolean;
  error?: string;
}

interface ImportPreviewProps {
  previewData: PreviewData[];
  onCancel: () => void;
  onConfirm: () => void;
}

const ImportPreview = ({ previewData, onCancel, onConfirm }: ImportPreviewProps) => {
  return (
    <Card className="p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Preview Data</h2>
        <div className="flex gap-2">
          <Button onClick={onCancel} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={!previewData.some(d => d.isValid)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Confirm Import
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4">
          {previewData.map((data, index) => (
            <div key={index} className={`p-4 mb-2 rounded-lg ${data.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex justify-between items-start">
                <div className="overflow-hidden">
                  <p className="font-medium">{data.business_name || 'No Business Name'}</p>
                  <p className="text-sm text-gray-600">
                    {data.location} | {data.specialty}
                  </p>
                  {data.email && (
                    <p className="text-sm text-gray-600">{data.email}</p>
                  )}
                  {data.phone && (
                    <p className="text-sm text-gray-600">{data.phone}</p>
                  )}
                </div>
                {data.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <div className="flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{data.error}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <p className="mt-4 text-sm text-gray-500">
        Valid records: {previewData.filter(d => d.isValid).length} / {previewData.length}
      </p>
    </Card>
  );
};

export default ImportPreview;
