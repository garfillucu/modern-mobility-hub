
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { initDatabase } from "./lib/initDatabase";
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import CarDetail from "./pages/CarDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminCars from "./pages/admin/Cars";
import CarForm from "./pages/admin/CarForm";

const queryClient = new QueryClient();

const App = () => {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Initializing application...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <main className="pt-16">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/cars" element={<Cars />} />
                    <Route path="/cars/:id" element={<CarDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    
                    {/* Admin Routes - Make sure /admin points to AdminDashboard */}
                    <Route element={<AdminLayout />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/cars" element={<AdminCars />} />
                      <Route path="/admin/cars/add" element={<CarForm />} />
                      <Route path="/admin/cars/edit/:id" element={<CarForm />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
