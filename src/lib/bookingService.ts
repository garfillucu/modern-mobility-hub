
import { supabase } from './supabase';
import { Booking } from './supabase';
import { getCarById } from './api';

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

// Function for retrieving user bookings
export const getUserBookings = async (userId: string) => {
  try {
    // First check if bookings table exists
    const { error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.error('Bookings table does not exist');
      return [];
    }
    
    // Try with join first
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, cars(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (joinError) {
      console.warn('Join query failed, falling back to separate queries:', joinError);
      
      // Fallback: Get bookings without join
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // If we have bookings, fetch car details separately for each
      if (bookings && bookings.length > 0) {
        const bookingsWithCars = await Promise.all(
          bookings.map(async (booking) => {
            try {
              const car = await getCarById(booking.car_id);
              return { ...booking, cars: car };
            } catch (carError) {
              console.error(`Error fetching car ${booking.car_id}:`, carError);
              return { ...booking, cars: null };
            }
          })
        );
        
        return bookingsWithCars;
      }
      
      return bookings || [];
    }
  } catch (error) {
    console.error('Error in getUserBookings function:', error);
    throw error;
  }
};

// Function for updating booking status
export const updateBookingStatus = async (id: string, status: Booking['status']) => {
  try {
    // First check if bookings table exists
    const { error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.error('Bookings table does not exist');
      throw new Error('Tabel pemesanan belum dibuat');
    }
    
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

// Function for retrieving all bookings
export const getAllBookings = async () => {
  try {
    // First check if bookings table exists
    const { error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.error('Bookings table does not exist');
      return [];
    }
    
    // Tambahkan logging untuk debugging
    console.log('Mengambil semua booking dari database...');
    
    // Try with join first
    try {
      // Tambahkan opsi { count: 'exact' } untuk melihat jumlah total data
      const { data, error, count } = await supabase
        .from('bookings')
        .select('*, cars(*)', { count: 'exact' });
        
      console.log('Hasil query bookings:', { data, count, error });
        
      if (error) {
        console.error('Error saat mengambil booking:', error);
        throw error;
      }
      
      return data || [];
    } catch (joinError) {
      console.warn('Join query failed, falling back to separate queries:', joinError);
      
      // Fallback: Get bookings without join
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Fallback query error:', error);
        throw error;
      }
      
      console.log('Fallback query results:', bookings);
      
      // If we have bookings, fetch car details separately for each
      if (bookings && bookings.length > 0) {
        const bookingsWithCars = await Promise.all(
          bookings.map(async (booking) => {
            try {
              const car = await getCarById(booking.car_id);
              return { ...booking, cars: car };
            } catch (carError) {
              console.error(`Error fetching car ${booking.car_id}:`, carError);
              return { ...booking, cars: null };
            }
          })
        );
        
        return bookingsWithCars;
      }
      
      return bookings || [];
    }
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
