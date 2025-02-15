
import type { Database } from "@/integrations/supabase/types";

export type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

export const VALID_SPECIALTIES: ContractorSpecialty[] = [
  "Electrical", "Plumbing", "Roofing", "Building", 
  "Home Repair", "Gardening", "Construction", "Handyman"
];
