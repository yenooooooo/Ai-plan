/**
 * Supabase Database 타입 정의
 * 사장님비서 전용 테이블 (sb_ 프리픽스)
 *
 * ⚠️ 공유 Supabase: 사장님비서 테이블만 정의
 * ⚠️ auth.users는 Supabase 기본 타입 사용
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sb_user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          phone: string | null;
          agreed_terms: boolean;
          onboarding_complete: boolean;
          plan: "free" | "pro" | "pro_plus";
          plan_expires_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          phone?: string | null;
          agreed_terms?: boolean;
          onboarding_complete?: boolean;
          plan?: "free" | "pro" | "pro_plus";
          plan_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          phone?: string | null;
          agreed_terms?: boolean;
          onboarding_complete?: boolean;
          plan?: "free" | "pro" | "pro_plus";
          plan_expires_at?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      sb_stores: {
        Row: {
          id: string;
          user_id: string;
          store_name: string;
          business_type: string;
          address: string | null;
          phone: string | null;
          monthly_revenue_tier: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_name: string;
          business_type: string;
          address?: string | null;
          phone?: string | null;
          monthly_revenue_tier?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          store_name?: string;
          business_type?: string;
          address?: string | null;
          phone?: string | null;
          monthly_revenue_tier?: string | null;
          is_default?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      sb_store_fee_settings: {
        Row: {
          id: string;
          store_id: string;
          annual_revenue_tier: string;
          credit_card_rate: number;
          check_card_rate: number;
          check_card_ratio: number;
          card_payment_ratio: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          annual_revenue_tier?: string;
          credit_card_rate?: number;
          check_card_rate?: number;
          check_card_ratio?: number;
          card_payment_ratio?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          annual_revenue_tier?: string;
          credit_card_rate?: number;
          check_card_rate?: number;
          check_card_ratio?: number;
          card_payment_ratio?: number;
          updated_at?: string;
        };
        Relationships: [];
      };

      sb_fee_channels: {
        Row: {
          id: string;
          store_id: string;
          channel_name: string;
          fee_type: "percentage" | "fixed";
          rate: number | null;
          fixed_amount: number | null;
          category: "delivery" | "card" | "delivery_agency" | "other";
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          store_id: string;
          channel_name: string;
          fee_type: "percentage" | "fixed";
          rate?: number | null;
          fixed_amount?: number | null;
          category: "delivery" | "card" | "delivery_agency" | "other";
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          channel_name?: string;
          fee_type?: "percentage" | "fixed";
          rate?: number | null;
          fixed_amount?: number | null;
          category?: "delivery" | "card" | "delivery_agency" | "other";
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      sb_daily_closing: {
        Row: {
          id: string;
          store_id: string;
          date: string;
          total_sales: number;
          card_ratio: number;
          cash_ratio: number;
          total_fees: number;
          net_sales: number;
          fee_rate: number;
          memo: string | null;
          input_mode: "keypad" | "voice" | "chat";
          weather_tag: string | null;
          daily_expenses: Json;
          custom_fees: Json;
          tags: string[];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          store_id: string;
          date: string;
          total_sales?: number;
          card_ratio?: number;
          cash_ratio?: number;
          total_fees?: number;
          net_sales?: number;
          fee_rate?: number;
          memo?: string | null;
          input_mode?: "keypad" | "voice" | "chat";
          weather_tag?: string | null;
          daily_expenses?: Json;
          custom_fees?: Json;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          total_sales?: number;
          card_ratio?: number;
          cash_ratio?: number;
          total_fees?: number;
          net_sales?: number;
          fee_rate?: number;
          memo?: string | null;
          input_mode?: "keypad" | "voice" | "chat";
          weather_tag?: string | null;
          daily_expenses?: Json;
          custom_fees?: Json;
          tags?: string[];
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      sb_daily_closing_channels: {
        Row: {
          id: string;
          closing_id: string;
          store_id: string;
          channel_name: string;
          amount: number;
          ratio: number;
          delivery_count: number | null;
          platform_fee: number;
          delivery_fee: number;
          card_fee: number;
          total_fee: number;
          net_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          closing_id: string;
          store_id: string;
          channel_name: string;
          amount?: number;
          ratio?: number;
          delivery_count?: number | null;
          platform_fee?: number;
          delivery_fee?: number;
          card_fee?: number;
          total_fee?: number;
          net_amount?: number;
          created_at?: string;
        };
        Update: {
          channel_name?: string;
          amount?: number;
          ratio?: number;
          delivery_count?: number | null;
          platform_fee?: number;
          delivery_fee?: number;
          card_fee?: number;
          total_fee?: number;
          net_amount?: number;
        };
        Relationships: [];
      };

      sb_order_item_groups: {
        Row: {
          id: string;
          store_id: string;
          group_name: string;
          icon: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          store_id: string;
          group_name: string;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          group_name?: string;
          icon?: string | null;
          sort_order?: number;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      sb_order_items: {
        Row: {
          id: string;
          store_id: string;
          group_id: string | null;
          item_name: string;
          unit: string;
          unit_price: number | null;
          default_order_qty: number;
          shelf_life_days: number | null;
          supplier_name: string | null;
          supplier_contact: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          store_id: string;
          group_id?: string | null;
          item_name: string;
          unit: string;
          unit_price?: number | null;
          default_order_qty?: number;
          shelf_life_days?: number | null;
          supplier_name?: string | null;
          supplier_contact?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          group_id?: string | null;
          item_name?: string;
          unit?: string;
          unit_price?: number | null;
          default_order_qty?: number;
          shelf_life_days?: number | null;
          supplier_name?: string | null;
          supplier_contact?: string | null;
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      sb_daily_usage: {
        Row: {
          id: string;
          store_id: string;
          item_id: string;
          date: string;
          used_qty: number;
          waste_qty: number;
          remaining_stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          item_id: string;
          date: string;
          used_qty?: number;
          waste_qty?: number;
          remaining_stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          used_qty?: number;
          waste_qty?: number;
          remaining_stock?: number;
          updated_at?: string;
        };
        Relationships: [];
      };

      sb_order_recommendations: {
        Row: {
          id: string;
          store_id: string;
          date: string;
          item_id: string;
          current_stock: number;
          expected_usage: number;
          recommended_qty: number;
          confirmed_qty: number | null;
          urgency: "high" | "medium" | "low";
          reason: string | null;
          is_confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          date: string;
          item_id: string;
          current_stock?: number;
          expected_usage?: number;
          recommended_qty?: number;
          confirmed_qty?: number | null;
          urgency?: "high" | "medium" | "low";
          reason?: string | null;
          is_confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          confirmed_qty?: number | null;
          is_confirmed?: boolean;
        };
        Relationships: [];
      };

      sb_receipt_categories: {
        Row: {
          id: string;
          store_id: string | null;
          code: string;
          label: string;
          icon: string | null;
          tax_item: string | null;
          is_system: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          store_id?: string | null;
          code: string;
          label: string;
          icon?: string | null;
          tax_item?: string | null;
          is_system?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          code?: string;
          label?: string;
          icon?: string | null;
          tax_item?: string | null;
          sort_order?: number;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      sb_receipts: {
        Row: {
          id: string;
          store_id: string;
          date: string;
          merchant_name: string;
          total_amount: number;
          vat_amount: number | null;
          payment_method: "카드" | "현금" | "이체";
          card_last_four: string | null;
          category_id: string | null;
          items: Json | null;
          image_url: string | null;
          ocr_confidence: number;
          memo: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          store_id: string;
          date: string;
          merchant_name: string;
          total_amount: number;
          vat_amount?: number | null;
          payment_method?: "카드" | "현금" | "이체";
          card_last_four?: string | null;
          category_id?: string | null;
          items?: Json | null;
          image_url?: string | null;
          ocr_confidence?: number;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          date?: string;
          merchant_name?: string;
          total_amount?: number;
          vat_amount?: number | null;
          payment_method?: "카드" | "현금" | "이체";
          card_last_four?: string | null;
          category_id?: string | null;
          items?: Json | null;
          image_url?: string | null;
          ocr_confidence?: number;
          memo?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      sb_reviews: {
        Row: {
          id: string;
          store_id: string;
          platform: "배민" | "쿠팡이츠" | "네이버" | "요기요" | "기타";
          rating: number;
          content: string;
          reply_status: "pending" | "replied";
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          store_id: string;
          platform: "배민" | "쿠팡이츠" | "네이버" | "요기요" | "기타";
          rating: number;
          content: string;
          reply_status?: "pending" | "replied";
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          platform?: "배민" | "쿠팡이츠" | "네이버" | "요기요" | "기타";
          rating?: number;
          content?: string;
          reply_status?: "pending" | "replied";
          reviewed_at?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };

      sb_review_replies: {
        Row: {
          id: string;
          review_id: string;
          store_id: string;
          blocks: Json;
          full_text: string;
          version: number;
          is_selected: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          store_id: string;
          blocks: Json;
          full_text: string;
          version?: number;
          is_selected?: boolean;
          created_at?: string;
        };
        Update: {
          blocks?: Json;
          full_text?: string;
          is_selected?: boolean;
        };
        Relationships: [];
      };

      sb_store_tone_settings: {
        Row: {
          id: string;
          store_id: string;
          tone_name: string;
          sample_replies: string[] | null;
          store_name_display: string | null;
          signature_menus: string[] | null;
          store_features: string[] | null;
          frequent_phrases: string[] | null;
          use_emoji: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          tone_name?: string;
          sample_replies?: string[] | null;
          store_name_display?: string | null;
          signature_menus?: string[] | null;
          store_features?: string[] | null;
          frequent_phrases?: string[] | null;
          use_emoji?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tone_name?: string;
          sample_replies?: string[] | null;
          store_name_display?: string | null;
          signature_menus?: string[] | null;
          store_features?: string[] | null;
          frequent_phrases?: string[] | null;
          use_emoji?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      sb_daily_orders: {
        Row: {
          id: string;
          store_id: string;
          item_id: string;
          date: string;
          order_qty: number;
          unit_price_at_order: number | null;
          supplier_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          item_id: string;
          date: string;
          order_qty?: number;
          unit_price_at_order?: number | null;
          supplier_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          order_qty?: number;
          unit_price_at_order?: number | null;
          supplier_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      sb_item_price_history: {
        Row: {
          id: string;
          store_id: string;
          item_id: string;
          date: string;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          item_id: string;
          date: string;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          unit_price?: number;
        };
        Relationships: [];
      };

      sb_weekly_briefings: {
        Row: {
          id: string;
          store_id: string;
          week_start: string;
          week_end: string;
          sales_summary: Json | null;
          fee_summary: Json | null;
          expense_summary: Json | null;
          ingredient_efficiency: Json | null;
          customer_reputation: Json | null;
          ai_coaching: Json | null;
          email_sent: boolean;
          email_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          week_start: string;
          week_end: string;
          sales_summary?: Json | null;
          fee_summary?: Json | null;
          expense_summary?: Json | null;
          ingredient_efficiency?: Json | null;
          customer_reputation?: Json | null;
          ai_coaching?: Json | null;
          email_sent?: boolean;
          email_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          sales_summary?: Json | null;
          fee_summary?: Json | null;
          expense_summary?: Json | null;
          ingredient_efficiency?: Json | null;
          customer_reputation?: Json | null;
          ai_coaching?: Json | null;
          email_sent?: boolean;
          email_sent_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      sb_usage_logs: {
        Row: {
          id: string;
          user_id: string;
          feature: string;
          month: string;
          count: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          feature: string;
          month: string;
          count?: number;
          updated_at?: string;
        };
        Update: {
          count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };

      sb_team_members: {
        Row: {
          id: string;
          store_id: string;
          email: string;
          role: "viewer" | "editor";
          invited_by: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          email: string;
          role?: "viewer" | "editor";
          invited_by: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          role?: "viewer" | "editor";
          accepted_at?: string | null;
        };
        Relationships: [];
      };

      sb_coupons: {
        Row: {
          id: string;
          code: string;
          plan: "pro" | "pro_plus";
          duration_days: number;
          max_uses: number;
          used_count: number;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          plan: "pro" | "pro_plus";
          duration_days: number;
          max_uses?: number;
          used_count?: number;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          plan?: "pro" | "pro_plus";
          duration_days?: number;
          max_uses?: number;
          used_count?: number;
          is_active?: boolean;
          expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      sb_coupon_uses: {
        Row: {
          id: string;
          coupon_id: string;
          user_id: string;
          used_at: string;
          plan_expires_at: string;
        };
        Insert: {
          id?: string;
          coupon_id: string;
          user_id: string;
          used_at?: string;
          plan_expires_at: string;
        };
        Update: {
          plan_expires_at?: string;
        };
        Relationships: [];
      };

      sb_notices: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: "info" | "warning" | "update" | "maintenance";
          link: string | null;
          is_active: boolean;
          priority: number;
          starts_at: string;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type?: "info" | "warning" | "update" | "maintenance";
          link?: string | null;
          is_active?: boolean;
          priority?: number;
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          type?: "info" | "warning" | "update" | "maintenance";
          link?: string | null;
          is_active?: boolean;
          priority?: number;
          starts_at?: string;
          ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      sb_push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string | null;
          auth: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh?: string | null;
          auth?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          endpoint?: string;
          p256dh?: string | null;
          auth?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      sb_activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          action?: string;
          metadata?: Json;
        };
        Relationships: [];
      };

      sb_support_tickets: {
        Row: {
          id: string;
          user_id: string;
          store_id: string | null;
          category: string;
          subject: string;
          message: string;
          status: string;
          admin_reply: string | null;
          admin_replied_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_id?: string | null;
          category?: string;
          subject: string;
          message: string;
          status?: string;
          admin_reply?: string | null;
          admin_replied_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: string;
          admin_reply?: string | null;
          admin_replied_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      sb_push_history: {
        Row: {
          id: string;
          title: string;
          body: string;
          target_type: string;
          target_value: string | null;
          sent_count: number;
          failed_count: number;
          sent_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          target_type: string;
          target_value?: string | null;
          sent_count?: number;
          failed_count?: number;
          sent_by: string;
          created_at?: string;
        };
        Update: {
          sent_count?: number;
          failed_count?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/* ── 헬퍼 타입 ── */
