import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, PawPrint, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { FloatingPaws, WavyDivider, BlobShape } from '@/components/ui/decorative-shapes';
import heroPets from '@/assets/hero-pets.jpg';

const Index = () => {
  const stats = [
    { value: '2,500+', label: 'Mascotas Adoptadas' },
    { value: '150+', label: 'Refugios Asociados' },
    { value: '10k+', label: 'Familias Felices' },
  ];

  const features = [
    {
      icon: Heart,
      title: 'Encuentra tu Compañero',
      description: 'Explora cientos de adorables mascotas esperando su hogar para siempre.',
    },
    {
      icon: Sparkles,
      title: 'Adopción Fácil',
      description: 'Nuestro proceso simplificado hace que adoptar a tu nuevo mejor amigo sea sencillo.',
    },
    {
      icon: PawPrint,
      title: 'Apoya a los Refugios',
      description: 'Cada adopción ayuda a los refugios a continuar su misión de rescatar y cuidar animales.',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden paw-pattern">
        <FloatingPaws />
        
        {/* Decorative Blobs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 opacity-30">
          <BlobShape className="w-full h-full text-primary/30" />
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 opacity-20">
          <BlobShape className="w-full h-full text-sage" />
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Adopta, No Compres</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                Encuentra tu Nuevo
                <span className="block text-primary">Mejor Amigo</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                Abre tu corazón y hogar a un compañero amoroso. Cada mascota merece una familia, 
                y cada familia merece el amor incondicional de una mascota.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/animals">
                  <Button size="lg" className="rounded-full gap-2 px-8 h-14 text-base">
                    <PawPrint className="w-5 h-5" />
                    Conoce Nuestras Mascotas
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="rounded-full gap-2 px-8 h-14 text-base">
                    Saber Más
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="rounded-[3rem] overflow-hidden shadow-hover">
                  <img
                    src={heroPets}
                    alt="Mascotas felices esperando adopción"
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                {/* Floating Badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">100+ Mascotas</p>
                      <p className="text-sm text-muted-foreground">Listas para adoptar</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Background decorative circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-secondary/50 -z-10" />
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <WavyDivider className="absolute bottom-0 left-0 right-0 h-24 text-background" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Por Qué Adoptar con Nosotros?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hacemos que el camino hacia la adopción sea simple, alegre y significativo tanto para ti como para tu futura mascota.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-3xl p-8 shadow-card hover:shadow-hover transition-shadow duration-300 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <FloatingPaws />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              ¿Listo para Cambiar una Vida?
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Miles de animales amorosos están esperando su hogar para siempre. 
              Comienza tu camino de adopción hoy y marca la diferencia.
            </p>
            <Link to="/animals">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full gap-2 px-8 h-14 text-base"
              >
                <PawPrint className="w-5 h-5" />
                Ver Mascotas Disponibles
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
