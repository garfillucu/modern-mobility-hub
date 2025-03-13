
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
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    // Insert booking data dengan error handling yang lebih baik
    console.log('Mencoba membuat booking baru...');
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ 
        ...booking, 
        user_id: userId,
        // Pastikan status default jika tidak ada
        status: booking.status || 'pending',
        // Tambahkan data pembayaran
        payment_status: 'unpaid',
        invoice_number: invoiceNumber
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

// Fungsi baru untuk pembayaran
export const createPayment = async (bookingId: string, payment: {
  amount: number;
  payment_method: string;
  payment_proof?: string;
  notes?: string;
}) => {
  try {
    // Generate invoice number jika belum ada
    const invoiceNumber = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    // Insert payment data
    const { data, error } = await supabase
      .from('payments')
      .insert([{ 
        booking_id: bookingId,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_status: 'pending', // Admin akan verifikasi pembayaran
        invoice_number: invoiceNumber,
        payment_proof: payment.payment_proof,
        notes: payment.notes
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
    
    // Update booking payment status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        payment_status: 'pending_verification',
        payment_amount: supabase.rpc('add_payment_amount', { 
          booking_id: bookingId, 
          amount: payment.amount 
        })
      })
      .eq('id', bookingId);
      
    if (updateError) {
      console.error('Error updating booking payment status:', updateError);
      throw updateError;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createPayment function:', error);
    throw error;
  }
};

// Fungsi untuk mengambil pembayaran berdasarkan booking ID
export const getPaymentsByBookingId = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('payment_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getPaymentsByBookingId function:', error);
    throw error;
  }
};

// Fungsi untuk verifikasi pembayaran (hanya admin)
export const verifyPayment = async (paymentId: string, isApproved: boolean) => {
  try {
    // Update payment status
    const { data, error } = await supabase
      .from('payments')
      .update({ 
        payment_status: isApproved ? 'completed' : 'rejected' 
      })
      .eq('id', paymentId)
      .select()
      .single();
      
    if (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
    
    // Jika disetujui, update juga status booking
    if (isApproved) {
      const booking = await getBookingById(data.booking_id);
      
      // Periksa jika total pembayaran sudah mencapai total harga
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('booking_id', data.booking_id)
        .eq('payment_status', 'completed');
        
      const totalPaid = paymentsData?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const paymentStatus = totalPaid >= booking.total_price ? 'paid' : 'partially_paid';
      
      // Update booking payment status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          payment_status: paymentStatus,
          status: paymentStatus === 'paid' ? 'confirmed' : booking.status
        })
        .eq('id', data.booking_id);
        
      if (updateError) {
        console.error('Error updating booking status after payment:', updateError);
        throw updateError;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error in verifyPayment function:', error);
    throw error;
  }
};

// Fungsi untuk pengambilan mobil
export const recordPickup = async (bookingId: string, pickupData: {
  pickup_location: string;
  pickup_time: string; // ISO date string
  notes?: string;
  fuel_level?: number;
  odometer?: number;
  exterior_condition?: string;
  interior_condition?: string;
  damage_notes?: string;
  images?: string[];
}) => {
  try {
    // Update booking dengan info pengambilan
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        pickup_location: pickupData.pickup_location,
        pickup_time: pickupData.pickup_time,
        is_pickup_completed: true,
        status: 'in_use' // Ubah status menjadi sedang digunakan
      })
      .eq('id', bookingId)
      .select()
      .single();
      
    if (error) {
      console.error('Error recording pickup:', error);
      throw error;
    }
    
    // Tambahkan data inspeksi pengambilan
    const { error: inspectionError } = await supabase
      .from('inspections')
      .insert([{
        booking_id: bookingId,
        type: 'pickup',
        notes: pickupData.notes,
        fuel_level: pickupData.fuel_level,
        odometer: pickupData.odometer,
        exterior_condition: pickupData.exterior_condition,
        interior_condition: pickupData.interior_condition,
        damage_notes: pickupData.damage_notes,
        images: pickupData.images
      }]);
      
    if (inspectionError) {
      console.error('Error recording pickup inspection:', inspectionError);
      throw inspectionError;
    }
    
    return data;
  } catch (error) {
    console.error('Error in recordPickup function:', error);
    throw error;
  }
};

// Fungsi untuk pengembalian mobil
export const recordReturn = async (bookingId: string, returnData: {
  return_location: string;
  return_time: string; // ISO date string
  notes?: string;
  fuel_level?: number;
  odometer?: number;
  exterior_condition?: string;
  interior_condition?: string;
  damage_notes?: string;
  images?: string[];
}) => {
  try {
    // Update booking dengan info pengembalian
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        return_location: returnData.return_location,
        return_time: returnData.return_time,
        is_return_completed: true,
        status: 'completed' // Ubah status menjadi selesai
      })
      .eq('id', bookingId)
      .select()
      .single();
      
    if (error) {
      console.error('Error recording return:', error);
      throw error;
    }
    
    // Tambahkan data inspeksi pengembalian
    const { error: inspectionError } = await supabase
      .from('inspections')
      .insert([{
        booking_id: bookingId,
        type: 'return',
        notes: returnData.notes,
        fuel_level: returnData.fuel_level,
        odometer: returnData.odometer,
        exterior_condition: returnData.exterior_condition,
        interior_condition: returnData.interior_condition,
        damage_notes: returnData.damage_notes,
        images: returnData.images
      }]);
      
    if (inspectionError) {
      console.error('Error recording return inspection:', inspectionError);
      throw inspectionError;
    }
    
    return data;
  } catch (error) {
    console.error('Error in recordReturn function:', error);
    throw error;
  }
};

// Fungsi untuk mengambil inspeksi mobil
export const getInspections = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('booking_id', bookingId)
      .order('inspection_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching inspections:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getInspections function:', error);
    throw error;
  }
};
