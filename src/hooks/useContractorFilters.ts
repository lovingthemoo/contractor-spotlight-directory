
import { useState } from "react";
import type { Contractor } from "@/types/contractor";
import { normalizeSpecialty } from "@/types/image-types";

export const useContractorFilters = (contractors: Contractor[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedReviews, setSelectedReviews] = useState("All");

  const getRatingThreshold = (filter: string): number => {
    switch (filter) {
      case "4.5+": return 4.5;
      case "4.0+": return 4.0;
      case "3.5+": return 3.5;
      case "3.0+": return 3.0;
      default: return 0;
    }
  };

  const getReviewRange = (filter: string): [number, number] => {
    switch (filter) {
      case "0-5": return [0, 5];
      case "5-10": return [5, 10];
      case "10+": return [10, Infinity];
      default: return [0, Infinity];
    }
  };

  const filteredContractors = contractors
    .filter(contractor => {
      if (selectedSpecialty === "All") return true;
      
      const normalizedSelected = normalizeSpecialty(selectedSpecialty);
      const normalizedContractor = contractor.specialty ? normalizeSpecialty(contractor.specialty) : null;
      
      const matches = normalizedSelected === normalizedContractor;
      
      console.log('Comparing specialties:', {
        contractor: normalizedContractor,
        selected: normalizedSelected,
        matches,
        originalContractor: contractor.specialty,
        originalSelected: selectedSpecialty
      });
      
      return matches;
    })
    .filter(contractor => 
      selectedRating === "All" || (contractor.rating && contractor.rating >= getRatingThreshold(selectedRating))
    )
    .filter(contractor => {
      if (selectedReviews === "All") return true;
      const [min, max] = getReviewRange(selectedReviews);
      const reviewCount = contractor.review_count || 0;
      return reviewCount >= min && reviewCount < max;
    })
    .filter(contractor => 
      contractor.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return {
    searchQuery,
    setSearchQuery,
    selectedSpecialty,
    setSelectedSpecialty,
    selectedRating,
    setSelectedRating,
    selectedReviews,
    setSelectedReviews,
    filteredContractors
  };
};
