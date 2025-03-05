import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';
import { createCarsTable, seedCarsData, createBookingsTable } from './api';

export const initDatabase = async () => {
  console.log('Initializing database...');
  
  try {
    // Cek dan buat tabel cars
    const carsTableCreated = await createCarsTable();
    
    // Cek dan seed data cars
    if (carsTableCreated) {
      await seedCarsData();
    }
    
    // Cek dan buat tabel bookings
    await createBookingsTable();
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};
