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
      article: {
        Row: {
          content: string
          created_at: string
          id: number
          image: string | null
          project_id: number
          title: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: number
          image?: string | null
          project_id: number
          title?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          image?: string | null
          project_id?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      map: {
        Row: {
          article_id: number
          created_at: string
          id: number
          image: string
          parent_id: number | null
          parent_image: string | null
          project_id: number
          title: string
        }
        Insert: {
          article_id: number
          created_at?: string
          id?: number
          image: string
          parent_id?: number | null
          parent_image?: string | null
          project_id: number
          title?: string
        }
        Update: {
          article_id?: number
          created_at?: string
          id?: number
          image?: string
          parent_id?: number | null
          parent_image?: string | null
          project_id?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "map_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "article"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "map"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      marker: {
        Row: {
          created_at: string
          height: number
          id: number
          image: string | null
          owner_map_id: number
          target_article_id: number | null
          target_map_id: number | null
          width: number
          x: number
          y: number
        }
        Insert: {
          created_at?: string
          height?: number
          id?: number
          image?: string | null
          owner_map_id: number
          target_article_id?: number | null
          target_map_id?: number | null
          width?: number
          x?: number
          y?: number
        }
        Update: {
          created_at?: string
          height?: number
          id?: number
          image?: string | null
          owner_map_id?: number
          target_article_id?: number | null
          target_map_id?: number | null
          width?: number
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "marker_owner_map_id_fkey"
            columns: ["owner_map_id"]
            isOneToOne: false
            referencedRelation: "map"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marker_target_article_id_fkey"
            columns: ["target_article_id"]
            isOneToOne: false
            referencedRelation: "article"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marker_target_map_id_fkey"
            columns: ["target_map_id"]
            isOneToOne: false
            referencedRelation: "map"
            referencedColumns: ["id"]
          },
        ]
      }
      project: {
        Row: {
          created_at: string
          head_map_id: number
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          head_map_id?: number
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          head_map_id?: number
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_head_map_id_fkey"
            columns: ["head_map_id"]
            isOneToOne: false
            referencedRelation: "map"
            referencedColumns: ["id"]
          },
        ]
      }
      user_info: {
        Row: {
          created_at: string
          id: number
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: number
          user_id: string
          username?: string
        }
        Update: {
          created_at?: string
          id?: number
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_project_access: {
        Row: {
          created_at: string
          id: number
          project_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          project_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          project_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_user_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_project_map_article: {
        Args: {
          project_title: string
          map_title: string
          map_image: string
          article_title: string
        }
        Returns: {
          project_id: number
          map_id: number
          article_id: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
