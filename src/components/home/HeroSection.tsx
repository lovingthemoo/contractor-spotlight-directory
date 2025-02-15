
import SearchBar from "@/components/contractors/SearchBar";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const HeroSection = ({ searchQuery, setSearchQuery }: HeroSectionProps) => {
  return (
    <section 
      className="relative overflow-hidden bg-white"
      aria-labelledby="hero-title"
    >
      <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 id="hero-title" className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Find Trusted London
            <span className="block text-primary">Contractors</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl">
            Connect with verified contractors in London. Quality service, guaranteed satisfaction.
          </p>
          
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            aria-label="Search contractors"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
