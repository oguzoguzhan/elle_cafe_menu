export interface Settings {
  id: number;
  logo_url: string | null;
  header_logo_url: string | null;
  site_title: string;
  header_bg_color: string;
  header_text_color: string;
  landing_bg_color: string;
  categories_bg_color: string;
  products_bg_color: string;
  nav_bg_color: string;
  nav_text_color: string;
  nav_hover_bg_color: string;
  category_grid_cols: number;
  category_text_color: string;
  product_grid_cols: number;
  product_name_color: string;
  product_price_color: string;
  product_description_color: string;
  product_warning_color: string;
  product_warning_bg_color: string;
  product_image_width: number;
  back_button_bg_color: string;
  back_button_text_color: string;
  back_button_hover_bg_color: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  image_url: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  warning_text: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`/api/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  settings: {
    async get(): Promise<Settings | null> {
      return apiCall('settings');
    },
  },

  categories: {
    async getAll(): Promise<Category[]> {
      return apiCall('categories');
    },
  },

  products: {
    async getByCategoryId(categoryId: number): Promise<Product[]> {
      return apiCall(`products?category_id=${categoryId}`);
    },
  },
};
