
import ContractorCard from "@/components/contractors/ContractorCard";
import type { Contractor } from "@/types/contractor";

interface ContractorsListProps {
  contractors: Contractor[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  selectedSpecialty: string;
  selectedRating: string;
}

const ContractorsList = ({ 
  contractors, 
  isLoading, 
  error, 
  searchQuery, 
  selectedSpecialty, 
  selectedRating 
}: ContractorsListProps) => {
  return (
    <section 
      className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8"
      aria-labelledby="featured-contractors-title"
    >
      <div>
        <h2 id="featured-contractors-title" className="text-2xl font-bold tracking-tight text-gray-900">
          {selectedSpecialty === "All" ? "Featured Contractors" : `${selectedSpecialty} Contractors`}
        </h2>
        <p className="mt-2 text-gray-500">
          {isLoading ? 'Loading top rated professionals...' : 'Top rated professionals in London'}
        </p>
        
        {isLoading && (
          <div className="text-center py-12" role="status">
            <div 
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              aria-label="Loading contractors"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500" role="alert">
            <p>Failed to load contractors. Please try again later.</p>
            <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        )}

        {!isLoading && !error && contractors.length === 0 && (
          <div className="text-center py-12 text-gray-500" role="status">
            {searchQuery || selectedSpecialty !== "All" || selectedRating !== "All"
              ? "No contractors found matching your criteria."
              : "No contractors available at the moment."}
          </div>
        )}
        
        <div 
          className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3"
          aria-label="Contractors list"
        >
          {contractors.map((contractor) => (
            <ContractorCard
              key={contractor.id}
              contractor={contractor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContractorsList;
