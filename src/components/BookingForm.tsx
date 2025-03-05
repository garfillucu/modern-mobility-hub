
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createBooking } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Car } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { id } from 'date-fns/locale';

interface BookingFormProps {
  car: Car;
}

const BookingForm = ({ car }: BookingFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [customerName, setCustomerName] = useState(user?.email?.split('@')[0] || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hitung jumlah hari
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Hitung total harga
  const calculateTotalPrice = () => {
    const days = calculateDays();
    return days * (car.pricePerDay || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login terlebih dahulu untuk melakukan pemesanan",
        variant: "destructive"
      });
      navigate('/login', { state: { from: `/cars/${car.id}` } });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Tanggal Diperlukan",
        description: "Silakan pilih tanggal mulai dan tanggal selesai",
        variant: "destructive"
      });
      return;
    }

    if (calculateDays() <= 0) {
      toast({
        title: "Tanggal Tidak Valid",
        description: "Tanggal selesai harus setelah tanggal mulai",
        variant: "destructive"
      });
      return;
    }

    if (!customerName || !customerPhone || !customerEmail) {
      toast({
        title: "Data Pelanggan",
        description: "Silakan lengkapi data diri Anda",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const bookingData = {
        car_id: car.id,
        user_id: user.id,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        total_price: calculateTotalPrice(),
        status: 'pending' as const,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        notes: notes
      };

      const booking = await createBooking(bookingData);

      toast({
        title: "Booking Berhasil",
        description: "Permintaan booking Anda telah berhasil dibuat",
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Gagal",
        description: "Terjadi kesalahan saat membuat booking. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Booking Mobil</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Tanggal Mulai */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tanggal Selesai */}
          <div className="space-y-2">
            <Label htmlFor="endDate">Tanggal Selesai</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => 
                    date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                    (startDate ? date < startDate : false)
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Informasi Pelanggan */}
        <div className="border-t border-b py-4 my-4 space-y-4">
          <h3 className="text-md font-medium">Informasi Pelanggan</h3>
          
          <div className="space-y-2">
            <Label htmlFor="customerName">Nama Lengkap</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Nomor Telepon</Label>
            <Input
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0812xxxxxxxx"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan khusus untuk pemesanan ini"
              rows={3}
            />
          </div>
        </div>

        {/* Ringkasan Pemesanan */}
        <div className="bg-muted p-4 rounded-md space-y-2">
          <h3 className="text-md font-medium">Ringkasan Pemesanan</h3>
          <div className="flex justify-between">
            <span>Durasi Sewa:</span>
            <span>{calculateDays()} hari</span>
          </div>
          <div className="flex justify-between">
            <span>Harga per Hari:</span>
            <span>Rp {(car.pricePerDay || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2 mt-2">
            <span>Total Pembayaran:</span>
            <span>Rp {calculateTotalPrice().toLocaleString('id-ID')}</span>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses..." : "Konfirmasi Booking"}
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
