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
          company_number: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          identity_verified: boolean | null
          images: string[] | null
          insurance_verified: boolean | null
          is_verified: boolean | null
          location: string
          meta_description: string | null
          meta_title: string | null
          opening_hours: Json | null
          phone: string | null
          postal_code: string | null
          rating: number | null
          review_count: number | null
          service_radius: number | null
          services_offered: string[] | null
          slug: string
          specialty: Database["public"]["Enums"]["contractor_specialty"]
          trading_name: string | null
          updated_at: string
          vat_number: string | null
          website_url: string | null
          years_in_business: number | null
        }
        Insert: {
          address_verified?: boolean | null
          business_name: string
          company_number?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          identity_verified?: boolean | null
          images?: string[] | null
          insurance_verified?: boolean | null
          is_verified?: boolean | null
          location: string
          meta_description?: string | null
          meta_title?: string | null
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          review_count?: number | null
          service_radius?: number | null
          services_offered?: string[] | null
          slug: string
          specialty: Database["public"]["Enums"]["contractor_specialty"]
          trading_name?: string | null
          updated_at?: string
          vat_number?: string | null
          website_url?: string | null
          years_in_business?: number | null
        }
        Update: {
          address_verified?: boolean | null
          business_name?: string
          company_number?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          identity_verified?: boolean | null
          images?: string[] | null
          insurance_verified?: boolean | null
          is_verified?: boolean | null
          location?: string
          meta_description?: string | null
          meta_title?: string | null
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          review_count?: number | null
          service_radius?: number | null
          services_offered?: string[] | null
          slug?: string
          specialty?: Database["public"]["Enums"]["contractor_specialty"]
          trading_name?: string | null
          updated_at?: string
          vat_number?: string | null
          website_url?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
