
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

export const specialties: ContractorSpecialty[] = [
  "Electrical",
  "Plumbing",
  "Roofing",
  "Building",
  "Home Repair",
  "Gardening",
  "Gas Engineer"
];

interface SpecialtyImageGridProps {
  fetchHistory: Partial<Record<ContractorSpecialty, any>>;
  onFetchImages: (specialty: ContractorSpecialty) => Promise<void>;
}

const SpecialtyImageGrid = ({ fetchHistory, onFetchImages }: SpecialtyImageGridProps) => {
  const [currentSpecialty, setCurrentSpecialty] = useState<ContractorSpecialty | null>(null);

  const handleFetchImages = async (specialty: ContractorSpecialty) => {
    setCurrentSpecialty(specialty);
    await onFetchImages(specialty);
    setCurrentSpecialty(null);
  };

  return (
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
                onClick={() => handleFetchImages(specialty)}
                disabled={currentSpecialty === specialty}
                variant="outline"
                className="h-auto py-4"
              >
                {currentSpecialty === specialty ? (
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
  );
};

export default SpecialtyImageGrid;
