
import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById, addCar, updateCar, uploadCarImage } from '@/lib/api';
import { Car } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Upload } from 'lucide-react';

const CarForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    if (isEditMode) {
      fetchCar();
    }
  }, [id]);

  const fetchCar = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const car = await getCarById(id);
      setFormData(car);
      if (car.imageUrl) {
        setImagePreview(car.imageUrl);
      }
    } catch (error) {
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
        imageUrl = await uploadCarImage(imageFile);
      }
      
      const carData = {
        ...formData,
        imageUrl
      };
      
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
    } catch (error) {
      toast({
        title: "Error",
        description: isEditMode ? "Gagal memperbarui mobil" : "Gagal menambahkan mobil",
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
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/admin/cars')}
          className="mb-6 flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>

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
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/cars')}
              className="px-4 py-2 border rounded-md hover:bg-accent transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : (isEditMode ? 'Perbarui Mobil' : 'Tambah Mobil')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarForm;
