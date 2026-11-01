export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
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
          published_at?: string | null;
          sdgs?: number[];
          slug?: string;
          status?: Database["public"]["Enums"]["post_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
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
          created_at: string;
          description: string;
          id: string;
          image_height: number | null;
          image_url: string | null;
          image_width: number | null;
          kind: Database["public"]["Enums"]["student_work_kind"];
          orientation: Database["public"]["Enums"]["video_orientation"] | null;
          original_url: string | null;
          portfolio_url: string | null;
          sort_order: number;
          store_url: string | null;
          student: string;
          title: string;
          updated_at: string;
          visible: boolean;
          youtube_id: string | null;
          zoom_height: number | null;
          zoom_url: string | null;
          zoom_width: number | null;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          image_height?: number | null;
          image_url?: string | null;
          image_width?: number | null;
          kind: Database["public"]["Enums"]["student_work_kind"];
          orientation?: Database["public"]["Enums"]["video_orientation"] | null;
          original_url?: string | null;
          portfolio_url?: string | null;
          sort_order?: number;
          store_url?: string | null;
          student: string;
          title: string;
          updated_at?: string;
          visible?: boolean;
          youtube_id?: string | null;
          zoom_height?: number | null;
          zoom_url?: string | null;
          zoom_width?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          image_height?: number | null;
          image_url?: string | null;
          image_width?: number | null;
          kind?: Database["public"]["Enums"]["student_work_kind"];
          orientation?: Database["public"]["Enums"]["video_orientation"] | null;
          original_url?: string | null;
          portfolio_url?: string | null;
          sort_order?: number;
          store_url?: string | null;
          student?: string;
          title?: string;
          updated_at?: string;
          visible?: boolean;
          youtube_id?: string | null;
          zoom_height?: number | null;
          zoom_url?: string | null;
          zoom_width?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      post_category: "news" | "announcement";
      post_status: "draft" | "published";
      student_work_kind: "art" | "video" | "game";
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
      post_category: ["news", "announcement"],
      post_status: ["draft", "published"],
      student_work_kind: ["art", "video", "game"],
      video_orientation: ["landscape", "vertical"],
    },
  },
} as const;
