const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Category {
  id: number;
  name: string;
  sort_order: number;
  branch_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  price: number;
  image_url?: string | null;
  warning_text?: string | null;
  sort_order: number;
  branch_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  [key: string]: string;
}

export interface Branch {
  id: number;
  name: string;
  subdomain: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new ApiError(response.status, error.error || error.message || 'An error occurred');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  async getCategories(branchId?: number): Promise<Category[]> {
    const url = branchId
      ? `${API_URL}/categories?branch_id=${branchId}`
      : `${API_URL}/categories`;
    const response = await fetch(url);
    return handleResponse<Category[]>(response);
  },

  async getCategory(id: number): Promise<Category> {
    const response = await fetch(`${API_URL}/categories/${id}`);
    return handleResponse<Category>(response);
  },

  async getProducts(categoryId?: number, branchId?: number): Promise<Product[]> {
    let url = `${API_URL}/products?`;
    const params = [];
    if (categoryId) params.push(`category_id=${categoryId}`);
    if (branchId) params.push(`branch_id=${branchId}`);
    url += params.join('&');

    const response = await fetch(url);
    return handleResponse<Product[]>(response);
  },

  async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse<Product>(response);
  },

  async getSettings(branchId?: number): Promise<Settings> {
    const url = branchId
      ? `${API_URL}/settings?branch_id=${branchId}`
      : `${API_URL}/settings`;
    const response = await fetch(url);
    return handleResponse<Settings>(response);
  },

  async getBranches(): Promise<Branch[]> {
    const response = await fetch(`${API_URL}/branches`);
    return handleResponse<Branch[]>(response);
  },

  async getBranchBySubdomain(subdomain: string): Promise<Branch> {
    const response = await fetch(`${API_URL}/branches/by-subdomain/${subdomain}`);
    return handleResponse<Branch>(response);
  }
};