type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/* ── 자주 쓰는 Row 타입 ── */

export type UserProfile = Tables<"sb_user_profiles">;
export type Store = Tables<"sb_stores">;
export type StoreFeeSettings = Tables<"sb_store_fee_settings">;
export type FeeChannel = Tables<"sb_fee_channels">;
export type DailyClosing = Tables<"sb_daily_closing">;
export type DailyClosingChannel = Tables<"sb_daily_closing_channels">;
export type OrderItemGroup = Tables<"sb_order_item_groups">;
export type OrderItem = Tables<"sb_order_items">;
export type DailyUsage = Tables<"sb_daily_usage">;
export type OrderRecommendation = Tables<"sb_order_recommendations">;
export type ReceiptCategory = Tables<"sb_receipt_categories">;
export type Receipt = Tables<"sb_receipts">;
export type Review = Tables<"sb_reviews">;
export type ReviewReply = Tables<"sb_review_replies">;
export type StoreToneSettings = Tables<"sb_store_tone_settings">;
export type WeeklyBriefing = Tables<"sb_weekly_briefings">;
export type DailyOrder = Tables<"sb_daily_orders">;
export type ItemPriceHistory = Tables<"sb_item_price_history">;
export type Notice = Tables<"sb_notices">;
export type UsageLog = Tables<"sb_usage_logs">;
export type TeamMember = Tables<"sb_team_members">;
export type ActivityLog = Tables<"sb_activity_logs">;
export type SupportTicket = Tables<"sb_support_tickets">;
export type PushHistory = Tables<"sb_push_history">;
