
const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Tentang Kami</h1>
      
      <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Sejarah Perusahaan</h2>
          <p className="text-muted-foreground mb-4">
            ModernRent didirikan pada tahun 2020 dengan visi untuk memberikan solusi transportasi modern yang aman, nyaman, dan terjangkau bagi masyarakat Indonesia. Sejak awal berdiri, kami telah melayani ribuan pelanggan dan terus berkembang hingga saat ini.
          </p>
          <p className="text-muted-foreground">
            Dengan armada yang selalu diperbarui dan layanan pelanggan 24/7, kami berkomitmen untuk memberikan pengalaman rental mobil terbaik bagi setiap pelanggan.
          </p>
        </div>
        <div className="aspect-video rounded-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1573152958734-1922c188fba3?q=80&w=2832&auto=format&fit=crop"
            alt="Our Office"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-8">Visi & Misi</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-card rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Visi</h3>
            <p className="text-muted-foreground">
              Menjadi perusahaan rental mobil terpercaya dan terdepan di Indonesia dengan layanan berkualitas tinggi dan harga terjangkau.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Misi</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Menyediakan armada berkualitas dengan perawatan rutin</li>
              <li>• Memberikan layanan pelanggan terbaik 24/7</li>
              <li>• Menjaga standar keamanan dan kenyamanan tinggi</li>
              <li>• Mengembangkan sistem booking yang mudah dan efisien</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-8">Keunggulan Kami</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Armada Berkualitas</h3>
            <p className="text-muted-foreground">
              Mobil-mobil terbaru dengan perawatan rutin dan kondisi prima
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Harga Terjangkau</h3>
            <p className="text-muted-foreground">
              Penawaran harga kompetitif dengan berbagai pilihan paket sewa
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Pelayanan 24/7</h3>
            <p className="text-muted-foreground">
              Tim support siap membantu Anda kapanpun dibutuhkan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
