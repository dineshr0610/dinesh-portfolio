export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            social_highlights: {
                Row: {
                    id: string
                    created_at: string
                    platform: string
                    title: string | null
                    embed_html: string
                    published: boolean
                    published_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    platform: string
                    title?: string | null
                    embed_html: string
                    published?: boolean
                    published_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    platform?: string
                    title?: string | null
                    embed_html?: string
                    published?: boolean
                    published_at?: string | null
                    updated_at?: string | null
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
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
