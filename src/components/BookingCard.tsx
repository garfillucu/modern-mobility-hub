
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Booking, Car } from '@/lib/supabase';
import { updateBookingStatus } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Car as CarIcon, 
  User, 
  Phone, 
  Mail 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface BookingCardProps {
  booking: any; // Menggunakan any karena struktur dari Supabase join query
  onStatusChange?: () => void;
}

const BookingCard = ({ booking, onStatusChange }: BookingCardProps) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Ekstrak data mobil
  const car: Car = booking.cars;
  
  // Format tanggal
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  // Warna badge berdasarkan status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 hover:bg-green-600';
      case 'completed':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'cancelled':
        return 'bg-destructive hover:bg-destructive/90';
      default:
        return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };

  // Nama status dalam bahasa Indonesia
  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  // Handle perubahan status
  const handleStatusChange = async (newStatus: Booking['status']) => {
    try {
      setIsUpdating(true);
      await updateBookingStatus(booking.id, newStatus);
      toast({
        title: "Status Diperbarui",
        description: `Status pemesanan telah diubah menjadi ${getStatusName(newStatus)}`,
      });
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Gagal Mengubah Status",
        description: "Terjadi kesalahan saat mengubah status pemesanan",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-md border mb-4">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">{car?.name || 'Mobil Tidak Tersedia'}</h3>
          <div className="text-sm text-muted-foreground">
            ID Booking: {booking.id.substring(0, 8)}...
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(booking.status)}>
            {getStatusName(booking.status)}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Sembunyikan detail" : "Tampilkan detail"}
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Detail Section (Collapsed by default) */}
      {expanded && (
        <div className="p-4 pt-0 border-t">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Informasi Mobil */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CarIcon className="h-4 w-4" /> Informasi Mobil
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merk:</span>
                  <span>{car?.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tahun:</span>
                  <span>{car?.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transmisi:</span>
                  <span>{car?.transmission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategori:</span>
                  <span>{car?.category}</span>
                </div>
              </div>
            </div>

            {/* Informasi Pemesanan */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Informasi Pemesanan
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Mulai:</span>
                  <span>{formatDate(booking.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Selesai:</span>
                  <span>{formatDate(booking.end_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga per Hari:</span>
                  <span>Rp {(car?.pricePerDay || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Harga:</span>
                  <span>Rp {(booking.total_price || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Informasi Pelanggan */}
            <div className="md:col-span-2">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> Informasi Pelanggan
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.customer_email}</span>
                </div>
              </div>
            </div>

            {/* Catatan */}
            {booking.notes && (
              <div className="md:col-span-2">
                <h4 className="font-medium mb-2">Catatan</h4>
                <p className="text-sm bg-muted p-2 rounded">{booking.notes}</p>
              </div>
            )}

            {/* Tombol aksi untuk admin */}
            {isAdmin && booking.status === 'pending' && (
              <div className="md:col-span-2 flex gap-2 mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" disabled={isUpdating}>
                      Konfirmasi Pemesanan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Pemesanan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin mengkonfirmasi pemesanan ini?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStatusChange('confirmed')}>
                        Ya, Konfirmasi
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isUpdating}>
                      Tolak Pemesanan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tolak Pemesanan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menolak pemesanan ini?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleStatusChange('cancelled')}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Ya, Tolak
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            
            {isAdmin && booking.status === 'confirmed' && (
              <div className="md:col-span-2 flex gap-2 mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" disabled={isUpdating}>
                      Tandai Selesai
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tandai Selesai</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menandai pemesanan ini sebagai selesai?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStatusChange('completed')}>
                        Ya, Selesai
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
