
import { ContractorSpecialty, VALID_SPECIALTIES, normalizeSpecialty } from "@/types/image-types";

export const isValidSpecialty = (specialty: string): specialty is ContractorSpecialty => {
  const normalized = normalizeSpecialty(specialty);
  return normalized !== null;
};
