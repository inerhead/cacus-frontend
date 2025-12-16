// Use INTERNAL_API_URL for server-side requests (inside Docker network)
// Use NEXT_PUBLIC_API_URL for client-side requests (from browser)
const API_URL = typeof window === 'undefined' 
  ? (process.env.INTERNAL_API_URL || 'http://backend:3000/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  brand?: string;
  manufacturer?: string;
  material?: string;
  dimensions?: any;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  safetyWarnings?: string[];
  certifications?: string[];
  imageUrl?: string;
  images?: Array<{
    id: string;
    url: string;
    altText?: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  active?: boolean;
  featured?: boolean;
  isNew?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

class ProductsAPI {
  private baseURL = `${API_URL}/products`;

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getAll(params?: ProductQueryParams): Promise<ProductsResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<ProductsResponse>(`${this.baseURL}${queryString}`);
  }

  async getById(id: string): Promise<Product> {
    return this.request<Product>(`${this.baseURL}/${id}`);
  }

  async getBySlug(slug: string): Promise<Product> {
    return this.request<Product>(`${this.baseURL}/slug/${slug}`);
  }

  async getFeatured(params?: Omit<ProductQueryParams, 'featured'>): Promise<ProductsResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<ProductsResponse>(`${this.baseURL}/featured${queryString}`);
  }

  async getNew(params?: Omit<ProductQueryParams, 'isNew'>): Promise<ProductsResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<ProductsResponse>(`${this.baseURL}/new${queryString}`);
  }

  async create(data: Partial<Product>, token?: string): Promise<Product> {
    return this.request<Product>(this.baseURL, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Product>, token?: string): Promise<Product> {
    return this.request<Product>(`${this.baseURL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
  }

  async updateStock(id: string, stockQuantity: number, token?: string): Promise<Product> {
    return this.request<Product>(`${this.baseURL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ stockQuantity }),
    });
  }

  async delete(id: string, token?: string): Promise<void> {
    await this.request<void>(`${this.baseURL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
  }
}

export const productsAPI = new ProductsAPI();
export const productsApi = productsAPI;

