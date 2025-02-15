
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Award, Briefcase, CheckCircle2 } from "lucide-react";
import type { Contractor } from "@/types/contractor";

interface CompanyOverviewProps {
  contractor: Contractor;
  businessName: string;
}

export const CompanyOverview = ({ contractor, businessName }: CompanyOverviewProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {businessName}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-sm">
            {contractor.specialty}
          </Badge>
          {contractor.years_in_business && (
            <Badge variant="outline" className="text-sm">
              {contractor.years_in_business} Years in Business
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      {(contractor.website_description || contractor.description) && (
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-gray-600 leading-relaxed">
            {contractor.website_description || contractor.description}
          </p>
        </div>
      )}

      {/* Services & Expertise */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Project Types */}
        {contractor.project_types && contractor.project_types.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
              Project Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {contractor.project_types.map((type) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Certifications */}
        {contractor.certifications && contractor.certifications.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-500" />
              Certifications
            </h3>
            <div className="space-y-2">
              {contractor.certifications.map((cert) => (
                <div key={cert} className="flex items-center text-gray-600">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
