
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCars } from '../lib/api';
import { Car } from '../lib/supabase';
import { toast } from '@/components/ui/use-toast';

const Cars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTransmission, setFilterTransmission] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price-asc');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getCars();
        setCars(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal memuat data mobil",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const filteredCars = cars.filter(car => {
    const transmissionMatch = filterTransmission === 'all' || car.transmission === filterTransmission;
    const categoryMatch = filterCategory === 'all' || car.category === filterCategory;
    return transmissionMatch && categoryMatch;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return (a.pricePerDay || 0) - (b.pricePerDay || 0);
    if (sortBy === 'price-desc') return (b.pricePerDay || 0) - (a.pricePerDay || 0);
    return 0;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Koleksi Mobil Kami</h1>
      
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <select
          className="bg-background border rounded-md px-4 py-2"
          value={filterTransmission}
          onChange={(e) => setFilterTransmission(e.target.value)}
        >
          <option value="all">Semua Transmisi</option>
          <option value="Manual">Manual</option>
          <option value="Automatic">Automatic</option>
        </select>

        <select
          className="bg-background border rounded-md px-4 py-2"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">Semua Kategori</option>
          <option value="MPV">MPV</option>
          <option value="SUV">SUV</option>
          <option value="Sedan">Sedan</option>
        </select>

        <select
          className="bg-background border rounded-md px-4 py-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="price-asc">Harga Terendah</option>
          <option value="price-desc">Harga Tertinggi</option>
        </select>
      </div>

      {/* Car Grid */}
      {filteredCars.length === 0 ? (
        <div className="text-center py-8">
          <p>Tidak ada mobil yang tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <Link
              key={car.id}
              to={`/cars/${car.id}`}
              className="block group"
            >
              <div className="bg-card rounded-lg overflow-hidden shadow-lg transition-transform duration-200 hover:scale-105">
                <div className="aspect-video relative">
                  <img
                    src={car.imageUrl || '/placeholder.svg'}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                  <p className="text-lg font-bold mb-2">
                    Rp {(car.pricePerDay || 0).toLocaleString('id-ID')}/hari
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{car.transmission || '-'}</span>
                    <span>{car.capacity || '-'} Kursi</span>
                    <span>{car.category || '-'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cars;
