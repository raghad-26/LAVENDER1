import axios from 'axios';

/* =========================================================
   Smart Store API — كل ما له علاقة بالـ API في هذا الملف فقط
   ========================================================= */

   const API_URL = import.meta.env.VITE_API_URL ?? 'https://smart-store.devamer.online';
   const FILES_ORIGIN = 'https://smart-store.devamer.online'; // لصور المنتجات
const STORE_KEY = import.meta.env.VITE_STORE_KEY;

export const ENDPOINTS = {
  categories: '/v1/categories',
  products: '/v1/products',
  product: (id) => `/v1/products/${id}`,
  ads: '/v1/ads',
  register: '/v1/customer/register',
  login: '/v1/customer/login',
  forgotPassword: '/v1/customer/forgot-password',
  resetPassword: '/v1/customer/reset-password',
};

/* ---------- token الزبون ---------- */
const TOKEN_KEY = 'lavender_token';
export const getToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};
export const saveToken = (token, remember = true) => {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
};

/* ---------- axios ---------- */
const api = axios.create({
  baseURL: API_URL,
  timeout: 40000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (STORE_KEY) config.headers['X-Store-Key'] = STORE_KEY;
  const token = getToken();
  if (token) config.headers['X-Customer-Token'] = token;
  return config;
});

/* ---------- helpers ---------- */
const toList = (body) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
};
const toObject = (body) => body?.data?.data ?? body?.data ?? body ?? null;

const toImage = (value) => {
  const first = Array.isArray(value) ? value[0] : value;
  const src = typeof first === 'string' ? first : first?.url || first?.path || first?.image;
  if (!src) return '';
  if (/^(https?:|data:)/.test(src)) return src;
  return `${FILES_ORIGIN}/${src.replace(/^\//, '')}`;
};

const slugify = (t = '') => String(t).toLowerCase().trim().replace(/\s+/g, '-');
const nameOf = (c) => (typeof c === 'string' ? c : c?.name || c?.title || '');

/* ---------- تحويل شكل الـ API لشكل المشروع ---------- */
const normalizeCategory = (c) => {
  const title = nameOf(c);
  return {
    id: c.id,
    title,
    slug: c.slug || slugify(title),
    image: toImage(c.image ?? c.image_url ?? c.icon ?? c.thumbnail),
  };
};



const normalizeProduct = (p) => {
  const cats = Array.isArray(p.categories) ? p.categories : p.category ? [p.category] : [];
  const ids = p.category_ids ?? cats.map((c) => c?.id).filter((x) => x != null);
  const names = cats.map(nameOf).filter(Boolean);
  return {
    id: p.id,
    title: p.title || p.name || '',
    categoryIds: p.category_id != null ? [p.category_id, ...ids] : ids,
    categoryNames: names,
    category: names[0] || p.category_name || '',
    price: Number(p.price ?? p.final_price ?? p.sale_price ?? 0),
    oldPrice: Number(p.compare_at_price ?? p.compare_price ?? p.compare_at ?? p.old_price ?? p.original_price ?? 0) || 0,
    size: p.size || p.volume || '',
    image: toImage(p.image ?? p.image_url ?? p.images ?? p.thumbnail),
    description: p.description || p.details || '',
  };
};

const normalizeAd = (a) => ({
  id: a.id,
  title: a.title || a.name || '',
  subtitle: a.subtitle || a.description || '',
  image: toImage(a.image_url ?? a.image ?? a.image_path ?? a.banner),
  ctaLabel: a.button_text || a.cta_label || 'Shop Now',
  category: nameOf(a.category) || '',
  link: a.link_url || a.link || a.url || '',
});

/* ---------- الكتالوج ---------- */
let categoriesPromise = null;
export const fetchCategories = () => {
  if (!categoriesPromise) {
    categoriesPromise = api
      .get(ENDPOINTS.categories)
      .then((res) => toList(res.data).map(normalizeCategory))
      .catch((err) => {
        categoriesPromise = null;
        throw err;
      });
  }
  return categoriesPromise;
};

const withCategoryName = async (product) => {
  if (product.categoryNames.length || !product.categoryIds.length) return product;
  try {
    const cats = await fetchCategories();
    const names = cats.filter((c) => product.categoryIds.includes(c.id)).map((c) => c.title);
    return { ...product, categoryNames: names, category: names[0] || '' };
  } catch {
    return product;
  }
};

export const fetchProducts = async (category = 'All') => {
const res = await api.get(ENDPOINTS.products, { params: { per_page: 20, page: 1 } });
  const list = await Promise.all(toList(res.data).map(normalizeProduct).map(withCategoryName));
 const wanted = category.trim().toLowerCase();
return category === 'All'
  ? list
  : list.filter((p) => p.categoryNames.some((n) => n.trim().toLowerCase() === wanted));
};
// المنتجات اللي عليها خصم: السعر القديم أعلى من السعر الحالي
export const fetchOffers = async () => {
  const list = await fetchProducts('All');
  return list.filter((p) => p.oldPrice > p.price);
};
export const fetchProductById = async (id) => {
  try {
    const res = await api.get(ENDPOINTS.product(id));
    const data = toObject(res.data);
    return data ? await withCategoryName(normalizeProduct(data)) : null;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

export const fetchBanners = async () => {
  const res = await api.get(ENDPOINTS.ads);
  return toList(res.data).map(normalizeAd);
};

/* ---------- تسجيل الدخول والحساب ---------- */
const extractToken = (body) =>
  body?.token || body?.access_token || body?.data?.token || body?.data?.access_token || '';

export const customerLogin = async ({ email, password, remember = true }) => {
  const res = await api.post(ENDPOINTS.login, { email, password });
  const token = extractToken(res.data);
  if (token) saveToken(token, remember);
  localStorage.setItem('lavender_isRegistered', 'true');
  return res.data;
};

export const customerRegister = async (v) => {
  const body = {
    name: `${v.firstName} ${v.lastName}`.trim(),
    email: v.email,
    phone: v.phone,
    password: v.password,
    password_confirmation: v.password,
  };
  const res = await api.post(ENDPOINTS.register, body);
  localStorage.setItem('lavender_isRegistered', 'true');
  return res.data;
};

export const customerForgotPassword = async ({ email }) =>
  (await api.post(ENDPOINTS.forgotPassword, { email })).data;

export const customerResetPassword = async ({ email, code, password }) =>
  (
    await api.post(ENDPOINTS.resetPassword, {
      email,
      token: code,
      password,
      password_confirmation: password,
    })
  ).data;

/* ---------- رسالة خطأ مفهومة ---------- */
export const getErrorMessage = (err) => {
  if (err.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (!err.response) return 'Cannot reach the server. Check your connection.';
  const data = err.response.data;
  const firstValidation = data?.errors && Object.values(data.errors).flat()[0];
  if (firstValidation) return firstValidation;
  if (data?.message) return data.message;
  if (err.response.status >= 500) return 'Server error. Please try again later.';
  return 'Something went wrong.';
};