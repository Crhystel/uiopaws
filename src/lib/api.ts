import axios from 'axios';

const PUBLIC_API_URL = 'https://uiopaws-api2.onrender.com/api/public';
const ADMIN_API_URL = 'https://uiopaws-api2.onrender.com/api';

// Create axios instances
export const publicApi = axios.create({
  baseURL: PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth interceptor for admin API
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  // Ignore corrupted values like "undefined" that may be left in storage.
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface User {
  id_user: number;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Animal {
  id_animal: number;
  animal_name: string;
  status: string;
  birth_date: string;
  color: string;
  is_sterilized: boolean;
  description: string;
  id_breed: number;
  id_shelter: number;
  sex: string;
  age: number;
  size: string;
  breed?: Breed;
  shelter?: Shelter;
  species?: Species;
  photos?: Photo[];
  medical_records?: MedicalRecord[];
}

export interface Species {
  id_species: number;
  species_name: string;
}

export interface Breed {
  id_breed: number;
  breed_name: string;
  id_species: number;
  species?: Species;
}

export interface Shelter {
  id_shelter: number;
  shelter_name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Photo {
  id_photo: number;
  photo_url: string;
  id_animal: number;
}

export interface MedicalRecord {
  id_medical_record: number;
  record_date: string;
  description: string;
  veterinarian: string;
  id_animal: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await adminApi.post('/login', { email, password });
    return response.data;
  },
};

// Public API
export const publicAnimalsApi = {
  getAll: async (params?: {
    animal_name?: string;
    id_species?: number;
    id_breed?: number;
    id_shelter?: number;
    size?: string;
    color?: string;
    page?: number;
  }): Promise<PaginatedResponse<Animal>> => {
    const response = await publicApi.get('/animals', { params });
    return response.data;
  },
  getById: async (id: number): Promise<Animal> => {
    const response = await publicApi.get(`/animals/${id}`);
    return response.data;
  },
};

export const publicCatalogsApi = {
  getSpecies: async (): Promise<Species[]> => {
    const response = await publicApi.get('/species');
    return response.data;
  },
  getBreeds: async (): Promise<Breed[]> => {
    const response = await publicApi.get('/breeds');
    return response.data;
  },
  getShelters: async (): Promise<Shelter[]> => {
    const response = await publicApi.get('/shelters');
    return response.data;
  },
};

// Admin API
export const adminAnimalsApi = {
  getAll: async (): Promise<PaginatedResponse<Animal>> => {
    const response = await adminApi.get('/admin/animals');
    return response.data;
  },
  getById: async (id: number): Promise<Animal> => {
    const response = await adminApi.get(`/admin/animals/${id}`);
    return response.data;
  },
  create: async (data: Partial<Animal>): Promise<Animal> => {
    const response = await adminApi.post('/admin/animals', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Animal>): Promise<Animal> => {
    const response = await adminApi.put(`/admin/animals/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await adminApi.delete(`/admin/animals/${id}`);
  },
};

export const adminSheltersApi = {
  getAll: async (): Promise<Shelter[]> => {
    const response = await adminApi.get('/admin/shelters');
    return response.data;
  },
  getById: async (id: number): Promise<Shelter> => {
    const response = await adminApi.get(`/admin/shelters/${id}`);
    return response.data;
  },
  create: async (data: Partial<Shelter>): Promise<Shelter> => {
    const response = await adminApi.post('/admin/shelters', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Shelter>): Promise<Shelter> => {
    const response = await adminApi.put(`/admin/shelters/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await adminApi.delete(`/admin/shelters/${id}`);
  },
};

export const adminPhotosApi = {
  upload: async (animalId: number, file: File): Promise<Photo> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await adminApi.post(`/admin/animals/${animalId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (photoId: number, file: File): Promise<Photo> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await adminApi.put(`/admin/photos/${photoId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  delete: async (photoId: number): Promise<void> => {
    await adminApi.delete(`/admin/photos/${photoId}`);
  },
};

export const adminMedicalRecordsApi = {
  create: async (animalId: number, data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const response = await adminApi.post(`/admin/animals/${animalId}/medical-records`, data);
    return response.data;
  },
  update: async (recordId: number, data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const response = await adminApi.put(`/admin/medical-records/${recordId}`, data);
    return response.data;
  },
  delete: async (recordId: number): Promise<void> => {
    await adminApi.delete(`/admin/medical-records/${recordId}`);
  },
};
