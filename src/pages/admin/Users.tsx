
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

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

  // Function to ensure the users table exists
  const ensureUsersTableExists = async () => {
    try {
      // Check if table exists by attempting to get schema
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') { // Table does not exist error code
        console.log('Creating users table as it does not exist');
        setTableExists(false);
        
        // Create the users table
        const { error: createError } = await supabase.rpc('create_users_table');
        
        if (createError) {
          console.error('Error creating users table:', createError);
          
          // Try direct SQL as fallback
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
            toast({
              title: "Database Error",
              description: "Could not create users table. Please create it manually in Supabase.",
              variant: "destructive"
            });
            return false;
          } else {
            console.log('Users table created successfully via SQL');
            setTableExists(true);
            return true;
          }
        } else {
          console.log('Users table created successfully');
          setTableExists(true);
          return true;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking/creating users table:', error);
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
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!tableExists) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manajemen User</h1>
        <div className="bg-destructive/10 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-destructive">Database Error</h2>
          <p className="mt-2">
            Tabel user belum tersedia. Silakan buat tabel "users" di dashboard Supabase atau refresh halaman ini untuk mencoba membuat tabel secara otomatis.
          </p>
          <button 
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
            onClick={fetchUsers}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manajemen User</h1>

      <div className="bg-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
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
                  <tr key={user.id} className="border-b">
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
