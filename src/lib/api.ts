import { supabase, Settings, Category, Product, Branch } from './supabase';

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

  branches: {
    async getAll(): Promise<Branch[]> {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  },

  categories: {
    async getAll(parentId?: string | null, branchId?: string): Promise<Category[]> {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (parentId === null) {
        query = query.is('parent_id', null);
      } else if (parentId) {
        query = query.eq('parent_id', parentId);
      }

      const { data, error } = await query;
      if (error) throw error;

      let categories = data || [];

      if (branchId) {
        const { data: branchData, error: branchError } = await supabase
          .from('category_branches')
          .select('category_id')
          .eq('branch_id', branchId);

        if (branchError) throw branchError;

        const categoryIds = new Set(branchData?.map(cb => cb.category_id) || []);
        categories = categories.filter(c => categoryIds.has(c.id));
      }

      return categories;
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
    async getByCategoryId(categoryId: string, branchId?: string): Promise<Product[]> {
      let query = supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query;

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
