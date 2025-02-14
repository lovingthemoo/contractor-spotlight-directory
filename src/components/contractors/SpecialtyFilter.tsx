
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SpecialtyFilterProps {
  specialties: string[];
  selectedSpecialty: string;
  setSelectedSpecialty: (specialty: string) => void;
  "aria-label"?: string;
}

const SpecialtyFilter = ({ 
  specialties, 
  selectedSpecialty, 
  setSelectedSpecialty,
  "aria-label": ariaLabel 
}: SpecialtyFilterProps) => {
  return (
    <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="animate-in">
        <h2 className="text-lg font-semibold text-gray-900" id="specialty-filter-heading">
          Filter by Service Type
        </h2>
        <RadioGroup 
          className="flex flex-wrap gap-4 mt-4"
          defaultValue={selectedSpecialty}
          onValueChange={setSelectedSpecialty}
          aria-label={ariaLabel || "Service type filter"}
          aria-labelledby="specialty-filter-heading"
        >
          {specialties.map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={specialty} 
                id={`specialty-${specialty.toLowerCase()}`}
              />
              <Label htmlFor={`specialty-${specialty.toLowerCase()}`}>{specialty}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </section>
  );
};

export default SpecialtyFilter;
