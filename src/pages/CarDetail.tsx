
import { useParams } from 'react-router-dom';
import { cars } from '../data/cars';

const CarDetail = () => {
  const { id } = useParams();
  const car = cars.find(c => c.id === id);

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-lg">Mobil tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Car Image */}
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Car Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{car.name}</h1>
          <p className="text-2xl font-bold mb-6">
            Rp {car.price.toLocaleString('id-ID')}/hari
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Transmisi:</span>
              <span>{car.transmission}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">Kapasitas:</span>
              <span>{car.capacity} Kursi</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">Kategori:</span>
              <span>{car.category}</span>
            </div>
          </div>

          <p className="text-muted-foreground mb-8">{car.description}</p>

          {/* Features */}
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
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
