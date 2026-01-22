import { motion } from 'framer-motion';
import { Clock, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { FloatingPaws, BlobShape } from '@/components/ui/decorative-shapes';

const ComingSoonPage = () => {
  return (
    <Layout hideFooter>
      <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        <FloatingPaws />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 opacity-20">
          <BlobShape className="w-full h-full text-primary" />
        </div>
        <div className="absolute bottom-20 left-20 w-80 h-80 opacity-20">
          <BlobShape className="w-full h-full text-sage" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4 relative z-10"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-8"
          >
            <Clock className="w-12 h-12 text-primary" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¡Próximamente!
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
            El formulario de adopción está actualmente en desarrollo. Pronto podrás 
            enviar tu solicitud de adopción directamente a través de nuestra plataforma.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/animals">
              <Button variant="outline" className="rounded-full gap-2 px-6 h-12">
                <ArrowLeft className="w-4 h-4" />
                Ver Más Mascotas
              </Button>
            </Link>
            <Link to="/">
              <Button className="rounded-full gap-2 px-6 h-12">
                <Heart className="w-4 h-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ComingSoonPage;
