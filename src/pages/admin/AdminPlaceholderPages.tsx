import { motion } from 'framer-motion';
import { Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FloatingPaws, BlobShape } from '@/components/ui/decorative-shapes';

interface AdminPlaceholderPageProps {
  title: string;
  description: string;
}

const AdminPlaceholderPage = ({ title, description }: AdminPlaceholderPageProps) => {
  return (
    <Layout>
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="min-h-[50vh] flex items-center justify-center relative overflow-hidden">
            <FloatingPaws />
            <div className="absolute top-10 right-10 w-48 h-48 opacity-20">
              <BlobShape className="w-full h-full text-primary" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center px-4 relative z-10"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
              >
                <Clock className="w-10 h-10 text-primary" />
              </motion.div>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                Próximamente
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Esta sección de gestión está actualmente en desarrollo. 
                Pronto tendrás acceso completo a las funciones CRUD.
              </p>

              <Link to="/admin">
                <Button variant="outline" className="rounded-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Panel
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export const AdminSpeciesPage = () => (
  <AdminPlaceholderPage 
    title="Gestionar Especies" 
    description="Agregar, editar o eliminar especies de animales"
  />
);

export const AdminBreedsPage = () => (
  <AdminPlaceholderPage 
    title="Gestionar Razas" 
    description="Agregar, editar o eliminar razas de animales"
  />
);
