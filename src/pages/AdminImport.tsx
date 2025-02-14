
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertCircle, CheckCircle, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UploadLog {
  id: string;
  created_at: string;
  filename: string;
  success_count: number;
  error_count: number;
  errors: any;
  status: string;
}

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

const AdminImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const { data: logs = [], refetch } = useQuery({
    queryKey: ['upload-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upload_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as UploadLog[];
    }
  });

  const validateRecord = (record: any): PreviewData => {
    const data: PreviewData = {
      business_name: record.business_name || record.businessName || record.rgnuSb || record['Business Name'] || '',
      trading_name: record.trading_name || record.tradingName || record['Trading Name'],
      specialty: (record.specialty || record.speciality || record.hGz87c || record['Specialty'] || 'GENERAL')
        .toString().toUpperCase(),
      phone: record.phone || record.phoneNumber || record.hGz87c3 || record['Phone'],
      email: record.email || record['Email'],
      location: record.location || record.hGz87c2 || record['Location'] || 'London',
      isValid: true
    };

    if (!data.business_name) {
      data.isValid = false;
      data.error = 'Business name is required';
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      data.isValid = false;
      data.error = 'Invalid email format';
    }

    if (!['ELECTRICAL', 'PLUMBING', 'ROOFING', 'BUILDING', 'HOME REPAIR', 'GARDENING', 'CONSTRUCTION', 'HANDYMAN', 'GENERAL'].includes(data.specialty)) {
      data.isValid = false;
      data.error = 'Invalid specialty';
    }

    return data;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => {
        try {
          return JSON.parse(row);
        } catch {
          const values = row.split(',');
          const headers = ['business_name', 'trading_name', 'specialty', 'phone', 'email', 'website_url', 'location', 'postal_code', 'description'];
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i]?.trim() || '';
            return obj;
          }, {} as any);
        }
      });

      const validatedData = rows.filter(row => Object.keys(row).length > 0).map(validateRecord);
      setPreviewData(validatedData);
      setShowPreview(true);
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview failed",
        description: "There was an error previewing the CSV file.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData.length) return;

    setIsUploading(true);
    const formData = new FormData();
    const jsonData = JSON.stringify(previewData);
    const blob = new Blob([jsonData], { type: 'application/json' });
    formData.append('file', blob, 'data.json');

    try {
      const response = await supabase.functions.invoke('import-csv', {
        body: formData,
      });

      if (response.error) throw response.error;

      const result = response.data;
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${result.successful} records. ${result.failed} failed.`,
        variant: result.failed === 0 ? "default" : "destructive"
      });

      setShowPreview(false);
      setPreviewData([]);
      refetch();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Import failed",
        description: "There was an error importing the data.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const cancelPreview = () => {
    setShowPreview(false);
    setPreviewData([]);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Import Contractors</h1>
        
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
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
            CSV should include: business_name, trading_name, specialty, phone, email, website_url, 
            location, postal_code, description
          </p>
        </Card>

        {showPreview && (
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preview Data</h2>
              <div className="flex gap-2">
                <Button onClick={cancelPreview} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmImport} 
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
                      <div>
                        <p className="font-medium">{data.business_name || 'No Business Name'}</p>
                        <p className="text-sm text-gray-600">
                          {data.location} | {data.specialty}
                        </p>
                      </div>
                      {data.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="flex items-center text-red-500">
                          <AlertCircle className="h-5 w-5 mr-2" />
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
        )}

        <h2 className="text-xl font-semibold mb-4">Recent Imports</h2>
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{log.filename}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {log.success_count}
                  </div>
                  {log.error_count > 0 && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {log.error_count}
                    </div>
                  )}
                </div>
              </div>
              {log.errors && (
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log('Error details:', log.errors)}
                  >
                    View Errors
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminImport;
