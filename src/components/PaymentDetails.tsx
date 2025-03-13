
import { useState, useEffect } from 'react';
import { getPaymentsByBookingId } from '@/lib/bookingService';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { toast } from "./ui/use-toast";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Banknote, CreditCard, Calendar, ReceiptText } from "lucide-react";
import PaymentModal from './PaymentModal';

interface PaymentDetailsProps {
  bookingId: string;
  totalPrice: number;
  paymentStatus: string;
  isAdmin?: boolean;
  onPaymentUpdate?: () => void;
}

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  payment_status: string;
  invoice_number: string;
  payment_proof?: string;
  notes?: string;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ 
  bookingId, 
  totalPrice,
  paymentStatus,
  isAdmin = false,
  onPaymentUpdate
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Menghitung total yang sudah dibayar
  const totalPaid = payments.reduce((sum, payment) => {
    if (payment.payment_status === 'completed') {
      return sum + payment.amount;
    }
    return sum;
  }, 0);
  
  // Sisa yang harus dibayar
  const remainingAmount = totalPrice - totalPaid;
  
  // Persentase pembayaran
  const paymentPercentage = Math.min(Math.round((totalPaid / totalPrice) * 100), 100);
  
  useEffect(() => {
    loadPayments();
  }, [bookingId]);
  
  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await getPaymentsByBookingId(bookingId);
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pembayaran",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Selesai</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Menunggu Verifikasi</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getOverallStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Lunas</Badge>;
      case 'partially_paid':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Sebagian</Badge>;
      case 'pending_verification':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Menunggu Verifikasi</Badge>;
      case 'unpaid':
      default:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Belum Dibayar</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Detail Pembayaran</span>
          {getOverallStatusBadge(paymentStatus)}
        </CardTitle>
        <CardDescription>
          Riwayat dan status pembayaran
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Total Dibayar: Rp {totalPaid.toLocaleString('id-ID')}</span>
            <span>{paymentPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${paymentPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Sisa: Rp {remainingAmount.toLocaleString('id-ID')}</span>
            <span>Total: Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Riwayat Pembayaran */}
        <h4 className="font-medium mb-3">Riwayat Pembayaran</h4>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-4 bg-muted/50 rounded-md">
            <p className="text-muted-foreground">Belum ada riwayat pembayaran</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-start p-3 rounded-md border">
                <div className="mr-3 p-2 bg-primary/10 rounded-full">
                  {payment.payment_method === 'bank_transfer' ? 
                    <Banknote className="h-5 w-5 text-primary" /> : 
                    <CreditCard className="h-5 w-5 text-primary" />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Rp {payment.amount.toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.payment_method === 'bank_transfer' ? 'Transfer Bank' : 'Tunai'}
                      </p>
                    </div>
                    {getPaymentStatusBadge(payment.payment_status)}
                  </div>
                  
                  {payment.notes && (
                    <p className="text-sm mt-1">{payment.notes}</p>
                  )}
                  
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(payment.payment_date), 'dd MMM yyyy, HH:mm', { locale: id })}
                    
                    {payment.invoice_number && (
                      <>
                        <span className="mx-1">•</span>
                        <ReceiptText className="h-3 w-3 mr-1" />
                        {payment.invoice_number}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!isAdmin && remainingAmount > 0 && (
          <Button onClick={() => setIsPaymentModalOpen(true)} className="ml-auto">
            Lakukan Pembayaran
          </Button>
        )}
      </CardFooter>
      
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingId={bookingId}
        totalPrice={remainingAmount}
        onPaymentComplete={() => {
          loadPayments();
          if (onPaymentUpdate) onPaymentUpdate();
        }}
      />
    </Card>
  );
};

export default PaymentDetails;
