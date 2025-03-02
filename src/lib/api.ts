import { supabase } from './supabase';
import { Car } from './supabase';

// Fungsi untuk mendapatkan daftar mobil dengan pagination
export const getCars = async (page = 1, limit = 9, filters = {}) => {
  const { transmission, category, sortBy } = filters as {
    transmission?: string;
    category?: string;
    sortBy?: string;
  };
  
  // Calculate offset
  const offset = (page - 1) * limit;
  
  // Start building query
  let query = supabase
    .from('cars')
    .select('*', { count: 'exact' });
    
  // Apply filters
  if (transmission && transmission !== 'all') {
    query = query.eq('transmission', transmission);
  }
  
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  
  // Apply sorting
  if (sortBy === 'price-asc') {
    query = query.order('pricePerDay', { ascending: true });
  } else if (sortBy === 'price-desc') {
    query = query.order('pricePerDay', { ascending: false });
  } else {
    query = query.order('name');
  }
  
  // Apply pagination
  query = query.range(offset, offset + limit - 1);
  
  // Execute query
  const { data, error, count } = await query;
    
  if (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
  
  return {
    data: data as Car[],
    count: count || 0,
    totalPages: count ? Math.ceil(count / limit) : 0,
    currentPage: page
  };
};

// Fungsi untuk mendapatkan detail mobil berdasarkan ID
export const getCarById = async (id: string) => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching car:', error);
    throw error;
  }
  
  return data as Car;
};

// Fungsi untuk menambahkan mobil baru
export const addCar = async (car: Omit<Car, 'id'>) => {
  const { data, error } = await supabase
    .from('cars')
    .insert([car])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding car:', error);
    throw error;
  }
  
  return data as Car;
};

// Fungsi untuk mengupdate data mobil
export const updateCar = async (id: string, car: Partial<Car>) => {
  const { data, error } = await supabase
    .from('cars')
    .update(car)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating car:', error);
    throw error;
  }
  
  return data as Car;
};

// Fungsi untuk menghapus mobil
export const deleteCar = async (id: string) => {
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
  
  return true;
};

// Fungsi untuk upload gambar
export const uploadCarImage = async (file: File, fileName?: string) => {
  const storageFileName = fileName || `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('car-images')
    .upload(`cars/${storageFileName}`, file);
    
  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  // Get public URL for the uploaded image
  const { data: { publicUrl } } = supabase.storage
    .from('car-images')
    .getPublicUrl(`cars/${storageFileName}`);
    
  return publicUrl;
};
