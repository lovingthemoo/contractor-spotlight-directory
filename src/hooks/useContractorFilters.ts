
import { useState } from "react";
import type { Contractor } from "@/types/contractor";

export const useContractorFilters = (contractors: Contractor[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");

  const getRatingThreshold = (filter: string): number => {
    switch (filter) {
      case "4.5+": return 4.5;
      case "4.0+": return 4.0;
      case "3.5+": return 3.5;
      case "3.0+": return 3.0;
      default: return 0;
    }
  };

  const filteredContractors = contractors
    .filter(contractor => {
      if (selectedSpecialty === "All") return true;
      
      const normalizedContractorSpecialty = contractor.specialty?.trim().toLowerCase();
      const normalizedSelectedSpecialty = selectedSpecialty.trim().toLowerCase();
      
      console.log('Comparing specialties:', {
        contractor: normalizedContractorSpecialty,
        selected: normalizedSelectedSpecialty,
        matches: normalizedContractorSpecialty === normalizedSelectedSpecialty
      });
      
      return normalizedContractorSpecialty === normalizedSelectedSpecialty;
    })
    .filter(contractor => 
      selectedRating === "All" || (contractor.rating && contractor.rating >= getRatingThreshold(selectedRating))
    )
    .filter(contractor => 
      contractor.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Debug logging
  console.log('Filtering details:', {
    totalContractors: contractors.length,
    filteredCount: filteredContractors.length,
    selectedSpecialty,
    uniqueSpecialties: [...new Set(contractors.map(c => c.specialty))],
  });

  return {
    searchQuery,
    setSearchQuery,
    selectedSpecialty,
    setSelectedSpecialty,
    selectedRating,
    setSelectedRating,
    filteredContractors
  };
};
