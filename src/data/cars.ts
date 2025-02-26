
export interface Car {
  id: string;
  name: string;
  price: number;
  image: string;
  transmission: 'Manual' | 'Automatic';
  capacity: number;
  description: string;
  category: string;
  features: string[];
}

export const cars: Car[] = [
  {
    id: '1',
    name: 'Toyota Avanza',
    price: 300000,
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2156&auto=format&fit=crop',
    transmission: 'Manual',
    capacity: 7,
    category: 'MPV',
    description: 'MPV nyaman untuk keluarga dengan konsumsi BBM yang efisien. Cocok untuk perjalanan keluarga.',
    features: ['AC', 'Audio System', 'Power Window', 'Central Lock', 'Airbag']
  },
  {
    id: '2',
    name: 'Honda Civic',
    price: 500000,
    image: 'https://images.unsplash.com/photo-1604054094723-3a949e4fca0b?q=80&w=2067&auto=format&fit=crop',
    transmission: 'Automatic',
    capacity: 5,
    category: 'Sedan',
    description: 'Sedan sporty dengan performa tinggi dan interior mewah. Ideal untuk perjalanan bisnis.',
    features: ['Leather Seats', 'Sunroof', 'Keyless Entry', 'Push Start', 'Cruise Control']
  },
  {
    id: '3',
    name: 'Toyota Fortuner',
    price: 800000,
    image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?q=80&w=2067&auto=format&fit=crop',
    transmission: 'Automatic',
    capacity: 7,
    category: 'SUV',
    description: 'SUV tangguh dengan ground clearance tinggi. Cocok untuk segala medan.',
    features: ['4x4', 'Hill Start Assist', 'Parking Camera', 'Premium Audio', 'Multi-terrain Select']
  }
];
