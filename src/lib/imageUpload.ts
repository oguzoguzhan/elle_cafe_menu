import { supabase } from './supabase';

export type ImageCategory = 'logo' | 'header-logo' | 'kategori' | 'urun';

export const uploadImage = async (
  file: File,
  category: ImageCategory
): Promise<string> => {
  const timestamp = Date.now();
  const randomNum = Math.round(Math.random() * 1E9);
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `${category}/${timestamp}_${randomNum}.${extension}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(error.message || 'Resim yükleme başarısız');
  }

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;

  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/images/');
    if (pathParts.length < 2) return;

    const filename = pathParts[1];
    if (!filename) return;

    await supabase.storage
      .from('images')
      .remove([filename]);
  } catch (error) {
    console.warn('Image deletion error:', error);
  }
};
