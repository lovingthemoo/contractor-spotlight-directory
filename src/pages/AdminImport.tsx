
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

// Define common header variations for automatic mapping
const headerMappings: Record<string, string[]> = {
  business_name: ['business name', 'businessname', 'company', 'company name', 'name', 'business', 'rgnusb', 'business_name', 'company_name'],
  trading_name: ['trading name', 'tradingname', 'trade name', 'tradename', 'trading_name', 'trade_name'],
  specialty: ['specialty', 'speciality', 'trade', 'service', 'type', 'hgz87c', 'business_type', 'contractor_type'],
  phone: ['phone', 'telephone', 'contact', 'phone number', 'tel', 'mobile', 'hgz87c3', 'phone_number', 'contact_number'],
  email: ['email', 'e-mail', 'mail', 'contact email', 'contact_email', 'email_address'],
  website_url: ['website', 'url', 'web', 'website url', 'site', 'keychainify-checked href', 'website_url', 'web_address'],
  location: ['location', 'city', 'area', 'region', 'address', 'hgz87c2', 'town', 'county'],
  postal_code: ['postal code', 'postcode', 'zip', 'zip code', 'post code', 'postal_code', 'zip_code'],
  description: ['description', 'about', 'details', 'info', 'summary', 'business_description']
};

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

  // Find the correct field name based on the header mappings
  const findMatchingField = (header: string): string | null => {
    const normalizedHeader = header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    
    for (const [field, variations] of Object.entries(headerMappings)) {
      const normalizedVariations = variations.map(v => 
        v.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
      );
      
      if (normalizedVariations.includes(normalizedHeader)) {
        return field;
      }
    }
    
    // Log unmapped header for debugging
    console.log('Unmapped header:', header, 'Normalized:', normalizedHeader);
    return null;
  };

  const validateRecord = (record: any): PreviewData => {
    console.log('Processing record:', record);
    
    const mappedRecord: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(record)) {
      const mappedField = findMatchingField(key);
      if (mappedField) {
        mappedRecord[mappedField] = value;
      }
    }
    
    console.log('Mapped record:', mappedRecord);

    // Map common specialty terms to valid enum values
    const mapSpecialty = (specialty: string): string => {
      const normalizedSpecialty = specialty.trim().toLowerCase();
      const specialtyMap: Record<string, string> = {
        'electrical': 'Electrical',
        'electrician': 'Electrical',
        'plumbing': 'Plumbing',
        'plumber': 'Plumbing',
        'roofing': 'Roofing',
        'roofer': 'Roofing',
        'building': 'Building',
        'builder': 'Building',
        'home repair': 'Home Repair',
        'repairs': 'Home Repair',
        'gardening': 'Gardening',
        'gardener': 'Gardening',
        'landscape': 'Gardening',
        'construction': 'Construction',
        'handyman': 'Handyman',
        'general': 'Handyman'  // Map general to Handyman as default
      };

      return specialtyMap[normalizedSpecialty] || 'Handyman';
    };

    const data: PreviewData = {
      business_name: mappedRecord.business_name?.trim() || '',
      trading_name: mappedRecord.trading_name?.trim() || null,
      specialty: mapSpecialty(mappedRecord.specialty || 'Handyman'),
      phone: mappedRecord.phone?.trim() || null,
      email: mappedRecord.email?.trim() || null,
      location: mappedRecord.location?.trim() || 'London',
      isValid: true
    };

    if (!data.business_name || data.business_name.trim() === '') {
      data.isValid = false;
      data.error = 'Business name is required';
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      data.isValid = false;
      data.error = 'Invalid email format';
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
      const lines = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);
      
      const headers = lines[0].split(',').map(h => h.trim());
      console.log('Original headers:', headers); // Debug log
      
      // Map headers to database fields
      const mappedHeaders = headers.map(header => {
        const mappedField = findMatchingField(header);
        console.log(`Mapping header "${header}" to "${mappedField}"`); // Debug log
        return mappedField || header;
      });
      
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const record: Record<string, string> = {};
        
        mappedHeaders.forEach((header, index) => {
          if (values[index]) {
            record[header] = values[index];
          }
        });
        
        return record;
      });

      console.log('Processed rows:', rows); // Debug log

      const validatedData = rows
        .filter(row => Object.keys(row).length > 0)
        .map(validateRecord);

      setPreviewData(validatedData);
      setShowPreview(true);

      // Show header mapping results
      const unmappedHeaders = headers.filter(h => !findMatchingField(h));
      if (unmappedHeaders.length > 0) {
        console.log('Unmapped headers:', unmappedHeaders); // Debug log
        toast({
          title: "Some headers couldn't be mapped",
          description: `Unmapped headers: ${unmappedHeaders.join(', ')}. They will be ignored.`,
          variant: "default"
        });
      }
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
    <div className="p-8 max-w-[100vw] overflow-x-hidden">
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
            Expected CSV headers: Business Name (required), Trading Name, Specialty, Phone, Email, Website, Location, 
            Postal Code, Description. Various formats accepted.
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
