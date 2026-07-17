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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          budget_cents: number
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          media_url: string | null
          starts_at: string | null
          target_url: string | null
          title: string
          vendor_id: string
        }
        Insert: {
          budget_cents?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          media_url?: string | null
          starts_at?: string | null
          target_url?: string | null
          title: string
          vendor_id: string
        }
        Update: {
          budget_cents?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          media_url?: string | null
          starts_at?: string | null
          target_url?: string | null
          title?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event: string
          id: number
          props: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: number
          props?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: number
          props?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: number
          meta: Json
          target_id: string | null
          target_kind: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: number
          meta?: Json
          target_id?: string | null
          target_kind?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: number
          meta?: Json
          target_id?: string | null
          target_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          scheduled_at: string
          service_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          scheduled_at: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          scheduled_at?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      club_members: {
        Row: {
          club_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          club_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          club_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          is_private: boolean
          members_count: number
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          members_count?: number
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          members_count?: number
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clubs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          club_id: string | null
          created_at: string
          created_by: string
          id: string
          kind: Database["public"]["Enums"]["conversation_kind"]
          last_message_at: string | null
          title: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          kind?: Database["public"]["Enums"]["conversation_kind"]
          last_message_at?: string | null
          title?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          kind?: Database["public"]["Enums"]["conversation_kind"]
          last_message_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string
          id: string
          label: string | null
          last_seen_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          last_seen_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          last_seen_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          club_id: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          host_id: string
          id: string
          location: string | null
          rsvp_count: number
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          club_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          host_id: string
          id?: string
          location?: string | null
          rsvp_count?: number
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          club_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          host_id?: string
          id?: string
          location?: string | null
          rsvp_count?: number
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_followee_id_fkey"
            columns: ["followee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hashtags: {
        Row: {
          created_at: string
          id: string
          tag: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          tag: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          tag?: string
          usage_count?: number
        }
        Relationships: []
      }
      listings: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          hero_image_url: string | null
          id: string
          location: string | null
          price_cents: number
          seller_id: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          hero_image_url?: string | null
          id?: string
          location?: string | null
          price_cents: number
          seller_id: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          hero_image_url?: string | null
          id?: string
          location?: string | null
          price_cents?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          deleted_at: string | null
          id: string
          media_url: string | null
          sender_id: string
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          media_url?: string | null
          sender_id: string
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          media_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          bookings: boolean
          comments: boolean
          email_enabled: boolean
          events: boolean
          follows: boolean
          likes: boolean
          marketplace: boolean
          mentions: boolean
          messages: boolean
          orders: boolean
          push_enabled: boolean
          subscriptions: boolean
          updated_at: string
          user_id: string
          vendor_updates: boolean
        }
        Insert: {
          bookings?: boolean
          comments?: boolean
          email_enabled?: boolean
          events?: boolean
          follows?: boolean
          likes?: boolean
          marketplace?: boolean
          mentions?: boolean
          messages?: boolean
          orders?: boolean
          push_enabled?: boolean
          subscriptions?: boolean
          updated_at?: string
          user_id: string
          vendor_updates?: boolean
        }
        Update: {
          bookings?: boolean
          comments?: boolean
          email_enabled?: boolean
          events?: boolean
          follows?: boolean
          likes?: boolean
          marketplace?: boolean
          mentions?: boolean
          messages?: boolean
          orders?: boolean
          push_enabled?: boolean
          subscriptions?: boolean
          updated_at?: string
          user_id?: string
          vendor_updates?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          payload: Json
          read_at: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          payload?: Json
          read_at?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          payload?: Json
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price_cents: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price_cents: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["order_status"]
          total_cents: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_cents: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_cents?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          order_id: string | null
          provider: string
          provider_ref: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          provider?: string
          provider_ref?: string | null
          status?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          provider?: string
          provider_ref?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_hashtags: {
        Row: {
          hashtag_id: string
          post_id: string
        }
        Insert: {
          hashtag_id: string
          post_id: string
        }
        Update: {
          hashtag_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          caption: string | null
          comments_count: number
          created_at: string
          deleted_at: string | null
          id: string
          is_reel: boolean
          is_story: boolean
          kind: Database["public"]["Enums"]["post_kind"]
          likes_count: number
          media_url: string | null
          shares_count: number
          story_expires_at: string | null
          telemetry: Json | null
          thumbnail_url: string | null
          updated_at: string
          vehicle_id: string | null
          views_count: number
        }
        Insert: {
          author_id: string
          caption?: string | null
          comments_count?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_reel?: boolean
          is_story?: boolean
          kind?: Database["public"]["Enums"]["post_kind"]
          likes_count?: number
          media_url?: string | null
          shares_count?: number
          story_expires_at?: string | null
          telemetry?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          vehicle_id?: string | null
          views_count?: number
        }
        Update: {
          author_id?: string
          caption?: string | null
          comments_count?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_reel?: boolean
          is_story?: boolean
          kind?: Database["public"]["Enums"]["post_kind"]
          likes_count?: number
          media_url?: string | null
          shares_count?: number
          story_expires_at?: string | null
          telemetry?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          vehicle_id?: string | null
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_cents: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_cents: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_cents?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          deleted_at: string | null
          display_name: string | null
          followers_count: number
          following_count: number
          handle: string | null
          id: string
          is_verified: boolean
          location: string | null
          posts_count: number
          tier: Database["public"]["Enums"]["rider_tier"]
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          followers_count?: number
          following_count?: number
          handle?: string | null
          id: string
          is_verified?: boolean
          location?: string | null
          posts_count?: number
          tier?: Database["public"]["Enums"]["rider_tier"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          followers_count?: number
          following_count?: number
          handle?: string | null
          id?: string
          is_verified?: boolean
          location?: string | null
          posts_count?: number
          tier?: Database["public"]["Enums"]["rider_tier"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["reaction_kind"]
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["reaction_kind"]
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["reaction_kind"]
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_kind: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_kind: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_id: string
          body: string | null
          created_at: string
          id: string
          product_id: string | null
          rating: number
          vendor_id: string | null
        }
        Insert: {
          author_id: string
          body?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          rating: number
          vendor_id?: string | null
        }
        Update: {
          author_id?: string
          body?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          rating?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          name: string
          price_cents: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          name: string
          price_cents?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          code: string
          currency: string
          features: Json
          id: string
          interval: string
          is_active: boolean
          name: string
          price_cents: number
        }
        Insert: {
          code: string
          currency?: string
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          name: string
          price_cents: number
        }
        Update: {
          code?: string
          currency?: string
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          name?: string
          price_cents?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          external_ref: string | null
          id: string
          plan_id: string
          status: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          external_ref?: string | null
          id?: string
          plan_id: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          external_ref?: string | null
          id?: string
          plan_id?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          deleted_at: string | null
          hero_image_url: string | null
          id: string
          is_primary: boolean
          kind: string
          make: string
          model: string
          nickname: string | null
          owner_id: string
          spec: Json
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          hero_image_url?: string | null
          id?: string
          is_primary?: boolean
          kind?: string
          make: string
          model: string
          nickname?: string | null
          owner_id: string
          spec?: Json
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          hero_image_url?: string | null
          id?: string
          is_primary?: boolean
          kind?: string
          make?: string
          model?: string
          nickname?: string | null
          owner_id?: string
          spec?: Json
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_staff: {
        Row: {
          role: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          role?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          role?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_staff_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_name: string
          business_type: string
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_verified: boolean
          lat: number | null
          legal_name: string | null
          lng: number | null
          logo_url: string | null
          operating_hours: Json
          owner_id: string
          owner_name: string | null
          phone: string | null
          postal_code: string | null
          region: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_areas: string[]
          slug: string
          socials: Json
          submitted_at: string | null
          tax_number: string | null
          trade_license_no: string | null
          updated_at: string
          verification_docs: Json
          verification_notes: string | null
          verification_status: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_name: string
          business_type?: string
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean
          lat?: number | null
          legal_name?: string | null
          lng?: number | null
          logo_url?: string | null
          operating_hours?: Json
          owner_id: string
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_areas?: string[]
          slug: string
          socials?: Json
          submitted_at?: string | null
          tax_number?: string | null
          trade_license_no?: string | null
          updated_at?: string
          verification_docs?: Json
          verification_notes?: string | null
          verification_status?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_name?: string
          business_type?: string
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean
          lat?: number | null
          legal_name?: string | null
          lng?: number | null
          logo_url?: string | null
          operating_hours?: Json
          owner_id?: string
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_areas?: string[]
          slug?: string
          socials?: Json
          submitted_at?: string | null
          tax_number?: string | null
          trade_license_no?: string | null
          updated_at?: string
          verification_docs?: Json
          verification_notes?: string | null
          verification_status?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { _conv: string; _user: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "moderator"
        | "vendor"
        | "vendor_staff"
        | "creator"
        | "premium"
        | "standard"
      booking_status: "requested" | "confirmed" | "completed" | "cancelled"
      conversation_kind: "dm" | "club" | "group"
      listing_status: "draft" | "active" | "sold" | "archived"
      notification_kind:
        | "like"
        | "comment"
        | "follow"
        | "mention"
        | "message"
        | "marketplace"
        | "booking"
        | "order"
        | "vendor_update"
        | "subscription"
        | "event"
        | "system"
      order_status:
        | "pending"
        | "paid"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      post_kind: "video" | "photo" | "telemetry" | "event"
      reaction_kind: "like" | "save" | "share"
      report_status: "open" | "reviewing" | "resolved" | "dismissed"
      rider_tier: "rookie" | "turbo" | "nitro" | "elite" | "apex_rex" | "legend"
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
      app_role: [
        "super_admin",
        "admin",
        "moderator",
        "vendor",
        "vendor_staff",
        "creator",
        "premium",
        "standard",
      ],
      booking_status: ["requested", "confirmed", "completed", "cancelled"],
      conversation_kind: ["dm", "club", "group"],
      listing_status: ["draft", "active", "sold", "archived"],
      notification_kind: [
        "like",
        "comment",
        "follow",
        "mention",
        "message",
        "marketplace",
        "booking",
        "order",
        "vendor_update",
        "subscription",
        "event",
        "system",
      ],
      order_status: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      post_kind: ["video", "photo", "telemetry", "event"],
      reaction_kind: ["like", "save", "share"],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      rider_tier: ["rookie", "turbo", "nitro", "elite", "apex_rex", "legend"],
    },
  },
} as const
