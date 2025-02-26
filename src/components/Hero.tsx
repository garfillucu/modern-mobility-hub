
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1567818735868-e71b99932e29?q=80&w=2074&auto=format&fit=crop)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-white text-center px-4 animate-slide-up">
        <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold rounded-full glass">
          Solusi Transportasi Modern
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Rental Mobil Premium
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Nikmati perjalanan Anda dengan armada mobil berkualitas dan pelayanan terbaik dari kami
        </p>
        <Link
          to="/cars"
          className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg glass hover:bg-white/20 transition-all duration-200"
        >
          Lihat Koleksi Mobil
        </Link>
      </div>
    </div>
  );
};

export default Hero;
