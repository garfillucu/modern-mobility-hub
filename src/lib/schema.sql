
-- Membuat fungsi untuk membuat tabel users
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
  -- Membuat tabel users jika belum ada
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Membuat indeks pada kolom email untuk mempercepat pencarian
  CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
END;
$$ LANGUAGE plpgsql;

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
