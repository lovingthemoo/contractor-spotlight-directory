
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
    <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 via-white to-purple-50">
      <div className="animate-in max-w-3xl mx-auto text-center">
        <h2 
          className="text-xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600" 
          id="specialty-filter-heading"
        >
          Filter by Service Type
        </h2>
        <RadioGroup 
          className="flex flex-wrap justify-center gap-4 mt-4 [-webkit-user-select:text] [user-select:text]"
          defaultValue={selectedSpecialty}
          onValueChange={setSelectedSpecialty}
          aria-label={ariaLabel || "Service type filter"}
          aria-labelledby="specialty-filter-heading"
        >
          {specialties.map((specialty) => (
            <div 
              key={specialty} 
              className="flex items-center space-x-2 bg-white rounded-full shadow-sm px-4 py-2 hover:shadow-md transition-shadow duration-200"
            >
              <RadioGroupItem 
                value={specialty} 
                id={`specialty-${specialty.toLowerCase()}`}
                title={`Select ${specialty} specialty`}
                className="focus:ring-purple-500"
              />
              <Label 
                htmlFor={`specialty-${specialty.toLowerCase()}`}
                className="cursor-pointer hover:text-purple-600 transition-colors duration-200"
              >
                {specialty}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </section>
  );
};

export default SpecialtyFilter;
