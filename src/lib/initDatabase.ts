
import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';
import { seedCarsData } from './api';

// Fungsi untuk melakukan inisialisasi database
export const initDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Periksa apakah tabel users sudah ada
    const { data: userTableExists, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    // Jika ada error, berarti tabel mungkin belum ada
    if (userError) {
      console.log('Users table does not exist yet. Please create it in Supabase dashboard.');
      toast({
        title: "Database Setup Required",
        description: "Please set up the database tables in Supabase dashboard first.",
        variant: "destructive"
      });
      return false;
    }
    
    // Periksa apakah tabel cars sudah ada
    const { data: existingCars, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .limit(1);
    
    // Jika ada error, berarti tabel mungkin belum ada
    if (carsError) {
      console.log('Cars table does not exist yet. Please create it in Supabase dashboard.');
      toast({
        title: "Database Setup Required",
        description: "Please set up the database tables in Supabase dashboard first.",
        variant: "destructive"
      });
      return false;
    }
    
    // Jika tabel cars ada, cek apakah perlu seed data
    if (!carsError) {
      const { count } = await supabase
        .from('cars')
        .select('*', { count: 'exact' });
        
      // Jika tabel kosong atau hanya sedikit datanya, tambahkan seed data
      if (!count || count < 5) {
        console.log('Seeding cars data...');
        await seedCarsData();
      }
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    toast({
      title: "Database Error",
      description: "Gagal menginisialisasi database. Silakan buat tabel melalui Supabase dashboard.",
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
