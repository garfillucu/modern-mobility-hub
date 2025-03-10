
import { supabase } from './supabase';
import { Booking } from './supabase';
import { getCarById } from './api';

// Fungsi untuk membuat pemesanan baru
export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at'>) => {
  try {
    // Dapatkan session user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session && !booking.user_id) {
      console.error('Error: User tidak terautentikasi');
      throw new Error('User tidak terautentikasi');
    }
    
    // Gunakan user_id dari session jika tidak disediakan
    const userId = booking.user_id || session?.user.id;
    console.log('Creating booking for user_id:', userId);
    
    // Log data booking yang akan dibuat (tanpa data sensitif)
    console.log('Booking data:', {
      car_id: booking.car_id,
      start_date: booking.start_date,
      end_date: booking.end_date,
      total_price: booking.total_price,
      status: booking.status
    });
    
    // Cek peran pengguna untuk keperluan debugging
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.warn('Tidak dapat mengambil data peran pengguna:', userError);
      } else {
        console.log('User role:', userData?.role);
      }
    } catch (roleError) {
      console.warn('Error saat memeriksa peran pengguna:', roleError);
    }
    
    // Cek apakah akses ke tabel bookings tersedia
    const { error: testError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('Test akses ke tabel bookings gagal:', testError);
    } else {
      console.log('Test akses ke tabel bookings berhasil');
    }
    
    // Insert booking data dengan error handling yang lebih baik
    console.log('Mencoba membuat booking baru...');
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ 
        ...booking, 
        user_id: userId,
        // Pastikan status default jika tidak ada
        status: booking.status || 'pending'
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating booking:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Log lebih detail untuk debugging RLS
      if (error.code === '42501') {
        console.error('Ini adalah error RLS policy. Pastikan policy sudah benar!');
        console.error('User ID:', userId);
        console.error('Booking car_id:', booking.car_id);
      }
      
      throw error;
    }
    
    console.log('Booking created successfully:', data?.id);
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
    // Tambahkan logging untuk debugging
    console.log('Mengambil semua booking dari database...');
    
    // Cek apakah kita mendapatkan sesi user
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Active' : 'Not active');
    
    // Log user ID dan role
    if (session?.user) {
      // Periksa peran user dari database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      console.log('Peran pengguna saat ini:', userData?.role);
    }
    
    // Jalankan query dengan RLS bypass untuk admin
    const { data, error, count } = await supabase
      .from('bookings')
      .select('*, cars(*)', { count: 'exact' });
      
    console.log('Hasil query bookings:', { count, error: error?.message });
    
    if (error) {
      console.error('Error saat mengambil booking:', error);
      throw error;
    }
    
    // Urutkan data berdasarkan tanggal terbaru
    const sortedData = data ? [...data].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Urutkan dari yang terbaru
    }) : [];
    
    console.log(`Berhasil mengambil ${sortedData.length} booking`);
    return sortedData;
  } catch (error) {
    console.error('Error in getAllBookings function:', error);
    throw error;
  }
};

// Function for creating bookings table
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
