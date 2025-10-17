import { supabase, Settings, Category, Product } from './supabase';

export const api = {
  settings: {
    async get(): Promise<Settings | null> {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  },

  categories: {
    async getAll(parentId?: string | null, branchId?: string | null): Promise<Category[]> {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      if (parentId === null) {
        query = query.is('parent_id', null);
      } else if (parentId) {
        query = query.eq('parent_id', parentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async hasSubcategories(categoryId: string): Promise<boolean> {
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoryId)
        .eq('active', true)
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    },
  },

  products: {
    async getByCategoryId(categoryId: string): Promise<Product[]> {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    async getById(id: string): Promise<Product | null> {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  },
};
