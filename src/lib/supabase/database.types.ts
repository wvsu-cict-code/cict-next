export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      departments: {
        Row: {
          created_at: string;
          logo_anchor_x: number;
          logo_anchor_y: number;
          name: string;
          side: string;
          slug: string;
          sort_order: number;
          updated_at: string;
          x: number;
          y: number;
          zoom_scale: number;
        };
        Insert: {
          created_at?: string;
          logo_anchor_x?: number;
          logo_anchor_y?: number;
          name: string;
          side?: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
          x?: number;
          y?: number;
          zoom_scale?: number;
        };
        Update: {
          created_at?: string;
          logo_anchor_x?: number;
          logo_anchor_y?: number;
          name?: string;
          side?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
          x?: number;
          y?: number;
          zoom_scale?: number;
        };
        Relationships: [];
      };
      events: {
        Row: {
          all_day: boolean;
          body: string;
          cover_image_url: string | null;
          created_at: string;
          ends_at: string | null;
          id: string;
          location: string | null;
          photos: Json;
          slug: string;
          starts_at: string;
          status: Database["public"]["Enums"]["post_status"];
          summary: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          all_day?: boolean;
          body?: string;
          cover_image_url?: string | null;
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          location?: string | null;
          photos?: Json;
          slug: string;
          starts_at: string;
          status?: Database["public"]["Enums"]["post_status"];
          summary?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          all_day?: boolean;
          body?: string;
          cover_image_url?: string | null;
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          location?: string | null;
          photos?: Json;
          slug?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["post_status"];
          summary?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faculty_members: {
        Row: {
          created_at: string;
          department_slug: string;
          description: string;
          id: string;
          image_url: string | null;
          name: string;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          department_slug: string;
          description?: string;
          id?: string;
          image_url?: string | null;
          name: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          department_slug?: string;
          description?: string;
          id?: string;
          image_url?: string | null;
          name?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "faculty_members_department_slug_fkey";
            columns: ["department_slug"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["slug"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          kind: Database["public"]["Enums"]["notification_kind"];
          read_at: string | null;
          reason: string | null;
          user_id: string;
          work_id: string | null;
          work_title: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind: Database["public"]["Enums"]["notification_kind"];
          read_at?: string | null;
          reason?: string | null;
          user_id: string;
          work_id?: string | null;
          work_title: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["notification_kind"];
          read_at?: string | null;
          reason?: string | null;
          user_id?: string;
          work_id?: string | null;
          work_title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_work_id_fkey";
            columns: ["work_id"];
            isOneToOne: false;
            referencedRelation: "student_works";
            referencedColumns: ["id"];
          },
        ];
      };
      pages: {
        Row: {
          body: string;
          created_at: string;
          slug: string;
          status: Database["public"]["Enums"]["post_status"];
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: string;
          created_at?: string;
          slug: string;
          status?: Database["public"]["Enums"]["post_status"];
          summary?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["post_status"];
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          body: string;
          category: Database["public"]["Enums"]["post_category"];
          cover_image_url: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          is_featured: boolean;
          photos: Json;
          published_at: string | null;
          sdgs: number[];
          slug: string;
          status: Database["public"]["Enums"]["post_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: string;
          category?: Database["public"]["Enums"]["post_category"];
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          is_featured?: boolean;
          photos?: Json;
          published_at?: string | null;
          sdgs?: number[];
          slug: string;
          status?: Database["public"]["Enums"]["post_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          category?: Database["public"]["Enums"]["post_category"];
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          is_featured?: boolean;
          photos?: Json;
          published_at?: string | null;
          sdgs?: number[];
          slug?: string;
          status?: Database["public"]["Enums"]["post_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          careers: string[];
          code: string;
          created_at: string;
          curriculum_pdf_url: string | null;
          description: string;
          duration: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          objectives: string;
          semesters: string | null;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          careers?: string[];
          code: string;
          created_at?: string;
          curriculum_pdf_url?: string | null;
          description?: string;
          duration?: string | null;
          id: string;
          logo_url?: string | null;
          name: string;
          objectives?: string;
          semesters?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          careers?: string[];
          code?: string;
          created_at?: string;
          curriculum_pdf_url?: string | null;
          description?: string;
          duration?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          objectives?: string;
          semesters?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          created_at: string;
          id: boolean;
          maintenance_message: string;
          maintenance_mode: boolean;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: boolean;
          maintenance_message?: string;
          maintenance_mode?: boolean;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: boolean;
          maintenance_message?: string;
          maintenance_mode?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      student_works: {
        Row: {
          audio_url: string | null;
          category: Database["public"]["Enums"]["exhibit_category"];
          created_at: string;
          description: string;
          featured: boolean;
          id: string;
          image_height: number | null;
          image_url: string | null;
          image_width: number | null;
          like_count: number;
          orientation: Database["public"]["Enums"]["video_orientation"] | null;
          original_url: string | null;
          portfolio_url: string | null;
          rejection_reason: string | null;
          reviewed_at: string | null;
          sort_order: number;
          status: Database["public"]["Enums"]["review_status"];
          store_url: string | null;
          student: string;
          submitted_at: string | null;
          submitted_by: string | null;
          title: string;
          updated_at: string;
          video_url: string | null;
          visible: boolean;
          youtube_id: string | null;
          zoom_height: number | null;
          zoom_url: string | null;
          zoom_width: number | null;
        };
        Insert: {
          audio_url?: string | null;
          category: Database["public"]["Enums"]["exhibit_category"];
          created_at?: string;
          description: string;
          featured?: boolean;
          id?: string;
          image_height?: number | null;
          image_url?: string | null;
          image_width?: number | null;
          like_count?: number;
          orientation?: Database["public"]["Enums"]["video_orientation"] | null;
          original_url?: string | null;
          portfolio_url?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["review_status"];
          store_url?: string | null;
          student: string;
          submitted_at?: string | null;
          submitted_by?: string | null;
          title: string;
          updated_at?: string;
          video_url?: string | null;
          visible?: boolean;
          youtube_id?: string | null;
          zoom_height?: number | null;
          zoom_url?: string | null;
          zoom_width?: number | null;
        };
        Update: {
          audio_url?: string | null;
          category?: Database["public"]["Enums"]["exhibit_category"];
          created_at?: string;
          description?: string;
          featured?: boolean;
          id?: string;
          image_height?: number | null;
          image_url?: string | null;
          image_width?: number | null;
          like_count?: number;
          orientation?: Database["public"]["Enums"]["video_orientation"] | null;
          original_url?: string | null;
          portfolio_url?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["review_status"];
          store_url?: string | null;
          student?: string;
          submitted_at?: string | null;
          submitted_by?: string | null;
          title?: string;
          updated_at?: string;
          video_url?: string | null;
          visible?: boolean;
          youtube_id?: string | null;
          zoom_height?: number | null;
          zoom_url?: string | null;
          zoom_width?: number | null;
        };
        Relationships: [];
      };
      work_likes: {
        Row: {
          created_at: string;
          user_id: string;
          work_id: string;
        };
        Insert: {
          created_at?: string;
          user_id?: string;
          work_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
          work_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_likes_work_id_fkey";
            columns: ["work_id"];
            isOneToOne: false;
            referencedRelation: "student_works";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      is_wvsu_email: { Args: { email: string }; Returns: boolean };
      restrict_signup_to_wvsu: { Args: { event: Json }; Returns: Json };
      submissions_storage_bytes: { Args: never; Returns: number };
    };
    Enums: {
      exhibit_category:
        | "game"
        | "interactive_media"
        | "xr_3d"
        | "digital_art"
        | "animation"
        | "short_film"
        | "sound_design";
      notification_kind: "approved" | "rejected";
      post_category: "news" | "announcement";
      post_status: "draft" | "published";
      review_status: "pending" | "approved" | "rejected";
      video_orientation: "landscape" | "vertical";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      exhibit_category: [
        "game",
        "interactive_media",
        "xr_3d",
        "digital_art",
        "animation",
        "short_film",
        "sound_design",
      ],
      notification_kind: ["approved", "rejected"],
      post_category: ["news", "announcement"],
      post_status: ["draft", "published"],
      review_status: ["pending", "approved", "rejected"],
      video_orientation: ["landscape", "vertical"],
    },
  },
} as const;
