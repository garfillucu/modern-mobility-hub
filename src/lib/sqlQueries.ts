
// File khusus untuk menyimpan query SQL

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

-- Set up RLS policies - PERBAIKAN DISINI
-- Hapus RLS dulu jika sudah ada
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;

-- Aktifkan kembali RLS dengan policy yang benar
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;

-- Policy baru yang lebih permisif untuk admin
CREATE POLICY "Admins can do everything" 
ON bookings 
TO authenticated 
USING (
  (SELECT role FROM users WHERE users.id = auth.uid()) = 'admin'
) 
WITH CHECK (
  (SELECT role FROM users WHERE users.id = auth.uid()) = 'admin'
);

-- Policy untuk user biasa melihat booking miliknya sendiri
CREATE POLICY "Users can view their own bookings" 
ON bookings FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Policy untuk user biasa menambahkan booking
CREATE POLICY "Users can insert their own bookings" 
ON bookings FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Policy untuk user biasa mengubah booking miliknya
CREATE POLICY "Users can update their own bookings" 
ON bookings FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());
`;
};
