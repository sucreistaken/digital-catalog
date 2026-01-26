// API Configuration
// In Docker: nginx proxies /api to backend:3001
// In dev: use localhost:3001 directly
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Products API
export const productsApi = {
    // Get all products
    getAll: async () => {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (!res.ok) throw new Error('Ürünler yüklenemedi');
        return res.json();
    },

    // Get single product
    getById: async (id) => {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!res.ok) throw new Error('Ürün bulunamadı');
        return res.json();
    },

    // Create new product
    create: async (product) => {
        const res = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Ürün eklenemedi');
        return res.json();
    },

    // Update product
    update: async (id, product) => {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Ürün güncellenemedi');
        return res.json();
    },

    // Delete product
    delete: async (id) => {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Ürün silinemedi');
        return res.json();
    },

    // Upload image
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Resim yüklenemedi');
        return res.json();
    }
};

// Health check
export const checkApiHealth = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/health`);
        return res.ok;
    } catch {
        return false;
    }
};
