
import { supabase } from './supabase';
import { Car } from './supabase';
import { createBookingsTable, getAllBookings } from './bookingService';

// Fungsi untuk memeriksa dan membuat tabel cars jika belum ada
export const createCarsTable = async () => {
  try {
    // Cek apakah tabel cars sudah ada
    const { error: checkError } = await supabase
      .from('cars')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Cars table does not exist, creating it...');
      
      // Jalankan SQL untuk membuat tabel cars
      const { error: createError } = await supabase.rpc('create_cars_table');
      
      if (createError) {
        console.error('Error creating cars table:', createError);
        return false;
      }
      
      console.log('Cars table created successfully!');
      return true;
    } else {
      console.log('Cars table already exists');
      return true;
    }
  } catch (error) {
    console.error('Error checking/creating cars table:', error);
    return false;
  }
};

// Fungsi untuk seed data mobil jika tabel kosong
export const seedCarsData = async () => {
  try {
    // Periksa apakah sudah ada data di tabel cars
    const { data, error: checkError, count } = await supabase
      .from('cars')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (checkError) {
      console.error('Error checking cars data:', checkError);
      return false;
    }
    
    // Jika tidak ada data, tambahkan data sample
    if (count === 0) {
      console.log('Cars table is empty, seeding sample data...');
      
      // Jalankan SQL untuk menambahkan data sample
      const { error: seedError } = await supabase.rpc('seed_cars_data');
      
      if (seedError) {
        console.error('Error seeding cars data:', seedError);
        return false;
      }
      
      console.log('Sample cars data added successfully!');
      return true;
    } else {
      console.log('Cars table already has data');
      return true;
    }
  } catch (error) {
    console.error('Error seeding cars data:', error);
    return false;
  }
};

// Fungsi untuk mendapatkan daftar mobil dengan pagination
export const getCars = async (page = 1, limit = 9, filters = {}) => {
  try {
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
  } catch (error) {
    console.error('Error in getCars function:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan detail mobil berdasarkan ID
export const getCarById = async (id: string) => {
  try {
    console.log('Getting car by ID:', id);
    
    if (!id || id === ':id') {
      throw new Error('Invalid car ID');
    }
    
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching car:', error);
      throw error;
    }
    
    console.log('Car data retrieved:', data);
    return data as Car;
  } catch (error) {
    console.error('Error in getCarById function:', error);
    throw error;
  }
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
export const uploadCarImage = async (file: File, fileName?: string): Promise<string> => {
  try {
    // Dapatkan user session untuk memastikan upload dilakukan dengan otorisasi yang benar
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('Upload failed: User not authenticated');
      throw new Error('User tidak terautentikasi');
    }
    
    // Generate unique file name jika tidak disediakan
    const uniqueId = Date.now();
    const cleanFileName = file.name.replace(/\s+/g, '-').toLowerCase();
    const storageFileName = fileName || `${uniqueId}-${cleanFileName}`;
    const filePath = `cars/${storageFileName}`;
    
    console.log('Uploading image:', filePath);
    console.log('File type:', file.type);
    console.log('File size:', file.size, 'bytes');
    
    // Verifikasi bahwa file adalah gambar
    if (!file.type.startsWith('image/')) {
      console.error('Upload failed: File is not an image');
      throw new Error('File harus berupa gambar');
    }
    
    // Tambahkan timeout untuk upload yang lebih lama
    const uploadOptions = {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    };
    
    // Upload gambar ke Supabase Storage
    const { data, error } = await supabase.storage
      .from('car-images')
      .upload(filePath, file, uploadOptions);
      
    if (error) {
      console.error('Error uploading image:', error);
      console.error('Error message:', error.message);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Periksa secara spesifik jenis error berdasarkan pesan error
      if (error.message && (
          error.message.includes('403') || 
          error.message.includes('Permission') || 
          error.message.includes('not authorized')
        )) {
        console.log('Permission error detected, attempting fallback...');
        
        // Coba cara lain untuk mendapatkan URL publik jika ada
        try {
          // Memeriksa apakah file sudah ada dengan nama yang sama
          const { data: checkData } = await supabase.storage
            .from('car-images')
            .list('cars');
          
          const fileExists = checkData?.some(f => f.name === storageFileName);
          if (fileExists) {
            const { data: { publicUrl } } = supabase.storage
              .from('car-images')
              .getPublicUrl(`cars/${storageFileName}`);
            
            console.log('File already exists, using existing URL:', publicUrl);
            return publicUrl;
          }
        } catch (checkError) {
          console.error('Error checking existing files:', checkError);
        }
        
        // Cara alternatif untuk upload gambar (menggunakan file sebagai Base64)
        try {
          console.log('Attempting Base64 conversion as fallback...');
          // Convert file to base64 and store as URL
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              console.log('Base64 conversion successful, using data URL');
              const result = reader.result;
              // Ensure we're returning a string
              if (typeof result === 'string') {
                resolve(result);
              } else {
                console.error('Base64 result is not a string');
                resolve('https://placehold.co/600x400?text=' + encodeURIComponent(file.name));
              }
            };
            reader.onerror = () => {
              console.error('Base64 conversion failed');
              // If all else fails, use placeholder
              resolve('https://placehold.co/600x400?text=' + encodeURIComponent(file.name));
            };
          });
        } catch (base64Error) {
          console.error('Error creating base64 URL:', base64Error);
          // Jika file tidak ditemukan dan base64 gagal, gunakan placeholder dengan nama file
          console.log('Using placeholder with filename');
          return 'https://placehold.co/600x400?text=' + encodeURIComponent(file.name);
        }
      }
      
      throw error;
    }
    
    console.log('Upload successful, getting public URL');
    
    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(filePath);
      
    console.log('Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadCarImage:', error);
    // Gunakan placeholder dengan nama file
    if (file && file.name) {
      return 'https://placehold.co/600x400?text=' + encodeURIComponent(file.name);
    }
    return 'https://placehold.co/600x400?text=No+Image+Available';
  }
};

// Export fungsi dari file terpisah untuk backward compatibility
export { 
  createBooking, 
  getBookingById, 
  getUserBookings, 
  updateBookingStatus, 
  getAllBookings, 
  createBookingsTable 
} from './bookingService';
