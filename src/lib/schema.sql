
-- Membuat tabel users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Membuat indeks pada kolom email untuk mempercepat pencarian
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Membuat tabel cars
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  year INTEGER NOT NULL,
  pricePerDay INTEGER NOT NULL,
  imageUrl TEXT,
  transmission TEXT,
  capacity INTEGER,
  category TEXT,
  description TEXT,
  features TEXT[]
);

-- Membuat indeks pada beberapa kolom untuk mempercepat filter dan pencarian
CREATE INDEX IF NOT EXISTS cars_brand_idx ON cars (brand);
CREATE INDEX IF NOT EXISTS cars_transmission_idx ON cars (transmission);
CREATE INDEX IF NOT EXISTS cars_category_idx ON cars (category);

-- Membuat tabel bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Membuat indeks pada tabel bookings
CREATE INDEX IF NOT EXISTS bookings_car_id_idx ON bookings (car_id);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings (user_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);

-- Buat RLS policy untuk tabel cars
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- Policy untuk membaca data
CREATE POLICY "Allow read for all users" 
ON cars FOR SELECT USING (true);

-- Policy untuk insert/update/delete data untuk admin
CREATE POLICY "Allow insert for admin users" 
ON cars FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Allow update for admin users" 
ON cars FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Allow delete for admin users" 
ON cars FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- RLS policy untuk tabel bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RESET: Menghapus semua policy untuk tabel bookings agar bisa dibuat ulang dari awal
DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;

-- PERBAIKAN: Policy untuk insert yang lebih sederhana
-- Mengizinkan SEMUA pengguna terautentikasi untuk membuat booking tanpa syarat
CREATE POLICY "Allow all authenticated users to insert bookings" 
ON bookings FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy membaca data bookings (user hanya bisa lihat miliknya)
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

-- Policy untuk update data bookings oleh user
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

-- Konfigurasi Storage untuk car-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy untuk upload gambar - Policy yang lebih fleksibel
DROP POLICY IF EXISTS "Allow public viewing of car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload car images" ON storage.objects;

-- Policy baru yang lebih sederhana untuk melihat gambar
CREATE POLICY "Allow public viewing of car images"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-images');

-- Policy baru yang lebih sederhana untuk upload gambar
CREATE POLICY "Allow authenticated users to upload car images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-images');

-- Policy tambahan untuk memastikan admin dapat melakukan update dan delete pada gambar
CREATE POLICY "Allow admin to update car images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'car-images' AND
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Allow admin to delete car images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'car-images' AND
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
