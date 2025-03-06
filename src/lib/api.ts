
import { supabase } from './supabase';
import { Car, Booking } from './supabase';

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

// Fungsi untuk membuat pemesanan baru
export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at'>) => {
  try {
    // Dapatkan session user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session && !booking.user_id) {
      throw new Error('User tidak terautentikasi');
    }
    
    // Gunakan user_id dari session jika tidak disediakan
    const userId = booking.user_id || session?.user.id;
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ ...booking, user_id: userId }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
    
    return data as Booking;
  } catch (error) {
    console.error('Error in createBooking function:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pemesanan berdasarkan ID
export const getBookingById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, cars(*)')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getBookingById function:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pemesanan berdasarkan user ID
export const getUserBookings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, cars(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserBookings function:', error);
    throw error;
  }
};

// Fungsi untuk mengubah status pemesanan
export const updateBookingStatus = async (id: string, status: Booking['status']) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
    
    return data as Booking;
  } catch (error) {
    console.error('Error in updateBookingStatus function:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan semua pemesanan (admin)
export const getAllBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, cars(*)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getAllBookings function:', error);
    throw error;
  }
};

// Fungsi untuk membuat tabel bookings
export const createBookingsTable = async () => {
  try {
    // Cek apakah tabel bookings sudah ada
    const { error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Bookings table does not exist, creating it...');
      
      // Jalankan SQL untuk membuat tabel bookings
      const { error: createError } = await supabase.rpc('create_bookings_table');
      
      if (createError) {
        console.error('Error creating bookings table:', createError);
        return false;
      }
      
      console.log('Bookings table created successfully!');
      return true;
    } else {
      console.log('Bookings table already exists');
      return true;
    }
  } catch (error) {
    console.error('Error checking/creating bookings table:', error);
    return false;
  }
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

// Fungsi untuk mendapatkan SQL untuk membuat tabel bookings
export const getCreateBookingsSql = () => {
  return `
-- Buat tabel bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID NOT NULL REFERENCES cars(id),
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  notes TEXT
);

-- Buat indeks untuk mempercepat pencarian
CREATE INDEX IF NOT EXISTS bookings_car_id_idx ON bookings (car_id);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings (user_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);

-- Buat function untuk membuat tabel bookings
CREATE OR REPLACE FUNCTION create_bookings_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Buat tabel bookings jika belum ada
  CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id),
    user_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    notes TEXT
  );
  
  -- Buat indeks untuk mempercepat pencarian
  CREATE INDEX IF NOT EXISTS bookings_car_id_idx ON bookings (car_id);
  CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings (user_id);
  CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);
  
  RETURN TRUE;
END;
$$;

-- Set up RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy untuk membaca data
CREATE POLICY "Users can view their own bookings" 
ON bookings FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Policy untuk admin melihat semua bookings
CREATE POLICY "Admins can view all bookings" 
ON bookings FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Policy untuk insert data
CREATE POLICY "Users can insert their own bookings" 
ON bookings FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Policy untuk update data
CREATE POLICY "Users can update their own bookings" 
ON bookings FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Policy untuk admin mengupdate semua bookings
CREATE POLICY "Admins can update all bookings" 
ON bookings FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
`;
};
