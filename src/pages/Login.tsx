
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userData = await login(email, password);
      
      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali!",
      });
      
      // Handle redirect based on role
      if (userData?.role === 'admin') {
        navigate('/admin/users');
      } else {
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Pesan khusus untuk email yang belum dikonfirmasi
      if (error.code === 'email_not_confirmed') {
        toast({
          title: "Email Belum Dikonfirmasi",
          description: "Mohon cek inbox email Anda dan klik link konfirmasi yang telah dikirim. Jika tidak menerima email, silakan mendaftar ulang.",
          variant: "destructive"
        });
      } else if (error.code === 'invalid_credentials') {
        toast({
          title: "Error",
          description: "Email atau password salah",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Terjadi kesalahan saat login",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <p className="mb-4 text-muted-foreground">
          Silahkan daftar terlebih dahulu jika belum memiliki akun.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md border bg-background"
              required
              placeholder="nama@gmail.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border bg-background"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Belum punya akun?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Daftar disini
          </Link>
        </p>
        
        <div className="mt-8 p-4 bg-muted rounded-md">
          <h3 className="font-medium text-sm mb-2">Catatan Penting:</h3>
          <p className="text-xs text-muted-foreground">
            Setelah mendaftar, Anda harus mengkonfirmasi email Anda dengan mengklik link yang dikirim ke alamat email Anda.
            Jika menggunakan Supabase di lingkungan pengembangan, email konfirmasi mungkin tidak terkirim dan Anda perlu mengaktifkan akun secara manual di Dashboard Supabase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
