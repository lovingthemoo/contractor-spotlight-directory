export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contractor_reviews: {
        Row: {
          contractor_id: string
          created_at: string
          id: string
          rating: number
          response_date: string | null
          response_text: string | null
          review_text: string | null
          reviewer_name: string
          verified_customer: boolean | null
        }
        Insert: {
          contractor_id: string
          created_at?: string
          id?: string
          rating: number
          response_date?: string | null
          response_text?: string | null
          review_text?: string | null
          reviewer_name: string
          verified_customer?: boolean | null
        }
        Update: {
          contractor_id?: string
          created_at?: string
          id?: string
          rating?: number
          response_date?: string | null
          response_text?: string | null
          review_text?: string | null
          reviewer_name?: string
          verified_customer?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_reviews_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          address_verified: boolean | null
          business_name: string
          certifications: string[] | null
          company_number: string | null
          created_at: string
          description: string | null
          email: string | null
          founded_year: number | null
          google_business_scopes: string[] | null
          google_formatted_address: string | null
          google_formatted_phone: string | null
          google_photos: Json | null
          google_place_id: string
          google_place_name: string | null
          google_reviews: Json | null
          id: string
          identity_verified: boolean | null
          images: string[] | null
          insurance_details: Json | null
          insurance_verified: boolean | null
          is_admin: boolean | null
          is_verified: boolean | null
          last_enrichment_attempt: string | null
          location: string
          maximum_project_value: number | null
          meta_description: string | null
          meta_title: string | null
          minimum_project_value: number | null
          needs_contact_enrichment: boolean | null
          needs_google_enrichment: boolean | null
          needs_image_enrichment: boolean | null
          needs_photo_enrichment: boolean | null
          opening_hours: Json | null
          phone: string | null
          postal_code: string | null
          project_types: string[] | null
          rating: number | null
          review_count: number | null
          service_area: string[] | null
          service_radius: number | null
          services_offered: string[] | null
          slug: string
          specialty: Database["public"]["Enums"]["contractor_specialty"]
          trading_name: string | null
          typical_project_size: string | null
          updated_at: string
          vat_number: string | null
          website_description: string | null
          website_url: string | null
          years_in_business: number | null
        }
        Insert: {
          address_verified?: boolean | null
          business_name: string
          certifications?: string[] | null
          company_number?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          founded_year?: number | null
          google_business_scopes?: string[] | null
          google_formatted_address?: string | null
          google_formatted_phone?: string | null
          google_photos?: Json | null
          google_place_id: string
          google_place_name?: string | null
          google_reviews?: Json | null
          id?: string
          identity_verified?: boolean | null
          images?: string[] | null
          insurance_details?: Json | null
          insurance_verified?: boolean | null
          is_admin?: boolean | null
          is_verified?: boolean | null
          last_enrichment_attempt?: string | null
          location: string
          maximum_project_value?: number | null
          meta_description?: string | null
          meta_title?: string | null
          minimum_project_value?: number | null
          needs_contact_enrichment?: boolean | null
          needs_google_enrichment?: boolean | null
          needs_image_enrichment?: boolean | null
          needs_photo_enrichment?: boolean | null
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          project_types?: string[] | null
          rating?: number | null
          review_count?: number | null
          service_area?: string[] | null
          service_radius?: number | null
          services_offered?: string[] | null
          slug: string
          specialty: Database["public"]["Enums"]["contractor_specialty"]
          trading_name?: string | null
          typical_project_size?: string | null
          updated_at?: string
          vat_number?: string | null
          website_description?: string | null
          website_url?: string | null
          years_in_business?: number | null
        }
        Update: {
          address_verified?: boolean | null
          business_name?: string
          certifications?: string[] | null
          company_number?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          founded_year?: number | null
          google_business_scopes?: string[] | null
          google_formatted_address?: string | null
          google_formatted_phone?: string | null
          google_photos?: Json | null
          google_place_id?: string
          google_place_name?: string | null
          google_reviews?: Json | null
          id?: string
          identity_verified?: boolean | null
          images?: string[] | null
          insurance_details?: Json | null
          insurance_verified?: boolean | null
          is_admin?: boolean | null
          is_verified?: boolean | null
          last_enrichment_attempt?: string | null
          location?: string
          maximum_project_value?: number | null
          meta_description?: string | null
          meta_title?: string | null
          minimum_project_value?: number | null
          needs_contact_enrichment?: boolean | null
          needs_google_enrichment?: boolean | null
          needs_image_enrichment?: boolean | null
          needs_photo_enrichment?: boolean | null
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          project_types?: string[] | null
          rating?: number | null
          review_count?: number | null
          service_area?: string[] | null
          service_radius?: number | null
          services_offered?: string[] | null
          slug?: string
          specialty?: Database["public"]["Enums"]["contractor_specialty"]
          trading_name?: string | null
          typical_project_size?: string | null
          updated_at?: string
          vat_number?: string | null
          website_description?: string | null
          website_url?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      enrichment_logs: {
        Row: {
          businesses_found: number | null
          businesses_processed: number | null
          created_at: string
          end_time: string | null
          errors: Json | null
          id: string
          start_time: string | null
          status: string
        }
        Insert: {
          businesses_found?: number | null
          businesses_processed?: number | null
          created_at?: string
          end_time?: string | null
          errors?: Json | null
          id?: string
          start_time?: string | null
          status?: string
        }
        Update: {
          businesses_found?: number | null
          businesses_processed?: number | null
          created_at?: string
          end_time?: string | null
          errors?: Json | null
          id?: string
          start_time?: string | null
          status?: string
        }
        Relationships: []
      }
      upload_logs: {
        Row: {
          created_at: string
          enrichment_end_time: string | null
          enrichment_scope: Json | null
          enrichment_start_time: string | null
          error_count: number | null
          errors: Json | null
          filename: string
          id: string
          status: string
          success_count: number | null
        }
        Insert: {
          created_at?: string
          enrichment_end_time?: string | null
          enrichment_scope?: Json | null
          enrichment_start_time?: string | null
          error_count?: number | null
          errors?: Json | null
          filename: string
          id?: string
          status: string
          success_count?: number | null
        }
        Update: {
          created_at?: string
          enrichment_end_time?: string | null
          enrichment_scope?: Json | null
          enrichment_start_time?: string | null
          error_count?: number | null
          errors?: Json | null
          filename?: string
          id?: string
          status?: string
          success_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_non_null_fields: {
        Args: {
          contractor: unknown
        }
        Returns: number
      }
      get_random_description: {
        Args: {
          descriptions: string[]
        }
        Returns: string
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_super_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin"
      contractor_specialty:
        | "Electrical"
        | "Plumbing"
        | "Roofing"
        | "Building"
        | "Home Repair"
        | "Gardening"
        | "Construction"
        | "Handyman"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
