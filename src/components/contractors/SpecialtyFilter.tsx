
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SpecialtyFilterProps {
  specialties: string[];
  selectedSpecialty: string;
  setSelectedSpecialty: (specialty: string) => void;
}

const SpecialtyFilter = ({ specialties, selectedSpecialty, setSelectedSpecialty }: SpecialtyFilterProps) => {
  return (
    <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="animate-in">
        <h2 className="text-lg font-semibold text-gray-900">Filter by Service Type</h2>
        <RadioGroup 
          className="flex flex-wrap gap-4 mt-4"
          defaultValue={selectedSpecialty}
          onValueChange={setSelectedSpecialty}
          aria-label="Service type filter"
        >
          {specialties.map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2">
              <RadioGroupItem value={specialty} id={specialty} />
              <Label htmlFor={specialty}>{specialty}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </section>
  );
};

export default SpecialtyFilter;
