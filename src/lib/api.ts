import { supabase } from './supabase';
import { Car } from './supabase';

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

// Fungsi untuk mendapatkan SQL untuk membuat tabel cars
export const getCreateCarsSql = () => {
  return `
-- Buat tabel cars
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  year INTEGER NOT NULL,
  pricePerDay INTEGER NOT NULL,
  transmission TEXT DEFAULT 'Manual',
  capacity INTEGER DEFAULT 4,
  category TEXT DEFAULT 'MPV',
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  imageUrl TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Aktifkan extension jika belum
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tambahkan function untuk create_cars_table
CREATE OR REPLACE FUNCTION create_cars_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Buat tabel cars jika belum ada
  CREATE TABLE IF NOT EXISTS public.cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    year INTEGER NOT NULL,
    pricePerDay INTEGER NOT NULL,
    transmission TEXT DEFAULT 'Manual',
    capacity INTEGER DEFAULT 4,
    category TEXT DEFAULT 'MPV',
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    imageUrl TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Aktifkan extension jika belum
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  RETURN TRUE;
END;
$$;

-- Tambahkan function untuk seed data mobil
CREATE OR REPLACE FUNCTION seed_cars_data()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert 10 sample cars
  INSERT INTO cars (name, brand, year, pricePerDay, imageUrl, transmission, capacity, category, description, features)
  VALUES
    (
      'Honda Jazz', 
      'Honda', 
      2023, 
      350000, 
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8aG9uZGElMjBqYXp6fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60', 
      'Automatic', 
      5, 
      'Hatchback', 
      'Hatchback praktis dengan konsumsi BBM efisien dan kabin luas. Cocok untuk perkotaan.', 
      ARRAY['Eco Mode', 'Touchscreen Display', 'Backup Camera', 'Bluetooth', 'USB Port']
    ),
    (
      'Mitsubishi Xpander', 
      'Mitsubishi', 
      2022, 
      450000, 
      'https://images.unsplash.com/photo-1631220706319-ded7a34a2424?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bWl0c3ViaXNoaSUyMHhwYW5kZXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', 
      'Automatic', 
      7, 
      'MPV', 
      'MPV serbaguna dengan interior lega dan nyaman untuk keluarga. Ground clearance tinggi untuk berbagai kondisi jalan.', 
      ARRAY['Keyless Entry', 'Start/Stop Button', 'Cruise Control', 'Rear AC Vents', 'Foldable Seats']
    ),
    (
      'Suzuki Ertiga', 
      'Suzuki', 
      2023, 
      400000, 
      'https://images.unsplash.com/photo-1631712134670-c4652703a453?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8c3V6dWtpJTIwZXJ0aWdhfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60', 
      'Manual', 
      7, 
      'MPV', 
      'MPV kompak dengan harga terjangkau dan konsumsi BBM irit. Cocok untuk keluarga kecil.', 
      ARRAY['Dual Airbags', 'ABS', 'Power Steering', 'Adjustable Seats', 'Power Windows']
    ),
    (
      'Toyota Alphard', 
      'Toyota', 
      2023, 
      1500000, 
      'https://images.unsplash.com/photo-1621707168349-2216255ff780?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dG95b3RhJTIwYWxwaGFyZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60', 
      'Automatic', 
      7, 
      'MPV Premium', 
      'MPV mewah dengan fitur premium dan interior luas. Kenyamanan setara limousine.', 
      ARRAY['Captain Seats', 'Power Door', 'Premium Sound System', 'Adaptive Cruise Control', 'Leather Interior', 'Ambient Lighting']
    ),
    (
      'Toyota Innova', 
      'Toyota', 
      2022, 
      500000, 
      'https://images.unsplash.com/photo-1583267746897-2cf415887172?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dG95b3RhJTIwaW5ub3ZhfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60', 
      'Automatic', 
      7, 
      'MPV', 
      'MPV tangguh dan nyaman untuk perjalanan jauh. Mesin diesel bertenaga dan handal.', 
      ARRAY['Diesel Engine', 'Rear AC', 'Touchscreen Entertainment', 'Traction Control', 'Hill Start Assist']
    ),
    (
      'Honda CR-V', 
      'Honda', 
      2023, 
      700000, 
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aG9uZGElMjBjcnZ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', 
      'Automatic', 
      5, 
      'SUV', 
      'SUV dengan handling responsif dan kabın luas. Cocok untuk keluarga urban.', 
      ARRAY['Honda Sensing', 'Lane Keep Assist', 'Adaptive Cruise Control', 'Collision Mitigation', 'Apple CarPlay', 'Android Auto']
    ),
    (
      'BMW 320i', 
      'BMW', 
      2023, 
      1200000, 
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGJtdyUyMDMyMGl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', 
      'Automatic', 
      5, 
      'Sedan Premium', 
      'Sedan premium dengan performa dan handling terbaik di kelasnya. Ultimate driving machine.', 
      ARRAY['Sport Mode', 'Leather Seats', 'BMW iDrive', 'Premium Sound System', 'Ambient Lighting', 'Driver Assist']
    ),
    (
      'Daihatsu Rocky', 
      'Daihatsu', 
      2023, 
      350000, 
      'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8ZGFpaGF0c3UlMjByb2NreXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60', 
      'Automatic', 
      5, 
      'SUV Compact', 
      'SUV kompak dengan teknologi canggih dan irit bahan bakar. Cocok untuk perkotaan.', 
      ARRAY['360 Camera', 'Blind Spot Monitor', 'DNGA Platform', 'Turbocharged Engine', 'Smart Key']
    ),
    (
      'Toyota Camry', 
      'Toyota', 
      2022, 
      800000, 
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8dG95b3RhJTIwY2Ftcnl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', 
      'Automatic', 
      5, 
      'Sedan', 
      'Sedan mewah dengan kabin senyap dan kualitas berkendara superior. Pilihan eksekutif.', 
      ARRAY['Leather Interior', 'JBL Audio', 'Wireless Charging', 'Dynamic Radar Cruise Control', 'Head-up Display']
    ),
    (
      'Mercedes-Benz C-Class', 
      'Mercedes-Benz', 
      2023, 
      1500000, 
      'https://images.unsplash.com/photo-1563720223185-11069f619acf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWVyY2VkZXMlMjBjJTIwY2xhc3N8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', 
      'Automatic', 
      5, 
      'Sedan Premium', 
      'Sedan premium Jerman dengan teknologi canggih dan kenyamanan terbaik. Simbol kesuksesan.', 
      ARRAY['MBUX Infotainment', 'Burmester Sound', 'Ambient Lighting', 'Drive Pilot', 'Wireless Charging', 'Memory Seats']
    );
  
  RETURN TRUE;
END;
$$;
  `;
};
