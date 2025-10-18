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

      if (parentId === null) {
        query = query.is('parent_id', null);
      } else if (parentId) {
        query = query.eq('parent_id', parentId);
      }

      const { data, error } = await query;
      if (error) throw error;

      let categories = data || [];

      console.log('Categories fetched:', categories.length, 'ParentId:', parentId, 'BranchId:', branchId);

      if (!branchId) {
        console.log('No branchId, returning all categories');
        return categories;
      }

      if (categories.length > 0) {
        const categoryIds = categories.map(c => c.id);
        const { data: branchData } = await supabase
          .from('category_branches')
          .select('category_id')
          .eq('branch_id', branchId)
          .in('category_id', categoryIds);

        const branchCategoryIds = new Set(branchData?.map(b => b.category_id) || []);

        categories = categories.filter(cat =>
          branchCategoryIds.size === 0 || branchCategoryIds.has(cat.id)
        );

        const { data: allBranchData } = await supabase
          .from('category_branches')
          .select('category_id')
          .in('category_id', categoryIds);

        const categoriesWithBranches = new Set(allBranchData?.map(b => b.category_id) || []);

        categories = categories.filter(cat =>
          !categoriesWithBranches.has(cat.id) || branchCategoryIds.has(cat.id)
        );

        console.log('After branch filtering:', categories.length);
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
    async getByCategoryId(categoryId: string, branchId?: string | null): Promise<Product[]> {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      let products = data || [];

      console.log('Products fetched for category:', categoryId, 'Count:', products.length, 'BranchId:', branchId);

      if (!branchId) {
        console.log('No branchId, returning all products');
        return products;
      }

      if (products.length > 0) {
        const productIds = products.map(p => p.id);
        const { data: branchData } = await supabase
          .from('product_branches')
          .select('product_id')
          .eq('branch_id', branchId)
          .in('product_id', productIds);

        const branchProductIds = new Set(branchData?.map(b => b.product_id) || []);

        const { data: allBranchData } = await supabase
          .from('product_branches')
          .select('product_id')
          .in('product_id', productIds);

        const productsWithBranches = new Set(allBranchData?.map(b => b.product_id) || []);

        products = products.filter(prod =>
          !productsWithBranches.has(prod.id) || branchProductIds.has(prod.id)
        );

        console.log('After branch filtering:', products.length);
      }

      return products;
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
