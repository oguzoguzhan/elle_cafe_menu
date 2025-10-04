import { supabase } from './supabase';

export type ImageCategory = 'logo' | 'header-logo' | 'kategori' | 'urun';

const getImagePath = (category: ImageCategory, filename: string): string => {
  switch (category) {
    case 'logo':
      return `logos/${filename}`;
    case 'header-logo':
      return `logos/${filename}`;
    case 'kategori':
      return `kategoriler/${filename}`;
    case 'urun':
      return `urunler/${filename}`;
  }
};

export const uploadImage = async (
  file: File,
  category: ImageCategory
): Promise<string> => {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${sanitizedName}`;
  const path = getImagePath(category, filename);

  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(path);

  return urlData.publicUrl;
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;

  try {
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)/);

    if (!pathMatch) {
      console.warn('Could not parse image path from URL:', imageUrl);
      return;
    }

    const path = pathMatch[1];

    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) {
      console.warn('Image deletion failed:', error.message);
    }
  } catch (error) {
    console.warn('Image deletion error:', error);
  }
};
