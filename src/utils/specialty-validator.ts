
import { ContractorSpecialty, VALID_SPECIALTIES } from "@/types/image-types";

export const isValidSpecialty = (specialty: string): specialty is ContractorSpecialty => {
  return VALID_SPECIALTIES.includes(specialty as ContractorSpecialty);
};
