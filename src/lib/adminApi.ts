import { supabase, Settings, Category, Product } from './supabase';

const ADMIN_SESSION_KEY = 'admin_session';

export const adminApi = {
  auth: {
    async login(username: string, password: string): Promise<boolean> {
      const email = `${username}@admin.local`;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return false;
      }

      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ username }));
      return true;
    },

    async logout() {
      await supabase.auth.signOut();
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    },

    async isAuthenticated(): Promise<boolean> {
      const { data } = await supabase.auth.getSession();
      return !!data.session && !!sessionStorage.getItem(ADMIN_SESSION_KEY);
    },
  },

  settings: {
    async update(settings: Partial<Settings>): Promise<Settings | null> {
      const { data: current } = await supabase
        .from('settings')
        .select('*')
        .maybeSingle();

      if (!current) return null;

      const { data, error } = await supabase
        .from('settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', current.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  categories: {
    async getAll(includeInactive = true): Promise<Category[]> {
      let query = supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Category>): Promise<Category> {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
  },

  products: {
    async getAll(filters?: { categoryId?: string; active?: boolean }): Promise<Product[]> {
      let query = supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Product>): Promise<Product> {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
  },
};
