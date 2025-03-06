
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import BookingCard from '@/components/BookingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getAllBookings } from '../../lib/bookingService';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
    
    // Check admin permissions untuk debugging
    const checkAdminPermissions = async () => {
      if (user) {
        console.log('Memeriksa peran admin untuk:', user.email);
        try {
          // Periksa peran user dari database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (userError) {
            console.error('Error memeriksa peran user:', userError);
          } else {
            console.log('Peran user dari database:', userData?.role);
          }
          
          // Coba akses langsung ke tabel bookings untuk mendiagnosa masalah RLS
          const { data: bookingsData, error: bookingsError, count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact' });
            
          console.log('Akses langsung ke bookings:', {
            count,
            error: bookingsError,
            data: bookingsData?.length
          });
        } catch (err) {
          console.error('Error memeriksa permission:', err);
        }
      }
    };
    
    checkAdminPermissions();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Mengambil data booking di halaman Admin...');
      
      const data = await getAllBookings();
      console.log('Hasil getAllBookings:', data?.length || 0, 'bookings');
      
      if (data && data.length > 0) {
        console.log('Sample booking data:', data[0]);
      } else {
        console.log('Tidak ada data booking yang ditemukan');
      }
      
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pemesanan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings berdasarkan tab aktif
  const getFilteredBookings = () => {
    if (activeTab === 'all') return bookings;
    return bookings.filter(booking => booking.status === activeTab);
  };

  // Dapatkan jumlah pemesanan untuk setiap status
  const getBookingCounts = () => {
    const counts = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    
    bookings.forEach(booking => {
      if (counts[booking.status as keyof typeof counts] !== undefined) {
        counts[booking.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };
  
  const bookingCounts = getBookingCounts();

  return (
    <div className="container px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pemesanan Mobil</h1>
        <Button onClick={fetchBookings} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-5 w-full mb-4">
          <TabsTrigger value="all">
            Semua 
            <span className="ml-2 bg-muted px-2 py-0.5 rounded-full text-xs">
              {bookingCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Menunggu
            <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
              {bookingCounts.pending}
            </span>
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Dikonfirmasi
            <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
              {bookingCounts.confirmed}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Selesai
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
              {bookingCounts.completed}
            </span>
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Dibatalkan
            <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
              {bookingCounts.cancelled}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : getFilteredBookings().length === 0 ? (
            <div className="text-center py-16 bg-muted/50 rounded-lg">
              <p className="text-lg mb-4">Tidak ada data pemesanan {activeTab !== 'all' ? 'dengan status ini' : ''}</p>
              <div className="flex flex-col items-center gap-4">
                <p className="text-muted-foreground">
                  {bookings.length === 0 ? 
                    "Belum ada pemesanan yang dibuat oleh user" :
                    `Ada ${bookings.length} pemesanan total, tapi tidak ada dengan status ${activeTab}`
                  }
                </p>
                <Button onClick={fetchBookings} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredBookings().map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking}
                  onStatusChange={fetchBookings}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBookings;
