
import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';
import { createCarsTable, seedCarsData, createBookingsTable } from './api';
import { getCreateBookingsSql } from './sqlQueries';

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
        
        // Log SQL untuk debugging
        console.log('Menjalankan SQL untuk membuat tabel bookings...');
        
        const { error } = await supabase.rpc('exec_sql', { sql_query: bookingsSql });
        
        if (error) {
          console.error('Error executing bookings SQL:', error);
          
          // Metode alternatif: buat tabel secara manual menggunakan query dasar
          console.log('Mencoba metode alternatif membuat tabel bookings...');
          
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
              
              -- Nonaktifkan RLS dulu untuk memastikan admin dapat mengakses semua data
              ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
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
        
        // Reset RLS policies untuk memastikan admin bisa melihat semua data
        console.log('Memeriksa dan memperbarui kebijakan RLS...');
        
        const { error: rlsError } = await supabase.rpc('exec_sql', {
          sql_query: `
            -- Nonaktifkan RLS dulu
            ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
            
            -- Aktifkan kembali dengan policy yang benar
            ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
            
            -- Hapus policy lama jika ada
            DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
            DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
            
            -- Buat policy baru untuk admin
            CREATE POLICY "Admins can do everything" 
            ON bookings 
            TO authenticated 
            USING (
              (SELECT role FROM users WHERE users.id = auth.uid()) = 'admin'
            ) 
            WITH CHECK (
              (SELECT role FROM users WHERE users.id = auth.uid()) = 'admin'
            );
            
            -- Policy untuk user biasa
            CREATE POLICY "Users can view their own bookings" 
            ON bookings FOR SELECT 
            TO authenticated 
            USING (user_id = auth.uid());
          `
        });
        
        if (rlsError) {
          console.error('Error updating RLS policies:', rlsError);
        } else {
          console.log('RLS policies updated successfully');
        }
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
