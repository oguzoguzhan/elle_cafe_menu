export type ImageCategory = 'logo' | 'header-logo' | 'kategori' | 'urun';

export const uploadImage = async (
  file: File,
  category: ImageCategory
): Promise<string> => {
  const timestamp = Date.now();
  const randomNum = Math.round(Math.random() * 1E9);
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `${timestamp}_${randomNum}.${extension}`;

  const formData = new FormData();
  formData.append('image', file);
  formData.append('filename', filename);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Resim yükleme başarısız';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      const text = await response.text();
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.url;
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;

  try {
    const filename = imageUrl.split('/').pop();
    if (!filename) return;

    await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    });
  } catch (error) {
    console.warn('Image deletion error:', error);
  }
};
