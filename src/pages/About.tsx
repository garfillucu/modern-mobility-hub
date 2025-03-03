
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { BadgeCheck, Car, Clock, MapPin, Shield, Smile } from "lucide-react";

const About = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold">Tentang Kami</h1>
        <Separator className="my-6 mx-auto w-24 bg-primary/50" />
      </motion.div>
      
      <motion.div 
        className="grid md:grid-cols-2 gap-12 items-center mb-20"
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        <motion.div variants={fadeIn}>
          <h2 className="text-3xl font-semibold mb-6 flex items-center">
            <span className="text-primary mr-2">
              <Car size={28} />
            </span>
            Sejarah Perusahaan
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            ModernRent didirikan pada tahun 2020 dengan visi untuk memberikan solusi transportasi modern yang aman, nyaman, dan terjangkau bagi masyarakat Indonesia. Sejak awal berdiri, kami telah melayani ribuan pelanggan dan terus berkembang hingga saat ini.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Dengan armada yang selalu diperbarui dan layanan pelanggan 24/7, kami berkomitmen untuk memberikan pengalaman rental mobil terbaik bagi setiap pelanggan.
          </p>
        </motion.div>
        <motion.div 
          variants={fadeIn}
          className="overflow-hidden rounded-xl shadow-lg"
        >
          <img
            src="https://images.unsplash.com/photo-1573152958734-1922c188fba3?q=80&w=2832&auto=format&fit=crop"
            alt="Our Office"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </motion.div>
      </motion.div>

      <motion.div 
        className="mb-20"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className="text-3xl font-semibold mb-8 text-center flex items-center justify-center">
          <span className="text-primary mr-2">
            <MapPin size={24} />
          </span>
          Visi & Misi
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            className="p-8 bg-card rounded-xl shadow-md border border-border/50 hover:shadow-lg transition-shadow duration-300"
            whileHover={{ y: -5 }}
            variants={fadeIn}
          >
            <h3 className="text-2xl font-semibold mb-4 text-primary">Visi</h3>
            <p className="text-muted-foreground leading-relaxed">
              Menjadi perusahaan rental mobil terpercaya dan terdepan di Indonesia dengan layanan berkualitas tinggi dan harga terjangkau.
            </p>
          </motion.div>
          <motion.div 
            className="p-8 bg-card rounded-xl shadow-md border border-border/50 hover:shadow-lg transition-shadow duration-300"
            whileHover={{ y: -5 }}
            variants={fadeIn}
          >
            <h3 className="text-2xl font-semibold mb-4 text-primary">Misi</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <BadgeCheck className="text-primary mr-2 mt-1 flex-shrink-0" size={18} />
                <span>Menyediakan armada berkualitas dengan perawatan rutin</span>
              </li>
              <li className="flex items-start">
                <BadgeCheck className="text-primary mr-2 mt-1 flex-shrink-0" size={18} />
                <span>Memberikan layanan pelanggan terbaik 24/7</span>
              </li>
              <li className="flex items-start">
                <BadgeCheck className="text-primary mr-2 mt-1 flex-shrink-0" size={18} />
                <span>Menjaga standar keamanan dan kenyamanan tinggi</span>
              </li>
              <li className="flex items-start">
                <BadgeCheck className="text-primary mr-2 mt-1 flex-shrink-0" size={18} />
                <span>Mengembangkan sistem booking yang mudah dan efisien</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        <h2 className="text-3xl font-semibold mb-8 text-center flex items-center justify-center">
          <span className="text-primary mr-2">
            <Shield size={24} />
          </span>
          Keunggulan Kami
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            className="p-8 bg-card rounded-xl shadow-md border border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            whileHover={{ scale: 1.03 }}
            variants={fadeIn}
          >
            <div className="text-primary mb-4">
              <Car size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Armada Berkualitas</h3>
            <p className="text-muted-foreground">
              Mobil-mobil terbaru dengan perawatan rutin dan kondisi prima
            </p>
          </motion.div>
          <motion.div 
            className="p-8 bg-card rounded-xl shadow-md border border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            whileHover={{ scale: 1.03 }}
            variants={fadeIn}
          >
            <div className="text-primary mb-4">
              <Smile size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Harga Terjangkau</h3>
            <p className="text-muted-foreground">
              Penawaran harga kompetitif dengan berbagai pilihan paket sewa
            </p>
          </motion.div>
          <motion.div 
            className="p-8 bg-card rounded-xl shadow-md border border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            whileHover={{ scale: 1.03 }}
            variants={fadeIn}
          >
            <div className="text-primary mb-4">
              <Clock size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Pelayanan 24/7</h3>
            <p className="text-muted-foreground">
              Tim support siap membantu Anda kapanpun dibutuhkan
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
