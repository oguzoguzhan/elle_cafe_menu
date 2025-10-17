export type ImageCategory = 'logo' | 'header-logo' | 'kategori' | 'urun';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const uploadImage = async (
  file: File,
  category: ImageCategory
): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('filename', `${category}_${Date.now()}_${file.name}`);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Resim yükleme başarısız');
  }

  const data = await response.json();
  return data.url;
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;

  try {
    const response = await fetch(`${API_URL}/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: imageUrl })
    });

    if (!response.ok) {
      console.warn('Image deletion failed');
    }
  } catch (error) {
    console.warn('Image deletion error:', error);
  }
};
