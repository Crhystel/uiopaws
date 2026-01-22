import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PawPrint as PawPrintIcon, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import AnimalCard from '@/components/animals/AnimalCard';
import AnimalFilters from '@/components/animals/AnimalFilters';
import { Button } from '@/components/ui/button';
import { publicAnimalsApi, Animal } from '@/lib/api';
import { FloatingPaws } from '@/components/ui/decorative-shapes';

const AnimalsPage = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({
    animal_name: '',
    id_species: '',
    id_breed: '',
    id_shelter: '',
    size: '',
  });

  useEffect(() => {
    fetchAnimals();
  }, [currentPage, filters]);

  const fetchAnimals = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
      };

      if (filters.animal_name) params.animal_name = filters.animal_name;
      if (filters.id_species && filters.id_species !== 'all') params.id_species = parseInt(filters.id_species);
      if (filters.id_breed && filters.id_breed !== 'all') params.id_breed = parseInt(filters.id_breed);
      if (filters.id_shelter && filters.id_shelter !== 'all') params.id_shelter = parseInt(filters.id_shelter);
      if (filters.size && filters.size !== 'all') params.size = filters.size;

      const response = await publicAnimalsApi.getAll(params as any);
      setAnimals(response.data);
      setLastPage(response.last_page);
    } catch (error) {
      console.error('Error fetching animals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-16 bg-secondary/30 paw-pattern overflow-hidden">
        <FloatingPaws />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <PawPrintIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Encuentra tu Compañero Ideal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mascotas Disponibles para Adopción
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada uno de estos animales amorosos está buscando su hogar para siempre. 
              ¿Podrías ser su compañero perfecto?
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <AnimalFilters filters={filters} onFiltersChange={handleFiltersChange} />
          </motion.div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : animals.length === 0 ? (
            <div className="text-center py-20">
              <PawPrintIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron mascotas</h3>
              <p className="text-muted-foreground">Intenta ajustar los filtros para encontrar más mascotas</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {animals.map((animal, index) => (
                  <motion.div
                    key={animal.id_animal}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AnimalCard animal={animal} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full"
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1 px-4">
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-full font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                    disabled={currentPage === lastPage}
                    className="rounded-full"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default AnimalsPage;
