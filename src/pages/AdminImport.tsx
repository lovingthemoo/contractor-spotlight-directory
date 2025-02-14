import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ImportFileUpload from "@/components/admin/ImportFileUpload";
import ImportPreview from "@/components/admin/ImportPreview";
import ImportLogs from "@/components/admin/ImportLogs";

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
  const queryClient = useQueryClient();

  const { data: logs = [], refetch } = useQuery({
    queryKey: ['upload-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upload_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
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

    // Map common specialty terms to valid enum values with fuzzy matching
    const mapSpecialty = (specialty: string): string => {
      const normalizedSpecialty = specialty?.trim().toLowerCase() || '';
      
      // Define fuzzy matching patterns
      if (normalizedSpecialty.includes('electric')) return 'Electrical';
      if (normalizedSpecialty.includes('plumb')) return 'Plumbing';
      if (normalizedSpecialty.includes('roof')) return 'Roofing';
      if (normalizedSpecialty.includes('build') || 
          normalizedSpecialty.includes('construct') ||
          normalizedSpecialty.includes('contractor')) return 'Building';
      if (normalizedSpecialty.includes('repair') || 
          normalizedSpecialty.includes('fix') ||
          normalizedSpecialty.includes('maint')) return 'Home Repair';
      if (normalizedSpecialty.includes('garden') || 
          normalizedSpecialty.includes('landscape') ||
          normalizedSpecialty.includes('lawn')) return 'Gardening';
      if (normalizedSpecialty.includes('construct')) return 'Construction';
      if (normalizedSpecialty.includes('handy') || 
          normalizedSpecialty.includes('general') ||
          normalizedSpecialty.includes('odd job')) return 'Handyman';
      
      // Extended building-related terms
      const buildingTerms = [
        'build', 'contractor', 'construct', 'renovation',
        'remodel', 'carpenter', 'joiner', 'property',
        'home build', 'house build', 'extension'
      ];
      
      if (buildingTerms.some(term => normalizedSpecialty.includes(term))) {
        return 'Building';
      }

      return 'Handyman'; // Default fallback
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

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('upload_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: "Import log deleted",
        description: "The import log has been removed from the system.",
      });

      queryClient.invalidateQueries({ queryKey: ['upload-logs'] });
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the import log.",
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
        
        <ImportFileUpload
          isUploading={isUploading}
          showPreview={showPreview}
          onFileUpload={handleFileUpload}
        />

        {showPreview && (
          <ImportPreview
            previewData={previewData}
            onCancel={cancelPreview}
            onConfirm={handleConfirmImport}
          />
        )}

        <ImportLogs
          logs={logs}
          onDelete={handleDeleteLog}
        />
      </div>
    </div>
  );
};

export default AdminImport;
