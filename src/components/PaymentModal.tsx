
import React, { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { toast } from "./ui/use-toast";
import { createPayment } from '@/lib/bookingService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  totalPrice: number;
  onPaymentComplete: () => void;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  bookingId,
  totalPrice,
  onPaymentComplete 
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [amount, setAmount] = useState<number>(totalPrice);
  const [notes, setNotes] = useState<string>('');
  const [proofImageUrl, setProofImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Normally we would upload the file to Supabase storage here
      // For now, we'll just simulate the upload
      setTimeout(() => {
        setProofImageUrl(URL.createObjectURL(file));
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengunggah file',
        variant: 'destructive'
      });
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Jumlah pembayaran harus lebih dari 0',
        variant: 'destructive'
      });
      return;
    }

    if (amount > totalPrice) {
      toast({
        title: 'Error',
        description: 'Jumlah pembayaran tidak boleh melebihi total harga',
        variant: 'destructive'
      });
      return;
    }

    if (paymentMethod === 'bank_transfer' && !proofImageUrl) {
      toast({
        title: 'Error',
        description: 'Silakan unggah bukti pembayaran',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createPayment(bookingId, {
        amount,
        payment_method: paymentMethod,
        payment_proof: proofImageUrl,
        notes
      });

      toast({
        title: 'Sukses',
        description: 'Pembayaran berhasil dicatat',
      });
      onPaymentComplete();
      onClose();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: 'Error',
        description: 'Gagal memproses pembayaran',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lakukan Pembayaran</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Jumlah
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                Rp
              </span>
              <Input
                id="amount"
                type="number"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Metode
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="col-span-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer">Transfer Bank</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Tunai</Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === 'bank_transfer' && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="proof" className="text-right pt-2">
                Bukti
              </Label>
              <div className="col-span-3">
                <div className="flex flex-col gap-2">
                  <Input
                    id="proof"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      'Unggah Bukti Pembayaran'
                    )}
                  </Button>
                  {proofImageUrl && (
                    <div className="mt-2 relative rounded-md overflow-hidden border border-border">
                      <img 
                        src={proofImageUrl} 
                        alt="Bukti Pembayaran" 
                        className="w-full h-auto max-h-[150px] object-contain bg-muted" 
                      />
                      <div className="absolute bottom-1 right-1 bg-green-100 text-green-800 p-1 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Catatan
            </Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan pembayaran (opsional)"
              className="col-span-3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Kirim Pembayaran'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
