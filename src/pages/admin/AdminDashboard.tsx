import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  PawPrint, 
  Dog, 
  Cat, 
  Home, 
  Gift,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingPaws } from '@/components/ui/decorative-shapes';

const AdminDashboard = () => {
  const { user } = useAuth();

  const managementCards = [
    {
      title: 'Animales',
      description: 'Gestionar mascotas disponibles para adopción',
      icon: PawPrint,
      href: '/admin/animals',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Especies',
      description: 'Gestionar catálogo de especies',
      icon: Dog,
      href: '/admin/species',
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Razas',
      description: 'Gestionar catálogo de razas',
      icon: Cat,
      href: '/admin/breeds',
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Refugios',
      description: 'Gestionar refugios asociados',
      icon: Home,
      href: '/admin/shelters',
      color: 'bg-sage text-foreground',
    },
    {
      title: 'Donaciones',
      description: 'Gestionar catálogo de necesidades',
      icon: Gift,
      href: '/admin/donations',
      color: 'bg-secondary text-foreground',
    },
  ];

  return (
    <Layout>
      <section className="relative py-12 bg-secondary/30 paw-pattern overflow-hidden">
        <FloatingPaws />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-2"
          >
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Panel de Administración
              </h1>
              <p className="text-muted-foreground">
                ¡Bienvenido, {user?.first_name}! Gestiona tu plataforma de adopción.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-foreground mb-6"
          >
            Gestión
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {managementCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={card.href}>
                  <Card className="rounded-2xl hover:shadow-hover transition-all duration-300 group cursor-pointer h-full">
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-xl ${card.color} flex items-center justify-center mb-2`}>
                        <card.icon className="w-7 h-7" />
                      </div>
                      <CardTitle className="text-lg flex items-center justify-between">
                        {card.title}
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
