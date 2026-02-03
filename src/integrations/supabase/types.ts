export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          attendees: number | null
          availability_id: string
          created_at: string
          event_location: string | null
          event_name: string
          event_type: string | null
          id: string
          notes: string | null
          organizer_email: string | null
          organizer_id: string
          organizer_name: string | null
          organizer_phone: string | null
          speaker_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          attendees?: number | null
          availability_id: string
          created_at?: string
          event_location?: string | null
          event_name: string
          event_type?: string | null
          id?: string
          notes?: string | null
          organizer_email?: string | null
          organizer_id: string
          organizer_name?: string | null
          organizer_phone?: string | null
          speaker_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          attendees?: number | null
          availability_id?: string
          created_at?: string
          event_location?: string | null
          event_name?: string
          event_type?: string | null
          id?: string
          notes?: string | null
          organizer_email?: string | null
          organizer_id?: string
          organizer_name?: string | null
          organizer_phone?: string | null
          speaker_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "speaker_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          event_date: string | null
          id: string
          message: string
          name: string
          organizer_id: string | null
          phone: string | null
          speaker_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_date?: string | null
          id?: string
          message: string
          name: string
          organizer_id?: string | null
          phone?: string | null
          speaker_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_date?: string | null
          id?: string
          message?: string
          name?: string
          organizer_id?: string | null
          phone?: string | null
          speaker_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_booking_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_booking_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_booking_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approval_status: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_speakers: {
        Row: {
          created_at: string
          id: string
          speaker_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          speaker_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          speaker_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_speakers_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      speaker_availability: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          speaker_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          speaker_id: string
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          speaker_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaker_availability_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      speakers: {
        Row: {
          accommodation_charge: number | null
          approval_status: string | null
          base_district: string | null
          bio: string | null
          category: string
          created_at: string
          experience_years: number | null
          id: string
          image_url: string | null
          includes_travel_local: boolean | null
          is_instant_book: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          location: string
          name: string
          price_max: number | null
          price_min: number | null
          rating: number | null
          review_count: number | null
          tags: string[] | null
          title: string
          topics: string[] | null
          total_events: number | null
          travel_charge: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation_charge?: number | null
          approval_status?: string | null
          base_district?: string | null
          bio?: string | null
          category: string
          created_at?: string
          experience_years?: number | null
          id?: string
          image_url?: string | null
          includes_travel_local?: boolean | null
          is_instant_book?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          location: string
          name: string
          price_max?: number | null
          price_min?: number | null
          rating?: number | null
          review_count?: number | null
          tags?: string[] | null
          title: string
          topics?: string[] | null
          total_events?: number | null
          travel_charge?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation_charge?: number | null
          approval_status?: string | null
          base_district?: string | null
          bio?: string | null
          category?: string
          created_at?: string
          experience_years?: number | null
          id?: string
          image_url?: string | null
          includes_travel_local?: boolean | null
          is_instant_book?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          location?: string
          name?: string
          price_max?: number | null
          price_min?: number | null
          rating?: number | null
          review_count?: number | null
          tags?: string[] | null
          title?: string
          topics?: string[] | null
          total_events?: number | null
          travel_charge?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_sample_availability: {
        Args: { _speaker_id: string }
        Returns: undefined
      }
      get_speaker_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "organizer" | "speaker" | "admin"
      booking_status: "available" | "booked" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["organizer", "speaker", "admin"],
      booking_status: ["available", "booked", "pending"],
    },
  },
} as const
