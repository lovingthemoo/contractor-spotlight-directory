
import type { Database } from "@/integrations/supabase/types";

export type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

// Make sure all specialties are consistently cased and match the database enum
export const VALID_SPECIALTIES: ContractorSpecialty[] = [
  "Electrical",
  "Plumbing",
  "Roofing",
  "Building",
  "Home Repair",
  "Gardening",
  "Gas Engineer"
];

// Helper function to ensure specialty string matches valid types
export const normalizeSpecialty = (specialty: string): ContractorSpecialty | null => {
  const normalized = VALID_SPECIALTIES.find(
    s => s.toLowerCase() === specialty.toLowerCase()
  );
  return normalized || null;
};
