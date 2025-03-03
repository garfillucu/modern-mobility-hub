
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Car, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">Selamat datang di panel admin RentCar.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Manajemen User</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kelola data pengguna, peran, dan akses sistem.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/admin/users" className="text-primary text-sm hover:underline">
              Buka Manajemen User →
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Manajemen Mobil</CardTitle>
            <Car className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kelola data mobil, harga, dan ketersediaan.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/admin/cars" className="text-primary text-sm hover:underline">
              Buka Manajemen Mobil →
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Pengaturan Sistem</CardTitle>
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Konfigurasi sistem dan pengaturan aplikasi.
            </p>
          </CardContent>
          <CardFooter>
            <span className="text-muted-foreground text-sm">Segera Hadir</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
