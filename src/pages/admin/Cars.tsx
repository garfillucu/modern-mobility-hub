
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCars, deleteCar } from '@/lib/api';
import { Car } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash } from 'lucide-react';

const AdminCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Anda yakin ingin menghapus mobil ini?')) return;
    
    try {
      await deleteCar(id);
      setCars(cars.filter(car => car.id !== id));
      toast({
        title: "Sukses",
        description: "Mobil berhasil dihapus",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus mobil",
        variant: "destructive"
      });
    }
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Mobil</h1>
        <Link 
          to="/admin/cars/add" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={16} />
          Tambah Mobil
        </Link>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Nama</th>
                <th className="text-left p-4">Brand</th>
                <th className="text-left p-4">Tahun</th>
                <th className="text-left p-4">Harga/Hari</th>
                <th className="text-right p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cars.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center">
                    Tidak ada data mobil
                  </td>
                </tr>
              ) : (
                cars.map((car) => (
                  <tr key={car.id} className="border-b">
                    <td className="p-4">{car.name}</td>
                    <td className="p-4">{car.brand}</td>
                    <td className="p-4">{car.year}</td>
                    <td className="p-4">
                      Rp {(car.pricePerDay || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/cars/edit/${car.id}`}
                          className="text-primary hover:underline flex items-center"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="text-destructive hover:underline flex items-center"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCars;
