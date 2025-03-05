import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCarById, addCar, updateCar, uploadCarImage } from '@/lib/api';
import { Car } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CarForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id && id !== ':id';
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<Car>>({
    name: '',
    brand: '',
    year: new Date().getFullYear(),
    pricePerDay: 0,
    transmission: 'Manual',
    capacity: 4,
    category: 'MPV',
    description: '',
    features: [],
  });

  useEffect(() => {
    console.log('CarForm mounted, edit mode:', isEditMode, 'id:', id);
    if (isEditMode) {
      fetchCar();
    }
  }, [id, isEditMode]);

  const fetchCar = async () => {
    if (!id || id === ':id') return;
    
    try {
      setLoading(true);
      console.log('Fetching car with ID:', id);
      const car = await getCarById(id);
      console.log('Car data fetched:', car);
      setFormData(car);
      if (car.imageUrl) {
        setImagePreview(car.imageUrl);
      }
    } catch (error) {
      console.error('Error fetching car:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data mobil",
        variant: "destructive"
      });
      navigate('/admin/cars');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'year' || name === 'pricePerDay' || name === 'capacity') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFeaturesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const featuresText = e.target.value;
    const featuresArray = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f);
    
    setFormData({
      ...formData,
      features: featuresArray
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Upload image if selected
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        try {
          setUploadingImage(true);
          console.log('Attempting to upload image...');
          imageUrl = await uploadCarImage(imageFile);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Peringatan",
            description: "Gambar menggunakan default karena kendala izin. Data mobil tetap akan disimpan.",
            variant: "destructive"
          });
          // Lanjutkan proses meskipun upload gambar gagal
        } finally {
          setUploadingImage(false);
        }
      }
      
      const carData = {
        ...formData,
        imageUrl
      };
      
      try {
        if (isEditMode && id) {
          await updateCar(id, carData);
          toast({
            title: "Sukses",
            description: "Mobil berhasil diperbarui",
          });
        } else {
          await addCar(carData as Omit<Car, 'id'>);
          toast({
            title: "Sukses",
            description: "Mobil berhasil ditambahkan",
          });
        }
        
        navigate('/admin/cars');
      } catch (saveError: any) {
        console.error('Error saving car data:', saveError);
        
        // Pesan error yang lebih spesifik berdasarkan tipe error
        let errorMessage = "Gagal menambahkan/memperbarui mobil";
        
        // Periksa apakah error terkait skema tabel
        if (saveError.message && saveError.message.includes("column") && saveError.message.includes("not found")) {
          errorMessage = "Kolom tidak ditemukan di database. Pastikan skema tabel Anda sesuai.";
        } else if (saveError.message) {
          errorMessage = saveError.message;
        }
        
        toast({
          title: "Error",
          description: isEditMode ? `Gagal memperbarui mobil: ${errorMessage}` : `Gagal menambahkan mobil: ${errorMessage}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting car form:', error);
      
      // Tampilkan pesan error yang lebih spesifik berdasarkan tipe error
      let errorMessage = "Gagal menambahkan mobil";
      if (typeof error === 'object' && error !== null) {
        // @ts-ignore
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: isEditMode ? `Gagal memperbarui mobil: ${errorMessage}` : `Gagal menambahkan mobil: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/cars')}
          className="mb-6 flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Kembali
        </Button>

        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? 'Edit Mobil' : 'Tambah Mobil Baru'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nama Mobil *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border bg-background"
                required
              />
            </div>
            
            <div>
              <label htmlFor="brand" className="block text-sm font-medium mb-2">
                Brand *
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border bg-background"
                required
              />
            </div>
            
            <div>
              <label htmlFor="year" className="block text-sm font-medium mb-2">
                Tahun *
              </label>
              <input
                id="year"
                name="year"
                type="number"
                value={formData.year || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border bg-background"
                required
              />
            </div>
            
            <div>
              <label htmlFor="pricePerDay" className="block text-sm font-medium mb-2">
                Harga Per Hari (Rp) *
              </label>
              <input
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                value={formData.pricePerDay || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border bg-background"
                required
              />
            </div>
            
            <div>
              <label htmlFor="transmission" className="block text-sm font-medium mb-2">
                Transmisi
              </label>
              <select
                id="transmission"
                name="transmission"
                value={formData.transmission || 'Manual'}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border bg-background"
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium mb-2">
                Kapasitas (Kursi)
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border bg-background"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Kategori
              </label>
              <select
                id="category"
                name="category"
                value={formData.category || 'MPV'}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border bg-background"
              >
                <option value="MPV">MPV</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-md border bg-background"
            />
          </div>
          
          <div>
            <label htmlFor="features" className="block text-sm font-medium mb-2">
              Fitur (satu per baris)
            </label>
            <textarea
              id="features"
              name="features"
              value={formData.features?.join('\n') || ''}
              onChange={handleFeaturesChange}
              rows={4}
              className="w-full px-4 py-2 rounded-md border bg-background"
              placeholder="AC&#10;Audio System&#10;Power Window&#10;Central Lock"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Gambar Mobil
            </label>
            
            {imagePreview && (
              <div className="aspect-video relative mb-4 rounded-md overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <label
              htmlFor="image"
              className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-md p-6 text-center"
            >
              <Upload size={20} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                Klik untuk upload gambar
              </span>
              <input
                id="image"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </label>
            {uploadingImage && (
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengupload gambar...
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/cars')}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                isEditMode ? 'Perbarui Mobil' : 'Tambah Mobil'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarForm;
