
import { useState } from 'react';
import { cars } from '../data/cars';
import { Link } from 'react-router-dom';

const Cars = () => {
  const [filterTransmission, setFilterTransmission] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price-asc');

  const filteredCars = cars.filter(car => {
    const transmissionMatch = filterTransmission === 'all' || car.transmission === filterTransmission;
    const categoryMatch = filterCategory === 'all' || car.category === filterCategory;
    return transmissionMatch && categoryMatch;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

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
                  src={car.image}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                <p className="text-lg font-bold mb-2">
                  Rp {car.price.toLocaleString('id-ID')}/hari
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{car.transmission}</span>
                  <span>{car.capacity} Kursi</span>
                  <span>{car.category}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Cars;
