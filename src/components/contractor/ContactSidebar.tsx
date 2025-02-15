
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Globe, Calendar } from "lucide-react";
import type { Contractor } from "@/types/contractor";
import { BusinessLocation } from "./BusinessLocation";

interface ContactSidebarProps {
  contractor: Contractor;
  businessName: string;
}

export const ContactSidebar = ({ contractor, businessName }: ContactSidebarProps) => {
  const address = contractor.google_formatted_address || contractor.location || 'London';
  const phone = contractor.google_formatted_phone || contractor.phone;

  return (
    <div className="sticky top-8 space-y-6">
      <Card className="p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-3 text-purple-500" />
            <span>{address}</span>
          </div>
          
          {phone && (
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-3 text-purple-500" />
              <a href={`tel:${phone}`} className="hover:text-purple-600 transition-colors">
                {phone}
              </a>
            </div>
          )}
          
          {contractor.email && (
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3 text-purple-500" />
              <a 
                href={`mailto:${contractor.email}`}
                className="hover:text-purple-600 transition-colors"
              >
                {contractor.email}
              </a>
            </div>
          )}
          
          {contractor.website_url && (
            <div className="flex items-center text-gray-600">
              <Globe className="w-5 h-5 mr-3 text-purple-500" />
              <a 
                href={contractor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-600 transition-colors"
              >
                Visit Website
              </a>
            </div>
          )}

          {contractor.founded_year && (
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-3 text-purple-500" />
              <span>Founded in {contractor.founded_year}</span>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {(phone || contractor.email) && (
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              if (phone) {
                window.location.href = `tel:${phone}`;
              } else if (contractor.email) {
                window.location.href = `mailto:${contractor.email}`;
              }
            }}
          >
            Contact Now
          </Button>
        )}
      </Card>

      {/* Map */}
      <BusinessLocation address={address} />

      {/* Additional Photos */}
      {contractor.google_photos && contractor.google_photos.length > 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Gallery</h3>
          <div className="grid grid-cols-2 gap-2">
            {contractor.google_photos.slice(1, 5).map((photo, index) => (
              <img
                key={index}
                src={photo.url}
                alt={`Project by ${businessName}`}
                className="w-full h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
