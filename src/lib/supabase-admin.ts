
import { supabase } from './supabase';

// Fungsi untuk mengeksekusi SQL langsung di Supabase
export const executeSql = async (sql: string) => {
  try {
    // Verifikasi apakah fungsi exec_sql sudah ada
    const { data: functionExists, error: checkError } = await supabase.rpc('function_exists', { 
      function_name: 'exec_sql' 
    });
    
    // Jika fungsi tidak ada atau terjadi error, buat fungsi baru
    if (checkError || !functionExists) {
      console.log('Membuat fungsi exec_sql...');
      
      // Buat fungsi eksekusi SQL 
      const { error: createError } = await supabase.rpc('create_exec_sql_function', {
        sql_query: `
          CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$;

          CREATE OR REPLACE FUNCTION function_exists(function_name text)
          RETURNS boolean
          LANGUAGE plpgsql
          AS $$
          DECLARE
              func_exists boolean;
          BEGIN
              SELECT EXISTS (
                  SELECT 1
                  FROM pg_proc
                  WHERE proname = function_name
              ) INTO func_exists;
              
              RETURN func_exists;
          END;
          $$;
        `
      });
      
      if (createError) {
        console.error('Error creating exec_sql function:', createError);
        throw createError;
      }
    }
    
    // Eksekusi SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in executeSql function:', error);
    throw error;
  }
};

// Fungsi untuk membuat tabel bookings secara manual
export const createBookingsTableManually = async () => {
  const sql = `
    -- Buat tabel bookings
    CREATE TABLE IF NOT EXISTS public.bookings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      car_id UUID NOT NULL,
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
  `;
  
  return executeSql(sql);
};
