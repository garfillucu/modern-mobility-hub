
import { supabase } from './supabase';
import { Car } from './supabase';

// Fungsi untuk mendapatkan daftar mobil
export const getCars = async () => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
  
  return data as Car[];
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
