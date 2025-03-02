
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCars } from '../lib/api';
import { Car } from '../lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Cars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTransmission, setFilterTransmission] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price-asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCars, setTotalCars] = useState(0);
  const carsPerPage = 9; // Menampilkan 9 mobil per halaman (grid 3x3)

  useEffect(() => {
    fetchCars();
  }, [currentPage, filterTransmission, filterCategory, sortBy]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const filters = {
        transmission: filterTransmission,
        category: filterCategory,
        sortBy
      };
      
      const result = await getCars(currentPage, carsPerPage, filters);
      setCars(result.data);
      setTotalPages(result.totalPages);
      setTotalCars(result.count);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate pagination numbers
  const renderPaginationNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Logic for showing limited page numbers with ellipsis
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Add first page
    if (startPage > 1) {
      pages.push(
        <Button 
          key={1} 
          variant={currentPage === 1 ? "default" : "outline"} 
          size="sm"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2">...</span>
        );
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button 
          key={i} 
          variant={currentPage === i ? "default" : "outline"} 
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    
    // Add last page
    if (endPage < totalPages) {
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2">...</span>
        );
      }
      
      pages.push(
        <Button 
          key={totalPages} 
          variant={currentPage === totalPages ? "default" : "outline"} 
          size="sm"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }
    
    return pages;
  };

  if (loading && currentPage === 1) {
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
          onChange={(e) => {
            setFilterTransmission(e.target.value);
            setCurrentPage(1); // Reset to first page when filter changes
          }}
        >
          <option value="all">Semua Transmisi</option>
          <option value="Manual">Manual</option>
          <option value="Automatic">Automatic</option>
        </select>

        <select
          className="bg-background border rounded-md px-4 py-2"
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1); // Reset to first page when filter changes
          }}
        >
          <option value="all">Semua Kategori</option>
          <option value="MPV">MPV</option>
          <option value="SUV">SUV</option>
          <option value="Sedan">Sedan</option>
          <option value="Hatchback">Hatchback</option>
        </select>

        <select
          className="bg-background border rounded-md px-4 py-2"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1); // Reset to first page when sort changes
          }}
        >
          <option value="price-asc">Harga Terendah</option>
          <option value="price-desc">Harga Tertinggi</option>
        </select>
      </div>

      {/* Car Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-8">
          <p>Tidak ada mobil yang tersedia</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center space-y-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {cars.length} dari {totalCars} mobil
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {renderPaginationNumbers()}
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cars;
