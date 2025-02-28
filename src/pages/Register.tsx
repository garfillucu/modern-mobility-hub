
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Email tidak valid",
        variant: "destructive"
      });
      return;
    }
    
    // Cek apakah menggunakan domain example.com (domain ini sering ditolak)
    if (email.toLowerCase().endsWith('@example.com')) {
      toast({
        title: "Error",
        description: "Domain example.com tidak diperbolehkan. Gunakan alamat email yang valid.",
        variant: "destructive"
      });
      return;
    }
    
    // Validasi password
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password harus minimal 6 karakter",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password tidak cocok",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await register(email, password);
      toast({
        title: "Registrasi Berhasil",
        description: "Silahkan login dengan akun Anda",
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Tangani pesan error dengan lebih baik
      let errorMessage = "Gagal melakukan registrasi";
      
      if (error.message) {
        if (error.message.includes("invalid")) {
          errorMessage = "Email tidak valid atau sudah terdaftar. Gunakan alamat email lain.";
        } else if (error.message.includes("already registered")) {
          errorMessage = "Email sudah terdaftar. Silakan login atau gunakan email lain.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Daftar Akun Baru</h1>
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
            <p className="text-xs text-muted-foreground mt-1">
              Gunakan email valid (gmail.com, yahoo.com, dll). Domain example.com tidak diperbolehkan.
            </p>
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
              minLength={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimal 6 karakter
            </p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border bg-background"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Daftar'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login disini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
