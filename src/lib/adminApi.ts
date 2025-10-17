import { Category, Product, Settings, Branch } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ADMIN_SESSION_KEY = 'admin_session';
const ADMIN_TOKEN_KEY = 'admin_token';

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

function getAuthHeaders(): HeadersInit {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const adminApi = {
  auth: {
    async login(username: string, password: string): Promise<boolean> {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await handleResponse<{ token: string; user: { id: number; username: string } }>(response);

        sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(data.user));
        return true;
      } catch {
        return false;
      }
    },

    async logout() {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    },

    async isAuthenticated(): Promise<boolean> {
      return !!sessionStorage.getItem(ADMIN_TOKEN_KEY);
    },
  },

  settings: {
    async get(branchId?: number): Promise<Settings> {
      const url = branchId
        ? `${API_URL}/settings?branch_id=${branchId}`
        : `${API_URL}/settings`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      return handleResponse<Settings>(response);
    },

    async update(settings: Partial<Settings>, branchId?: number): Promise<Settings> {
      const url = branchId
        ? `${API_URL}/settings?branch_id=${branchId}`
        : `${API_URL}/settings`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      });
      return handleResponse<Settings>(response);
    },
  },

  categories: {
    async getAll(branchId?: number): Promise<Category[]> {
      const url = branchId
        ? `${API_URL}/categories?branch_id=${branchId}`
        : `${API_URL}/categories`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      return handleResponse<Category[]>(response);
    },

    async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(category)
      });
      return handleResponse<Category>(response);
    },

    async update(id: number, updates: Partial<Category>): Promise<Category> {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      return handleResponse<Category>(response);
    },

    async delete(id: number): Promise<void> {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse<void>(response);
    },
  },

  products: {
    async getAll(categoryId?: number, branchId?: number): Promise<Product[]> {
      let url = `${API_URL}/products?`;
      const params = [];
      if (categoryId) params.push(`category_id=${categoryId}`);
      if (branchId) params.push(`branch_id=${branchId}`);
      url += params.join('&');

      const response = await fetch(url, { headers: getAuthHeaders() });
      return handleResponse<Product[]>(response);
    },

    async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
      });
      return handleResponse<Product>(response);
    },

    async update(id: number, updates: Partial<Product>): Promise<Product> {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      return handleResponse<Product>(response);
    },

    async delete(id: number): Promise<void> {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse<void>(response);
    },
  },

  branches: {
    async getAll(): Promise<Branch[]> {
      const response = await fetch(`${API_URL}/branches`, { headers: getAuthHeaders() });
      return handleResponse<Branch[]>(response);
    },

    async create(branch: Omit<Branch, 'id' | 'created_at' | 'updated_at'>): Promise<Branch> {
      const response = await fetch(`${API_URL}/branches`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(branch)
      });
      return handleResponse<Branch>(response);
    },

    async update(id: number, updates: Partial<Branch>): Promise<Branch> {
      const response = await fetch(`${API_URL}/branches/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      return handleResponse<Branch>(response);
    },

    async delete(id: number): Promise<void> {
      const response = await fetch(`${API_URL}/branches/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse<void>(response);
    },
  },
};
