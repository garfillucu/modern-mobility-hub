
import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';
import { createCarsTable, seedCarsData, createBookingsTable, getCreateBookingsSql } from './api';

export const initDatabase = async () => {
  console.log('Initializing database...');
  
  try {
    // Cek dan buat tabel cars
    const carsTableCreated = await createCarsTable();
    
    // Cek dan seed data cars
    if (carsTableCreated) {
      await seedCarsData();
    }
    
    // Cek apakah tabel bookings sudah ada
    try {
      const { error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log('Tabel bookings tidak ditemukan, membuat tabel...');
        
        // Execute SQL langsung untuk membuat tabel bookings
        const bookingsSql = getCreateBookingsSql();
        const { error } = await supabase.rpc('exec_sql', { sql_query: bookingsSql });
        
        if (error) {
          console.error('Error executing bookings SQL:', error);
          
          // Metode alternatif: buat tabel secara manual menggunakan query dasar
          const { error: manualError } = await supabase.rpc('exec_sql', {
            sql_query: `
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
            `
          });
          
          if (manualError) {
            console.error('Error creating bookings table manually:', manualError);
            throw manualError;
          }
          
          console.log('Tabel bookings berhasil dibuat secara manual');
        } else {
          console.log('Tabel bookings berhasil dibuat dengan SQL');
        }
      } else {
        console.log('Tabel bookings sudah ada');
      }
    } catch (bookingError) {
      console.error('Error checking/creating bookings table:', bookingError);
      toast({
        title: "Error",
        description: "Gagal membuat tabel pemesanan",
        variant: "destructive"
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    toast({
      title: "Error",
      description: "Gagal menginisialisasi database",
      variant: "destructive"
    });
    return false;
  }
};
