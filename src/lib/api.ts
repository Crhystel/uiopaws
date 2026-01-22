import axios from 'axios';

// NOTE: The backend returns relative media paths like "storage/animal-photos/x.jpg".
// Use API_ORIGIN (without /api) to build absolute URLs for images.
export const API_ORIGIN = 'https://uiopaws-api2.onrender.com';

const PUBLIC_API_URL = `${API_ORIGIN}/api/public`;
const ADMIN_API_URL = `${API_ORIGIN}/api`;

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
  roles?: Array<{
    id: number;
    name: string;
    guard_name?: string;
  }>;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'Bearer' | string;
  user_role: 'Super Admin' | 'Admin' | 'User' | string;
  status?: number;
  user?: User;
}

export type RegisterPayload = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  second_last_name?: string;
  document_type: 'Cédula' | 'Pasaporte' | 'RUC';
  document_number: string;
  phone: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
};

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
  address:
    | string
    | {
        street: string;
        city: string;
        province?: string;
        country: string;
        postal_code: string;
      };
  phone: string;
  email: string;
  description?: string;
  // Algunos endpoints pueden devolver `contact_email` en lugar de `email`.
  contact_email?: string;
  // Backwards compatibility si algún endpoint devolviera `contact_phone`.
  contact_phone?: string;
}

export type SpeciesUpsertPayload = {
  species_name: string;
};

export type BreedUpsertPayload = {
  breed_name: string;
  id_species: number;
};

export type ShelterUpsertPayload = {
  shelter_name: string;
  contact_email: string;
  phone: string;
  description?: string;
  address: {
    street: string;
    city: string;
    province: string;
    country: string;
    postal_code: string;
  };
};

const sanitizeShelterUpsertPayload = (data: any): ShelterUpsertPayload => {
  // Regla crítica: en POST (crear) NUNCA debe viajar `id_shelter` (ni como "", ni null).
  // Además, el backend espera `phone` (no `contact_phone`) y `contact_email`.
  const { id_shelter: _idShelter, contact_phone: _contactPhone, ...rest } = data ?? {};

  return {
    shelter_name: rest.shelter_name,
    contact_email: rest.contact_email,
    phone: rest.phone,
    description: rest.description,
    address: {
      street: rest.address?.street,
      city: rest.address?.city,
      province: rest.address?.province,
      postal_code: rest.address?.postal_code,
      country: rest.address?.country,
    },
  };
};

export type AnimalUpsertPayload = {
  animal_name: string;
  status: 'Disponible' | 'Adoptado' | 'En tratamiento';
  sex: 'Macho' | 'Hembra';
  size: 'Pequeo' | 'Mediano' | 'Grande';
  id_breed: number;
  id_shelter: number;
  is_sterilized: boolean;
  age: number;
  color: string;
  birth_date?: string;
  description?: string;
};

export interface Photo {
  id_photo: number;
  id_animal: number;
  // The Laravel backend may return either `image_url` or `photo_url`.
  // We support both for compatibility.
  image_url?: string;
  photo_url?: string;
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

export type DonationCategory =
  | 'Alimentos'
  | 'Medicamentos'
  | 'Juguetes'
  | 'Ropa de cama'
  | 'Higiene'
  | 'Otros';

export interface DonationItemCatalog {
  id_donation_item_catalog: number;
  item_name: string;
  category: string;
  quantity_needed: number;
  description?: string;
  id_shelter?: number | null;
}

export type DonationItemCatalogUpsertPayload = {
  item_name: string;
  category: DonationCategory;
  quantity_needed: number;
  id_shelter?: number;
  description?: string;
};

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await adminApi.post('/login', { email, password });
    return response.data;
  },
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await adminApi.post('/register', payload);
    return response.data;
  },
  profile: async (): Promise<User> => {
    const response = await adminApi.get('/profile');
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

export const publicDonationsApi = {
  getAll: async (params?: {
    category?: string;
    id_shelter?: number;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<DonationItemCatalog>> => {
    const response = await publicApi.get('/donation-items', { params });
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
  create: async (data: ShelterUpsertPayload): Promise<Shelter> => {
    const payload = sanitizeShelterUpsertPayload(data);
    const response = await adminApi.post('/admin/shelters', payload);
    return response.data;
  },
  update: async (id: number, data: ShelterUpsertPayload): Promise<Shelter> => {
    const payload = sanitizeShelterUpsertPayload(data);
    const response = await adminApi.put(`/admin/shelters/${id}`, payload);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await adminApi.delete(`/admin/shelters/${id}`);
  },
};

export const adminSpeciesApi = {
  create: async (data: SpeciesUpsertPayload): Promise<Species> => {
    const response = await adminApi.post('/admin/species', data);
    return response.data;
  },
  update: async (id: number, data: SpeciesUpsertPayload): Promise<Species> => {
    const response = await adminApi.put(`/admin/species/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await adminApi.delete(`/admin/species/${id}`);
  },
};

export const adminBreedsApi = {
  create: async (data: BreedUpsertPayload): Promise<Breed> => {
    const response = await adminApi.post('/admin/breeds', data);
    return response.data;
  },
  update: async (id: number, data: BreedUpsertPayload): Promise<Breed> => {
    const response = await adminApi.put(`/admin/breeds/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await adminApi.delete(`/admin/breeds/${id}`);
  },
};

export const adminDonationItemsCatalogApi = {
  getAll: async (): Promise<{ data: DonationItemCatalog[] }> => {
    const response = await adminApi.get('/admin/donation-items-catalog');
    return response.data;
  },
  getById: async (id: number): Promise<DonationItemCatalog> => {
    const response = await adminApi.get(`/admin/donation-items-catalog/${id}`);
    return response.data;
  },
  create: async (data: DonationItemCatalogUpsertPayload): Promise<any> => {
    const response = await adminApi.post('/admin/donation-items-catalog', data);
    return response.data;
  },
  update: async (id: number, data: Partial<DonationItemCatalogUpsertPayload>): Promise<any> => {
    const response = await adminApi.put(`/admin/donation-items-catalog/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await adminApi.delete(`/admin/donation-items-catalog/${id}`);
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
