import { Settings, Category, Product } from './api';

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`/api/${endpoint}`, {
    ...options,
    credentials: 'include',
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

export const adminApi = {
  auth: {
    async login(username: string, password: string): Promise<boolean> {
      try {
        await apiCall('auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
        return true;
      } catch {
        return false;
      }
    },

    async logout(): Promise<void> {
      await apiCall('auth/logout', { method: 'POST' });
    },

    async isAuthenticated(): Promise<boolean> {
      try {
        await apiCall('auth/session');
        return true;
      } catch {
        return false;
      }
    },
  },

  settings: {
    async update(settings: Partial<Settings>): Promise<Settings> {
      return apiCall('settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },
  },

  categories: {
    async getAll(): Promise<Category[]> {
      return apiCall('categories');
    },

    async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
      return apiCall('categories', {
        method: 'POST',
        body: JSON.stringify(category),
      });
    },

    async update(id: number, updates: Partial<Category>): Promise<Category> {
      return apiCall('categories', {
        method: 'PUT',
        body: JSON.stringify({ id, ...updates }),
      });
    },

    async delete(id: number): Promise<void> {
      await apiCall('categories', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
    },
  },

  products: {
    async getAll(categoryId?: number): Promise<Product[]> {
      const query = categoryId ? `?category_id=${categoryId}` : '';
      return apiCall(`products${query}`);
    },

    async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
      return apiCall('products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
    },

    async update(id: number, updates: Partial<Product>): Promise<Product> {
      return apiCall('products', {
        method: 'PUT',
        body: JSON.stringify({ id, ...updates }),
      });
    },

    async delete(id: number): Promise<void> {
      await apiCall('products', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
    },
  },
};
