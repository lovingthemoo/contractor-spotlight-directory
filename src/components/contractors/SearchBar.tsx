
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <div className="flex items-center max-w-md mx-auto mt-8 overflow-hidden bg-white border rounded-full">
      <Search className="w-5 h-5 mx-3 text-gray-400" aria-hidden="true" />
      <Input
        type="text"
        placeholder="Search contractors..."
        className="flex-1 border-0 focus-visible:ring-0"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search contractors"
      />
      <Badge variant="secondary" className="mr-2">
        <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
        London
      </Badge>
    </div>
  );
};

export default SearchBar;
