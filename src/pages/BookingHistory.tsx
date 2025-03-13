
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookings } from '../lib/api';
import { toast } from '@/components/ui/use-toast';
import BookingCard from '@/components/BookingCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BookingHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getUserBookings(user.id);
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      toast({
        title: "Error",
        description: "Gagal memuat riwayat pemesanan",
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
      in_use: 0,
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
      <h1 className="text-3xl font-bold mb-6">Riwayat Pemesanan</h1>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-6 w-full mb-4">
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
          <TabsTrigger value="in_use">
            Digunakan
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
              {bookingCounts.in_use}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Selesai
            <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
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
            <div className="flex flex-col items-center justify-center py-16 bg-muted/50 rounded-lg">
              <p className="text-lg mb-4">Belum ada riwayat pemesanan {activeTab !== 'all' ? 'dengan status ini' : ''}</p>
              <Button onClick={() => navigate('/cars')}>
                Cari Mobil Sekarang
              </Button>
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

export default BookingHistory;
