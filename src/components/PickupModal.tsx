
import { useState } from 'react';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { toast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { recordPickup } from '@/lib/bookingService';

interface PickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onComplete: () => void;
}

const PickupModal: React.FC<PickupModalProps> = ({ 
  isOpen, 
  onClose, 
  bookingId,
  onComplete 
}) => {
  const [pickupLocation, setPickupLocation] = useState<string>('Kantor Rental');
  const [notes, setNotes] = useState<string>('');
  const [fuelLevel, setFuelLevel] = useState<number>(100);
  const [odometer, setOdometer] = useState<number>(0);
  const [exteriorCondition, setExteriorCondition] = useState<string>('Baik');
  const [interiorCondition, setInteriorCondition] = useState<string>('Baik');
  const [damageNotes, setDamageNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!pickupLocation) {
      toast({
        title: 'Error',
        description: 'Lokasi pengambilan harus diisi',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await recordPickup(bookingId, {
        pickup_location: pickupLocation,
        pickup_time: new Date().toISOString(),
        notes,
        fuel_level: fuelLevel,
        odometer,
        exterior_condition: exteriorCondition,
        interior_condition: interiorCondition,
        damage_notes: damageNotes,
        images: [] // Tidak implementasi upload gambar dalam contoh ini
      });

      toast({
        title: 'Sukses',
        description: 'Pengambilan mobil berhasil dicatat',
      });
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error recording pickup:', error);
      toast({
        title: 'Error',
        description: 'Gagal mencatat pengambilan mobil',
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
          <DialogTitle>Catat Pengambilan Mobil</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Lokasi
            </Label>
            <Input
              id="location"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="odometer" className="text-right">
              Odometer (km)
            </Label>
            <Input
              id="odometer"
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Bahan Bakar
            </Label>
            <div className="col-span-3 space-y-2">
              <Slider
                defaultValue={[fuelLevel]}
                max={100}
                step={5}
                onValueChange={(value) => setFuelLevel(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>{fuelLevel}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="exterior" className="text-right">
              Kondisi Luar
            </Label>
            <Input
              id="exterior"
              value={exteriorCondition}
              onChange={(e) => setExteriorCondition(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interior" className="text-right">
              Kondisi Dalam
            </Label>
            <Input
              id="interior"
              value={interiorCondition}
              onChange={(e) => setInteriorCondition(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="damages" className="text-right pt-2">
              Catatan Kerusakan
            </Label>
            <Textarea
              id="damages"
              placeholder="Catat kerusakan yang ada (jika ada)"
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Catatan Umum
            </Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
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
              'Catat Pengambilan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PickupModal;
