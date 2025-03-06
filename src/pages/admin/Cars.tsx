
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCars, deleteCar, createCarsTable } from '@/lib/api';
import { getCreateCarsSql } from '@/lib/sqlQueries';
import { Car } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCars, setTotalCars] = useState(0);
  const [creatingTable, setCreatingTable] = useState(false);
  const carsPerPage = 10; // Show 10 cars per page in admin panel

  const fetchCars = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching cars, page:', page);
      const result = await getCars(page, carsPerPage);
      console.log('Cars fetched:', result);
      setCars(result.data);
      setTotalPages(result.totalPages);
      setTotalCars(result.count);
      setCurrentPage(page);
    } catch (error: any) {
      console.error("Error fetching cars:", error);
      
      // Periksa apakah error adalah "relation does not exist"
      if (error.message && error.message.includes("relation") && error.message.includes("does not exist")) {
        setError("Tabel 'cars' belum dibuat. Silakan buat di Supabase Dashboard atau klik tombol di bawah untuk mencoba membuatnya.");
      } else {
        setError("Gagal memuat data mobil. " + (error.message || ""));
        toast({
          title: "Error",
          description: "Gagal memuat data mobil",
          variant: "destructive"
        });
      }
      
      setCars([]);
      setTotalPages(0);
      setTotalCars(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminCars component mounted');
    fetchCars(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm('Anda yakin ingin menghapus mobil ini?')) return;
    
    try {
      await deleteCar(id);
      // Refresh the current page
      fetchCars(currentPage);
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

  const handleCreateTable = async () => {
    try {
      setCreatingTable(true);
      const success = await createCarsTable();
      
      if (success) {
        toast({
          title: "Sukses",
          description: "Tabel mobil berhasil dibuat",
        });
        fetchCars(1);
      } else {
        toast({
          title: "Error",
          description: "Gagal membuat tabel mobil",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating table:", error);
      toast({
        title: "Error",
        description: "Gagal membuat tabel mobil",
        variant: "destructive"
      });
    } finally {
      setCreatingTable(false);
    }
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Menampilkan {cars.length} dari {totalCars} mobil
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">
            Halaman {currentPage} dari {totalPages}
          </span>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderErrorMessage = () => {
    if (!error) return null;
    
    const sqlCode = getCreateCarsSql();
    
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Database Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error}</p>
          
          <div className="flex flex-col gap-4">
            <Button 
              variant="outline" 
              onClick={handleCreateTable}
              disabled={creatingTable}
              className="flex items-center gap-2"
            >
              {creatingTable ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Mencoba Membuat Tabel...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Buat Tabel Cars
                </>
              )}
            </Button>
            
            <div className="mt-2">
              <p className="text-sm mb-2">Atau buat secara manual di Supabase Dashboard:</p>
              <pre className="text-xs bg-gray-800 p-4 rounded-md overflow-x-auto text-white">
                {sqlCode}
              </pre>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  if (loading && currentPage === 1 && !error) {
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
        <Button 
          onClick={() => navigate('/admin/cars/add')} 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={16} />
          Tambah Mobil
        </Button>
      </div>

      {renderErrorMessage()}

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
                    {error ? "Tabel mobil belum tersedia" : "Tidak ada data mobil"}
                  </td>
                </tr>
              ) : (
                cars.map((car) => (
                  <tr key={car.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-4">{car.name}</td>
                    <td className="p-4">{car.brand}</td>
                    <td className="p-4">{car.year}</td>
                    <td className="p-4">
                      Rp {(car.pricePerDay || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/cars/edit/${car.id}`)}
                          className="text-primary hover:underline flex items-center"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(car.id)}
                          className="text-destructive hover:underline flex items-center"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t">
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCars;
