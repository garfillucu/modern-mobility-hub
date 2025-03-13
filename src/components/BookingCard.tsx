
import { useState } from 'react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from './ui/use-toast';
import { updateBookingStatus } from '../lib/bookingService';
import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, CreditCard, Car, ArrowRight, Loader2 } from 'lucide-react';
import BookingDetails from './BookingDetails';

const BookingCard = ({ booking, onStatusChange }: { booking: any, onStatusChange?: () => void }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean, action: string, title: string, description: string }>({
    isOpen: false,
    action: '',
    title: '',
    description: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const totalLamaSewa = Math.round(
    (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Dikonfirmasi</Badge>;
      case 'in_use':
        return <Badge className="bg-blue-100 text-blue-800">Sedang Digunakan</Badge>;
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800">Selesai</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Lunas</Badge>;
      case 'partially_paid':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Sebagian</Badge>;
      case 'pending_verification':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Verifikasi</Badge>;
      case 'unpaid':
      default:
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Belum Bayar</Badge>;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await updateBookingStatus(booking.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Booking status changed to ${newStatus}`,
      });
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setAlertDialog({ ...alertDialog, isOpen: false });
    }
  };

  const confirmStatusChange = (newStatus: string) => {
    const statusMessages = {
      confirmed: {
        title: "Konfirmasi Pemesanan",
        description: "Apakah Anda yakin ingin mengkonfirmasi pemesanan ini? Status akan berubah menjadi 'Confirmed'."
      },
      cancelled: {
        title: "Batalkan Pemesanan",
        description: "Apakah Anda yakin ingin membatalkan pemesanan ini? Tindakan ini tidak dapat diubah."
      },
      completed: {
        title: "Selesaikan Pemesanan",
        description: "Apakah Anda yakin ingin menandai pemesanan ini sebagai selesai?"
      }
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] || {
      title: "Ubah Status",
      description: `Apakah Anda yakin ingin mengubah status menjadi '${newStatus}'?`
    };

    setAlertDialog({
      isOpen: true,
      action: newStatus,
      title: message.title,
      description: message.description
    });
  };

  return (
    <>
      <Card className="overflow-hidden transition-all">
        <CardContent className="p-0">
          {/* Header Section with Car Info */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-start space-x-4">
              {booking.cars?.imageUrl && (
                <div className="hidden md:block w-20 h-20 rounded-md overflow-hidden shrink-0">
                  <img 
                    src={booking.cars.imageUrl} 
                    alt={booking.cars?.name || 'Car'} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{booking.cars?.name || 'Mobil Rental'}</h3>
                  {getStatusBadge(booking.status)}
                  {getPaymentStatusBadge(booking.payment_status)}
                </div>
                
                <div className="flex flex-wrap text-sm text-muted-foreground gap-x-3 gap-y-1">
                  {booking.cars?.transmission && (
                    <span className="flex items-center">
                      <Car className="w-3.5 h-3.5 mr-1" />
                      {booking.cars.transmission}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {format(new Date(booking.start_date), 'dd/MM/yyyy', { locale: id })}
                    {' - '}
                    {format(new Date(booking.end_date), 'dd/MM/yyyy', { locale: id })}
                  </span>
                  <span className="flex items-center">
                    <CreditCard className="w-3.5 h-3.5 mr-1" />
                    Rp {booking.total_price.toLocaleString('id-ID')}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <span className="text-sm font-medium">
                    {booking.customer_name}
                  </span>
                  <span className="mx-1.5">•</span>
                  <span className="text-muted-foreground">
                    {booking.customer_phone}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="shrink-0 flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-auto"
              >
                {isExpanded ? 'Sembunyikan' : 'Lihat Detail'}
                <ArrowRight className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Expanded details section */}
          {isExpanded && (
            <>
              <Separator />
              <div className="p-4 md:p-6">
                <BookingDetails 
                  booking={booking}
                  isAdmin={isAdmin}
                  onStatusUpdate={onStatusChange}
                />
              </div>
            </>
          )}
        </CardContent>
        
        {/* Admin Actions */}
        {isAdmin && (
          <CardFooter className="p-4 flex-wrap gap-2 border-t">
            <div className="flex flex-wrap gap-2 ml-auto">
              {booking.status === 'pending' && (
                <>
                  <Button
                    onClick={() => confirmStatusChange('confirmed')}
                    variant="default"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Konfirmasi
                  </Button>
                  <Button
                    onClick={() => confirmStatusChange('cancelled')}
                    variant="destructive"
                    size="sm"
                    disabled={isLoading}
                  >
                    Tolak
                  </Button>
                </>
              )}
              
              {(booking.status === 'confirmed' && booking.payment_status === 'paid') && (
                <Button
                  onClick={() => setIsExpanded(true)}
                  variant="default"
                  size="sm"
                >
                  Catat Pengambilan
                </Button>
              )}
              
              {booking.status === 'in_use' && (
                <Button
                  onClick={() => setIsExpanded(true)}
                  variant="default"
                  size="sm"
                >
                  Catat Pengembalian
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Alert Dialog for status change confirmation */}
      <AlertDialog open={alertDialog.isOpen} onOpenChange={(open) => setAlertDialog({ ...alertDialog, isOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusChange(alertDialog.action)}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Konfirmasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookingCard;
