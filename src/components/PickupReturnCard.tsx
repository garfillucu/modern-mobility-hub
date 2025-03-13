
import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Calendar, CheckCircle, AlertCircle, Car, ArrowRight } from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Separator } from "./ui/separator";
import { getInspections, recordPickup, recordReturn } from "@/lib/bookingService";
import { toast } from "./ui/use-toast";
import PickupModal from './PickupModal';
import ReturnModal from './ReturnModal';

interface PickupReturnCardProps {
  bookingId: string;
  startDate: string;
  endDate: string;
  status: string;
  isPickupCompleted: boolean;
  isReturnCompleted: boolean;
  pickupLocation?: string;
  pickupTime?: string;
  returnLocation?: string;
  returnTime?: string;
  isAdmin?: boolean;
  onStatusUpdate?: () => void;
}

const PickupReturnCard: React.FC<PickupReturnCardProps> = ({
  bookingId,
  startDate,
  endDate,
  status,
  isPickupCompleted,
  isReturnCompleted,
  pickupLocation,
  pickupTime,
  returnLocation,
  returnTime,
  isAdmin = false,
  onStatusUpdate
}) => {
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const canShowPickupButton = isAdmin && 
    (status === 'confirmed' || status === 'payment_completed') && 
    !isPickupCompleted;
    
  const canShowReturnButton = isAdmin && 
    status === 'in_use' && 
    isPickupCompleted && 
    !isReturnCompleted;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span>Pengambilan & Pengembalian</span>
        </CardTitle>
        <CardDescription>
          Detail pengambilan dan pengembalian mobil
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Pengambilan */}
          <div className="relative">
            <div className="flex items-start">
              <div className="mr-3 p-2 bg-primary/10 rounded-full">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium flex items-center">
                  Pengambilan Mobil
                  {isPickupCompleted ? (
                    <Badge className="ml-2 bg-green-100 text-green-800">Selesai</Badge>
                  ) : (
                    <Badge className="ml-2 bg-yellow-100 text-yellow-800">Menunggu</Badge>
                  )}
                </h4>
                
                <div className="text-sm mt-1">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {format(new Date(startDate), 'dd MMMM yyyy', { locale: id })}
                    </span>
                  </div>
                  
                  {isPickupCompleted && pickupTime && (
                    <div className="flex items-center mt-1">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                      <span>
                        Diambil pada: {format(new Date(pickupTime), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </span>
                    </div>
                  )}
                  
                  {isPickupCompleted && pickupLocation && (
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{pickupLocation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {isPickupCompleted && !isReturnCompleted && (
              <div className="absolute left-5 top-14 h-14 w-0.5 bg-primary/30"></div>
            )}
          </div>
          
          {/* Pengembalian */}
          {(isPickupCompleted || status === 'completed' || status === 'in_use') && (
            <div className="flex items-start">
              <div className="mr-3 p-2 bg-primary/10 rounded-full">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium flex items-center">
                  Pengembalian Mobil
                  {isReturnCompleted ? (
                    <Badge className="ml-2 bg-green-100 text-green-800">Selesai</Badge>
                  ) : (
                    <Badge className="ml-2 bg-yellow-100 text-yellow-800">Menunggu</Badge>
                  )}
                </h4>
                
                <div className="text-sm mt-1">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {format(new Date(endDate), 'dd MMMM yyyy', { locale: id })}
                    </span>
                  </div>
                  
                  {isReturnCompleted && returnTime && (
                    <div className="flex items-center mt-1">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                      <span>
                        Dikembalikan pada: {format(new Date(returnTime), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </span>
                    </div>
                  )}
                  
                  {isReturnCompleted && returnLocation && (
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{returnLocation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        {canShowPickupButton && (
          <Button 
            onClick={() => setIsPickupModalOpen(true)}
            disabled={loading}
          >
            Catat Pengambilan
          </Button>
        )}
        
        {canShowReturnButton && (
          <Button 
            onClick={() => setIsReturnModalOpen(true)}
            disabled={loading}
          >
            Catat Pengembalian
          </Button>
        )}
      </CardFooter>
      
      {/* Pickup Modal untuk admin */}
      <PickupModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        bookingId={bookingId}
        onComplete={() => {
          if (onStatusUpdate) onStatusUpdate();
        }}
      />
      
      {/* Return Modal untuk admin */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        bookingId={bookingId}
        onComplete={() => {
          if (onStatusUpdate) onStatusUpdate();
        }}
      />
    </Card>
  );
};

export default PickupReturnCard;
