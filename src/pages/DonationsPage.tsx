import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, Loader2, Search } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { FloatingPaws } from '@/components/ui/decorative-shapes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { publicCatalogsApi, publicDonationsApi, DonationItemCatalog, Shelter } from '@/lib/api';

const CATEGORIES = [
  { value: 'all', label: 'Todas' },
  { value: 'Alimentos', label: 'Alimentos' },
  { value: 'Medicamentos', label: 'Medicamentos' },
  { value: 'Juguetes', label: 'Juguetes' },
  { value: 'Ropa de cama', label: 'Ropa de cama' },
  { value: 'Higiene', label: 'Higiene' },
  { value: 'Otros', label: 'Otros' },
];

const DonationsPage = () => {
  const [items, setItems] = useState<DonationItemCatalog[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({
    category: 'all',
    id_shelter: 'all',
    search: '',
  });
  const [isDevDialogOpen, setIsDevDialogOpen] = useState(false);
  const [selectedShelterName, setSelectedShelterName] = useState<string>('');

  useEffect(() => {
    const loadShelters = async () => {
      try {
        const data = await publicCatalogsApi.getShelters();
        setShelters(data);
      } catch (e) {
        // silencioso para no bloquear la página
      }
    };
    loadShelters();
  }, []);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page: currentPage };
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      if (filters.id_shelter && filters.id_shelter !== 'all') params.id_shelter = parseInt(filters.id_shelter);
      if (filters.search.trim()) params.search = filters.search.trim();

      const response = await publicDonationsApi.getAll(params as any);
      setItems(response.data);
      setLastPage(response.last_page);
    } finally {
      setIsLoading(false);
    }
  };

  const shelterOptions = useMemo(
    () => [{ id_shelter: -1, shelter_name: 'Todos los refugios' } as Shelter, ...shelters],
    [shelters],
  );

  const shelterNameById = useMemo(() => {
    const map = new Map<number, string>();
    shelters.forEach((s) => map.set(s.id_shelter, s.shelter_name));
    return map;
  }, [shelters]);

  return (
    <Layout>
      <section className="relative py-16 bg-secondary/30 paw-pattern overflow-hidden">
        <FloatingPaws />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <HeartHandshake className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Ayuda a nuestros refugios</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Donaciones</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estos son los artículos que actualmente se necesitan. Tu ayuda marca la diferencia.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Filtros */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div>
              <label className="text-sm font-medium text-foreground">Categoría</label>
              <Select
                value={filters.category}
                onValueChange={(v) => {
                  setFilters((p) => ({ ...p, category: v }));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="mt-2 bg-background z-10">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Refugio</label>
              <Select
                value={filters.id_shelter}
                onValueChange={(v) => {
                  setFilters((p) => ({ ...p, id_shelter: v }));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="mt-2 bg-background z-10">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {shelterOptions.map((s) => (
                    <SelectItem key={s.id_shelter} value={s.id_shelter === -1 ? 'all' : String(s.id_shelter)}>
                      {s.shelter_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Buscar</label>
              <div className="relative mt-2">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={filters.search}
                  onChange={(e) => {
                    setFilters((p) => ({ ...p, search: e.target.value }));
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar ítems..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <HeartHandshake className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No hay ítems disponibles</h3>
              <p className="text-muted-foreground">Prueba ajustando los filtros.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => {
                  const shelterName = item.id_shelter
                    ? shelterNameById.get(item.id_shelter) ?? 'Refugio no especificado'
                    : 'Todos los refugios';

                  const collected = item.collected_quantity ?? 0;
                  const needed = item.quantity_needed ?? 0;
                  const pct = needed > 0 ? (collected / needed) * 100 : 0;

                  return (
                    <motion.div
                      key={item.id_donation_item_catalog}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Card className="rounded-2xl shadow-card">
                        <CardHeader>
                          <CardTitle className="text-lg">{item.item_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {item.category} · {shelterName}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {item.description ? (
                            <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                          ) : null}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progreso</span>
                              <span className="font-medium text-foreground">
                                {collected} / {needed}
                              </span>
                            </div>
                            <Progress value={Math.min(pct, 100)} />
                          </div>

                          <Button
                            className="w-full rounded-full"
                            onClick={() => {
                              setSelectedShelterName(shelterName || 'el refugio indicado');
                              setIsDevDialogOpen(true);
                            }}
                          >
                            Donar ahora
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

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
                  <span className="text-sm text-muted-foreground px-3">
                    Página {currentPage} de {lastPage}
                  </span>
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

      <Dialog open={isDevDialogOpen} onOpenChange={setIsDevDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Donaciones en desarrollo</DialogTitle>
            <DialogDescription>
              El sistema de donaciones en línea todavía está en desarrollo. Por favor, acércate a{' '}
              <span className="font-semibold text-foreground">{selectedShelterName}</span> para entregar tu donativo
              físico.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button className="rounded-full" onClick={() => setIsDevDialogOpen(false)}>
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DonationsPage;
