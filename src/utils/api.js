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
    },

    // Create product with color variants as separate products
    createWithVariants: async (product) => {
        const res = await fetch(`${API_BASE_URL}/products/with-variants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Ürün varyantları oluşturulamadı');
        return res.json();
    },

    // Get all products in a group
    getByGroup: async (groupId) => {
        const res = await fetch(`${API_BASE_URL}/products/group/${groupId}`);
        if (!res.ok) throw new Error('Grup ürünleri bulunamadı');
        return res.json();
    },

    // Sync all products in a group
    syncGroup: async (groupId, syncFields) => {
        const res = await fetch(`${API_BASE_URL}/products/sync-group/${groupId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ syncFields })
        });
        if (!res.ok) throw new Error('Grup senkronizasyonu başarısız');
        return res.json();
    },

    // Reorder products (drag & drop)
    reorder: async (orderedIds) => {
        const res = await fetch(`${API_BASE_URL}/products/reorder/bulk`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderedIds })
        });
        if (!res.ok) throw new Error('Sıralama güncellenemedi');
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

// Categories API
export const categoriesApi = {
    // Get all categories
    getAll: async () => {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (!res.ok) throw new Error('Kategoriler yüklenemedi');
        return res.json();
    },

    // Get single category
    getById: async (id) => {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`);
        if (!res.ok) throw new Error('Kategori bulunamadı');
        return res.json();
    },

    // Create new category
    create: async (category) => {
        const res = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        if (!res.ok) throw new Error('Kategori eklenemedi');
        return res.json();
    },

    // Update category
    update: async (id, category) => {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        if (!res.ok) throw new Error('Kategori güncellenemedi');
        return res.json();
    },

    // Delete category
    delete: async (id) => {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Kategori silinemedi');
        return res.json();
    },

    // Reset to defaults
    reset: async () => {
        const res = await fetch(`${API_BASE_URL}/categories/reset`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error('Kategoriler sıfırlanamadı');
        return res.json();
    },

    // Reorder categories (drag & drop)
    reorder: async (orderedIds) => {
        const res = await fetch(`${API_BASE_URL}/categories/reorder/bulk`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderedIds })
        });
        if (!res.ok) throw new Error('Sıralama güncellenemedi');
        return res.json();
    }
};

// Quotes API
export const quotesApi = {
    getAll: async (status = 'all') => {
        const res = await fetch(`${API_BASE_URL}/quotes?status=${status}`);
        if (!res.ok) throw new Error('Teklifler yüklenemedi');
        return res.json();
    },

    getById: async (id) => {
        const res = await fetch(`${API_BASE_URL}/quotes/${id}`);
        if (!res.ok) throw new Error('Teklif bulunamadı');
        return res.json();
    },

    create: async (quote) => {
        const res = await fetch(`${API_BASE_URL}/quotes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quote)
        });
        if (!res.ok) throw new Error('Teklif gönderilemedi');
        return res.json();
    },

    update: async (id, data) => {
        const res = await fetch(`${API_BASE_URL}/quotes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Teklif güncellenemedi');
        return res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${API_BASE_URL}/quotes/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Teklif silinemedi');
        return res.json();
    },

    getStats: async () => {
        const res = await fetch(`${API_BASE_URL}/quotes/stats/summary`);
        if (!res.ok) throw new Error('İstatistikler yüklenemedi');
        return res.json();
    }
};

// Contacts API
export const contactsApi = {
    getAll: async (status = 'all') => {
        const res = await fetch(`${API_BASE_URL}/contacts?status=${status}`);
        if (!res.ok) throw new Error('Mesajlar yüklenemedi');
        return res.json();
    },

    getById: async (id) => {
        const res = await fetch(`${API_BASE_URL}/contacts/${id}`);
        if (!res.ok) throw new Error('Mesaj bulunamadı');
        return res.json();
    },

    create: async (contact) => {
        const res = await fetch(`${API_BASE_URL}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contact)
        });
        if (!res.ok) throw new Error('Mesaj gönderilemedi');
        return res.json();
    },

    update: async (id, data) => {
        const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Mesaj güncellenemedi');
        return res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Mesaj silinemedi');
        return res.json();
    },

    getStats: async () => {
        const res = await fetch(`${API_BASE_URL}/contacts/stats/summary`);
        if (!res.ok) throw new Error('İstatistikler yüklenemedi');
        return res.json();
    }
};
