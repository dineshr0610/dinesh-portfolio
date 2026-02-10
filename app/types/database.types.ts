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
                    platform: string
                    title: string | null
                    embed_html: string
                    published: boolean
                }
                Insert: {
                    id?: string
                    platform: string
                    title?: string | null
                    embed_html: string
                    published?: boolean
                }
                Update: {
                    id?: string
                    platform?: string
                    title?: string | null
                    embed_html?: string
                    published?: boolean
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
