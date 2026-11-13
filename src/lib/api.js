const API_URL = '/api/shopos';

async function parse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getShop(slug) {
  return await fetch(`${API_URL}/shops/${slug}`).then(parse);
}

export async function getAllProducts(slug) {
  return await fetch(`${API_URL}/shops/${slug}/products`).then(parse);
}

export async function updateShopInfo(slug, formData) {
  return await fetch(`${API_URL}/shops/${slug}`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  }).then(parse);
}

export async function addCategory(slug, formData) {
  return await fetch(`${API_URL}/shops/${slug}/categories`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  }).then(parse);
}

export async function updateCategory(slug, categoryId, formData) {
  return await fetch(`${API_URL}/shops/${slug}/categories/${categoryId}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  }).then(parse);
}

export async function deleteCategory(slug, categoryId) {
  return await fetch(`${API_URL}/shops/${slug}/categories/${categoryId}`, {
    method: 'DELETE',
    credentials: 'include',
  }).then(parse);
}

export async function addProduct(slug, formData) {
  return await fetch(`${API_URL}/shops/${slug}/products`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  }).then(parse);
}

export async function updateProduct(slug, productId, formData) {
  return await fetch(`${API_URL}/shops/${slug}/products/${productId}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  }).then(parse);
}

export async function deleteProduct(slug, productId) {
  return await fetch(`${API_URL}/shops/${slug}/products/${productId}`, {
    method: 'DELETE',
    credentials: 'include',
  }).then(parse);
}

export async function addStaticSection(slug, formData) {
  return await fetch(`${API_URL}/shops/${slug}/static-sections`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  }).then(parse);
}

export async function updateStaticSection(slug, sectionId, formData) {
  return await fetch(`${API_URL}/shops/${slug}/static-sections/${sectionId}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  }).then(parse);
}

export async function deleteStaticSection(slug, sectionId) {
  return await fetch(`${API_URL}/shops/${slug}/static-sections/${sectionId}`, {
    method: 'DELETE',
    credentials: 'include',
  }).then(parse);
}

export async function updateFooter(slug, footer) {
  return await fetch(`${API_URL}/shops/${slug}/footer`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(footer),
  }).then(parse);
}

export async function addBanner(shopSlug, formData) {
  const res = await fetch(`${'/api/shopos'}/shops/${shopSlug}/banners`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to add banner');
  return res.json(); // returns the full banners array
}

export async function updateBanner(shopSlug, bannerId, formData) {
  const res = await fetch(`${'/api/shopos'}/shops/${shopSlug}/banners/${bannerId}`, {
    method: 'PATCH',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update banner');
  return res.json();
}

export async function deleteBanner(shopSlug, bannerId) {
  const res = await fetch(`${'/api/shopos'}/shops/${shopSlug}/banners/${bannerId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete banner');
  return res.json();
}
