import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Settings = {
  id: string;
  bg_color: string;
  logo_url: string | null;
  logo_width: number;
  welcome_text: string;
  welcome_font_size: number;
  welcome_color: string;
  button_text: string;
  button_bg_color: string;
  button_text_color: string;
  category_grid: 'one' | 'two';
  header_logo_url: string | null;
  header_logo_width: number;
  header_bg_color: string;
  header_height: number;
  product_grid: 'one' | 'two';
  categories_bg_color: string;
  products_bg_color: string;
  nav_bg_color: string;
  nav_text_color: string;
  nav_font_size: number;
  product_warning_color: string;
  product_warning_font_size: number;
  product_warning_bg_color: string;
  category_name_color: string;
  category_name_font_size: number;
  product_name_color: string;
  product_name_font_size: number;
  product_description_color: string;
  product_description_font_size: number;
  product_price_color: string;
  product_price_font_size: number;
  back_button_bg_color: string;
  back_button_text_color: string;
  updated_at: string;
};

export type Branch = {
  id: string;
  name: string;
  subdomain: string | null;
  sort_order: number;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  branch_ids?: string[];
};

export type Product = {
  id: string;
  category_id: string;
  branch_id: string | null;
  name: string;
  image_url: string | null;
  description: string | null;
  warning: string | null;
  price_single: number | null;
  price_small: number | null;
  price_medium: number | null;
  price_large: number | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Admin = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
};
