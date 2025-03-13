
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Car, Calendar, CreditCard, Users, Phone, Mail, FileText } from "lucide-react";
import PaymentDetails from "./PaymentDetails";
import PickupReturnCard from "./PickupReturnCard";

interface BookingDetailsProps {
  booking: any;
  isAdmin?: boolean;
  onStatusUpdate?: () => void;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ 
  booking, 
  isAdmin = false,
  onStatusUpdate
}) => {
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

  return (
    <div className="w-full">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment">Pembayaran</TabsTrigger>
          <TabsTrigger value="pickup-return">Pengambilan & Pengembalian</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Detail Pemesanan</span>
                {getStatusBadge(booking.status)}
              </CardTitle>
              <CardDescription>
                Informasi lengkap tentang pemesanan ini
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Car Information */}
              <div className="flex items-start">
                <div className="mr-3 p-2 bg-primary/10 rounded-full">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{booking.cars?.name || 'N/A'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {booking.cars?.brand || 'N/A'} • {booking.cars?.year || 'N/A'} • {booking.cars?.transmission || 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Date & Price */}
              <div className="flex items-start">
                <div className="mr-3 p-2 bg-primary/10 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Tanggal Sewa</h4>
                  <p className="text-sm">
                    {format(new Date(booking.start_date), 'dd MMMM yyyy', { locale: id })} - {format(new Date(booking.end_date), 'dd MMMM yyyy', { locale: id })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Durasi: {Math.round((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24))} hari
                  </p>
                </div>
              </div>
              
              {/* Price Information */}
              <div className="flex items-start">
                <div className="mr-3 p-2 bg-primary/10 rounded-full">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Informasi Harga</h4>
                  <p className="text-sm">
                    Total: <span className="font-semibold">Rp {booking.total_price.toLocaleString('id-ID')}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Status Pembayaran: {booking.payment_status === 'paid' ? 'Lunas' : 
                                       booking.payment_status === 'partially_paid' ? 'Sebagian' : 
                                       booking.payment_status === 'pending_verification' ? 'Menunggu Verifikasi' : 'Belum Dibayar'}
                  </p>
                </div>
              </div>
              
              {/* Customer Information */}
              <div className="flex items-start">
                <div className="mr-3 p-2 bg-primary/10 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Informasi Pelanggan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{booking.customer_name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{booking.customer_phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-1" />
                      <span>{booking.customer_email}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              {booking.notes && (
                <div className="flex items-start">
                  <div className="mr-3 p-2 bg-primary/10 rounded-full">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Catatan</h4>
                    <p className="text-sm mt-1">{booking.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment" className="mt-4">
          <PaymentDetails 
            bookingId={booking.id}
            totalPrice={booking.total_price}
            paymentStatus={booking.payment_status}
            isAdmin={isAdmin}
            onPaymentUpdate={onStatusUpdate}
          />
        </TabsContent>
        
        <TabsContent value="pickup-return" className="mt-4">
          <PickupReturnCard 
            bookingId={booking.id}
            startDate={booking.start_date}
            endDate={booking.end_date}
            status={booking.status}
            isPickupCompleted={booking.is_pickup_completed}
            isReturnCompleted={booking.is_return_completed}
            pickupLocation={booking.pickup_location}
            pickupTime={booking.pickup_time}
            returnLocation={booking.return_location}
            returnTime={booking.return_time}
            isAdmin={isAdmin}
            onStatusUpdate={onStatusUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingDetails;
