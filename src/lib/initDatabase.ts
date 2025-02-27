
import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';

// Query untuk membuat tabel users
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
`;

// Query untuk membuat tabel cars
const createCarsTable = `
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

CREATE INDEX IF NOT EXISTS cars_brand_idx ON cars (brand);
CREATE INDEX IF NOT EXISTS cars_transmission_idx ON cars (transmission);
CREATE INDEX IF NOT EXISTS cars_category_idx ON cars (category);
`;

// Fungsi untuk melakukan inisialisasi database
export const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Membuat tabel users
    const { error: usersError } = await supabase.rpc('exec', { query: createUsersTable });
    if (usersError) {
      console.error('Error creating users table:', usersError);
      throw usersError;
    }
    
    // Membuat tabel cars
    const { error: carsError } = await supabase.rpc('exec', { query: createCarsTable });
    if (carsError) {
      console.error('Error creating cars table:', carsError);
      throw carsError;
    }
    
    console.log('Database initialized successfully');
    
    // Membuat contoh data mobil jika tabel kosong
    const { data: existingCars } = await supabase.from('cars').select('id').limit(1);
    
    if (!existingCars || existingCars.length === 0) {
      console.log('Adding sample cars...');
      await addSampleCars();
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    toast({
      title: "Database Error",
      description: "Gagal menginisialisasi database. Silakan coba lagi nanti.",
      variant: "destructive"
    });
    return false;
  }
};

// Fungsi untuk menambahkan contoh data mobil
const addSampleCars = async () => {
  const sampleCars = [
    {
      name: 'Toyota Avanza',
      brand: 'Toyota',
      year: 2022,
      pricePerDay: 300000,
      imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2156&auto=format&fit=crop',
      transmission: 'Manual',
      capacity: 7,
      category: 'MPV',
      description: 'MPV nyaman untuk keluarga dengan konsumsi BBM yang efisien. Cocok untuk perjalanan keluarga.',
      features: ['AC', 'Audio System', 'Power Window', 'Central Lock', 'Airbag']
    },
    {
      name: 'Honda Civic',
      brand: 'Honda',
      year: 2023,
      pricePerDay: 500000,
      imageUrl: 'https://images.unsplash.com/photo-1604054094723-3a949e4fca0b?q=80&w=2067&auto=format&fit=crop',
      transmission: 'Automatic',
      capacity: 5,
      category: 'Sedan',
      description: 'Sedan sporty dengan performa tinggi dan interior mewah. Ideal untuk perjalanan bisnis.',
      features: ['Leather Seats', 'Sunroof', 'Keyless Entry', 'Push Start', 'Cruise Control']
    },
    {
      name: 'Toyota Fortuner',
      brand: 'Toyota',
      year: 2022,
      pricePerDay: 800000,
      imageUrl: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?q=80&w=2067&auto=format&fit=crop',
      transmission: 'Automatic',
      capacity: 7,
      category: 'SUV',
      description: 'SUV tangguh dengan ground clearance tinggi. Cocok untuk segala medan.',
      features: ['4x4', 'Hill Start Assist', 'Parking Camera', 'Premium Audio', 'Multi-terrain Select']
    }
  ];
  
  const { error } = await supabase.from('cars').insert(sampleCars);
  
  if (error) {
    console.error('Error adding sample cars:', error);
    throw error;
  }
  
  console.log('Sample cars added successfully');
};
