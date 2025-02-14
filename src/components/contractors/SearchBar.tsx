
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  "aria-label"?: string;
}

const SearchBar = ({ searchQuery, setSearchQuery, "aria-label": ariaLabel }: SearchBarProps) => {
  return (
    <form 
      className="flex items-center max-w-md mx-auto mt-8 overflow-hidden bg-white border rounded-full"
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <Search 
        className="w-5 h-5 mx-3 text-gray-400" 
        aria-hidden="true"
        aria-label="Search"
      />
      <Input
        type="search"
        id="contractor-search"
        name="search"
        placeholder="Enter contractor name, specialty, or location..."
        className="flex-1 border-0 focus-visible:ring-0 [-webkit-user-select:text] [user-select:text]"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label={ariaLabel || "Search contractors"}
      />
      <Badge variant="secondary" className="mr-2">
        <MapPin 
          className="w-4 h-4 mr-1" 
          aria-hidden="true"
          aria-label="Location"
        />
        <span>London</span>
      </Badge>
    </form>
  );
};

export default SearchBar;
