import { supabase, Settings, Category, Product, Branch } from './supabase';

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

  branches: {
    async getAll(): Promise<Branch[]> {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    async create(branch: Omit<Branch, 'id' | 'created_at'>): Promise<Branch> {
      const { data, error } = await supabase
        .from('branches')
        .insert(branch)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Branch>): Promise<Branch> {
      const { data, error } = await supabase
        .from('branches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

      if (error) throw error;
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

      const categories = data || [];

      for (const category of categories) {
        const { data: branchData } = await supabase
          .from('category_branches')
          .select('branch_id')
          .eq('category_id', category.id);

        category.branch_ids = branchData?.map(cb => cb.branch_id) || [];
      }

      return categories;
    },

    async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>, branchIds: string[]): Promise<Category> {
      const { branch_ids, ...categoryData } = category;

      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;

      if (branchIds.length > 0) {
        const branchEntries = branchIds.map(branch_id => ({
          category_id: data.id,
          branch_id,
        }));

        await supabase
          .from('category_branches')
          .insert(branchEntries);
      }

      return data;
    },

    async update(id: string, updates: Partial<Category>, branchIds?: string[]): Promise<Category> {
      const { branch_ids, ...categoryUpdates } = updates;

      const { data, error } = await supabase
        .from('categories')
        .update({ ...categoryUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (branchIds !== undefined) {
        await supabase
          .from('category_branches')
          .delete()
          .eq('category_id', id);

        if (branchIds.length > 0) {
          const branchEntries = branchIds.map(branch_id => ({
            category_id: id,
            branch_id,
          }));

          await supabase
            .from('category_branches')
            .insert(branchEntries);
        }
      }

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
