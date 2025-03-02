import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);
  const [creatingTable, setCreatingTable] = useState(false);

  // Function to ensure the users table exists
  const ensureUsersTableExists = async () => {
    try {
      setCreatingTable(true);
      console.log('Checking if users table exists...');
      
      // Check if table exists by attempting to get schema
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') { // Table does not exist error code
        console.log('Creating users table as it does not exist');
        setTableExists(false);
        
        // Try direct SQL as primary method (more reliable)
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              role TEXT NOT NULL DEFAULT 'user',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
          `
        });
        
        if (sqlError) {
          console.error('Failed to create users table via SQL:', sqlError);
          
          // Try fallback RPC method
          const { error: createError } = await supabase.rpc('create_users_table');
          
          if (createError) {
            console.error('Error creating users table via RPC:', createError);
            toast({
              title: "Database Error",
              description: "Could not create users table. Please create it manually in Supabase.",
              variant: "destructive"
            });
            setCreatingTable(false);
            return false;
          } else {
            console.log('Users table created successfully via RPC');
            setTableExists(true);
            setCreatingTable(false);
            return true;
          }
        } else {
          console.log('Users table created successfully via SQL');
          setTableExists(true);
          setCreatingTable(false);
          return true;
        }
      }
      setCreatingTable(false);
      return true;
    } catch (error) {
      console.error('Error checking/creating users table:', error);
      setCreatingTable(false);
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First ensure the table exists
      const tableReady = await ensureUsersTableExists();
      if (!tableReady) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUsers(data as User[]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data user: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUserTableManually = async () => {
    try {
      await ensureUsersTableExists();
      toast({
        title: "Sukses",
        description: "Tabel users berhasil dibuat",
      });
      await fetchUsers();
    } catch (error: any) {
      console.error('Error creating table:', error);
      toast({
        title: "Error",
        description: "Gagal membuat tabel users: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "Sukses",
        description: "Role user berhasil diubah",
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah role user: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Anda yakin ingin menghapus user ini?')) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "Sukses",
        description: "User berhasil dihapus",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus user: " + error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manajemen User</h1>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Memuat data user...</span>
        </div>
      </div>
    );
  }

  if (!tableExists) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manajemen User</h1>
        <div className="bg-destructive/10 p-6 rounded-md">
          <h2 className="text-lg font-semibold text-destructive">Database Error</h2>
          <p className="mt-2">
            Tabel user belum tersedia. Silakan buat tabel "users" di dashboard Supabase atau klik tombol di bawah untuk mencoba membuat tabel secara otomatis.
          </p>
          <div className="mt-4 space-x-2">
            <Button 
              onClick={createUserTableManually}
              disabled={creatingTable}
              className="bg-primary text-primary-foreground"
            >
              {creatingTable ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat Tabel...
                </>
              ) : (
                'Buat Tabel Users'
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={fetchUsers}
              disabled={creatingTable}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen User</h1>
        <Button 
          onClick={fetchUsers}
          variant="outline"
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Tanggal Dibuat</th>
                <th className="text-left p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center">Tidak ada data user</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                        className="bg-background border rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive hover:underline"
                      >
                        Hapus
                      </button>
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

export default Users;
