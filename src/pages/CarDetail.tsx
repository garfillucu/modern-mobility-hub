
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById } from '../lib/api';
import { Car } from '../lib/supabase';
import { toast } from '@/components/ui/use-toast';
import BookingForm from '@/components/BookingForm';

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      
      try {
        const data = await getCarById(id);
        setCar(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal memuat data mobil",
          variant: "destructive"
        });
        navigate('/cars');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-lg">Mobil tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Car Image and Details - 2 columns */}
        <div className="md:col-span-2 space-y-8">
          {/* Car Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={car.imageUrl || '/placeholder.svg'}
              alt={car.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Car Details */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{car.name}</h1>
            <p className="text-2xl font-bold mb-6">
              Rp {(car.pricePerDay || 0).toLocaleString('id-ID')}/hari
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Brand:</span>
                <span>{car.brand}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">Tahun:</span>
                <span>{car.year}</span>
              </div>
              {car.transmission && (
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Transmisi:</span>
                  <span>{car.transmission}</span>
                </div>
              )}
              {car.capacity && (
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Kapasitas:</span>
                  <span>{car.capacity} Kursi</span>
                </div>
              )}
              {car.category && (
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Kategori:</span>
                  <span>{car.category}</span>
                </div>
              )}
            </div>

            {car.description && (
              <p className="text-muted-foreground mb-8">{car.description}</p>
            )}

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Fitur</h2>
                <ul className="grid grid-cols-2 gap-2">
                  {car.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Booking Form - 1 column */}
        <div className="md:col-span-1">
          <BookingForm car={car} />
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
