export type UserRole = "admin" | "editor" | "reporter";

export type PostStatus = "draft" | "in_review" | "published" | "archived";

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  bio?: string | null;
  slug: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  created_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: any; // JSON structure for Rich Text (Tiptap) or HTML
  cover_image?: string | null;
  cover_caption?: string | null;
  status: PostStatus;
  is_headline: boolean;
  is_breaking_news: boolean;
  author_id: string;
  editor_id?: string | null;
  category_id?: number | null;
  views_count: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  author?: UserProfile;
  editor?: UserProfile;
  category?: Category;
  tags?: Tag[];
}

export interface EditorialReview {
  id: string;
  post_id: string;
  reviewer_id: string;
  notes: string;
  action: "revision_requested" | "approved" | "rejected";
  created_at: string;
  reviewer?: UserProfile;
}
