import { supabase } from '../lib/supabase';

const MARKETING_BUCKET = 'marketing-images';

const toDisplayDate = value => {
  if (!value) return '-';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}.${month}.${year}` : value;
};

const toDatabaseDate = value => {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return value;

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const normalizeProduct = product => ({
  id: product.id?.toString(),
  storeId: product.store_id?.toString() ?? '1',
  date: toDisplayDate(product.stock_date),
  name: product.name,
  quantity: Number(product.quantity ?? 0),
});

const normalizeOrder = order => ({
  id: order.id?.toString(),
  storeId: order.store_id?.toString() ?? '1',
  date: toDisplayDate(order.order_date ?? order.date),
  products: (order.order_items ?? []).map(item => ({
    id: item.id?.toString(),
    name: item.product_name ?? item.name,
    quantity: Number(item.quantity ?? 0),
  })),
});

const normalizeMarketingImages = activity => {
  const imageUrls = Array.isArray(activity.image_urls) ? activity.image_urls : [];
  const legacyImage = activity.image_url ? [activity.image_url] : [];

  return [...imageUrls, ...legacyImage].filter(Boolean);
};

const normalizeMarketingActivity = activity => {
  const images = normalizeMarketingImages(activity);

  return {
    id: activity.id?.toString(),
    storeId: activity.store_id?.toString() ?? '1',
    title: activity.title,
    description: activity.description,
    image: images[0] ?? '',
    images,
    imageName: '',
    period: 'Въведена активност',
  };
};

const dataUrlToBlob = async dataUrl => {
  const response = await fetch(dataUrl);
  return response.blob();
};

const getImageExtension = imageName => {
  const match = imageName?.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : 'jpg';
};

const uploadMarketingImage = async ({ image, imageName }) => {
  if (!image || !image.startsWith('data:')) {
    return image;
  }

  const extension = getImageExtension(imageName);
  const filePath = `activities/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const blob = await dataUrlToBlob(image);

  const { error } = await supabase.storage.from(MARKETING_BUCKET).upload(filePath, blob, {
    contentType: blob.type || `image/${extension}`,
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(MARKETING_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

const uploadMarketingImages = async images => {
  const uploadedImages = await Promise.all(
    images
      .map(image => ({
        image: image.uri ?? image,
        imageName: image.name ?? '',
      }))
      .filter(image => image.image)
      .map(uploadMarketingImage)
  );

  return uploadedImages.filter(Boolean);
};

export const loadProducts = async () => {
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map(normalizeProduct);
};

export const createProduct = async ({ storeId, date, name, quantity }) => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      stock_date: toDatabaseDate(date),
      name,
      quantity: Number(quantity),
    })
    .select('*')
    .single();

  if (error) throw error;
  return normalizeProduct(data);
};

export const updateProduct = async ({ id, date, name, quantity }) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      stock_date: toDatabaseDate(date),
      name,
      quantity: Number(quantity),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeProduct(data);
};

export const deleteProduct = async id => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

export const loadOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('id, store_id, order_date, order_items(id, product_name, quantity)')
    .order('order_date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalizeOrder);
};

export const createOrder = async ({ storeId, date, products }) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ store_id: storeId, order_date: toDatabaseDate(date) })
    .select('id, store_id, order_date')
    .single();

  if (orderError) throw orderError;

  const orderItems = products.map(product => ({
    order_id: order.id,
    product_name: product.name,
    quantity: Number(product.quantity),
  }));

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select('id, product_name, quantity');

  if (itemsError) throw itemsError;

  return normalizeOrder({ ...order, order_items: items ?? [] });
};

export const loadMarketingActivities = async () => {
  const { data, error } = await supabase
    .from('marketing_activities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalizeMarketingActivity);
};

export const createMarketingActivity = async ({ storeId, title, description, images = [] }) => {
  const imageUrls = await uploadMarketingImages(images);

  const { data, error } = await supabase
    .from('marketing_activities')
    .insert({
      store_id: storeId,
      title,
      description,
      image_url: imageUrls[0] ?? '',
      image_urls: imageUrls,
    })
    .select('*')
    .single();

  if (error) throw error;
  return normalizeMarketingActivity(data);
};

export const updateMarketingActivity = async ({ id, title, description, images = [] }) => {
  const imageUrls = await uploadMarketingImages(images);

  const { data, error } = await supabase
    .from('marketing_activities')
    .update({
      title,
      description,
      image_url: imageUrls[0] ?? '',
      image_urls: imageUrls,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeMarketingActivity(data);
};

export const deleteMarketingActivity = async id => {
  const { error } = await supabase.from('marketing_activities').delete().eq('id', id);
  if (error) throw error;
};
