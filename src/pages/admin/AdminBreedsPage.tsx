import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adminBreedsApi, Breed, publicCatalogsApi, Species } from '@/lib/api';

const AdminBreedsPage = () => {
  const { toast } = useToast();
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState<Breed | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    species_id: '',
  });

  const fetchCatalogs = async () => {
    try {
      const [speciesData, breedsData] = await Promise.all([
        publicCatalogsApi.getSpecies(),
        publicCatalogsApi.getBreeds(),
      ]);
      setSpecies(speciesData);
      setBreeds(breedsData);
    } catch (error) {
      console.error('Error fetching breeds/species:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar las razas', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speciesNameById = useMemo(() => {
    const map = new Map<number, string>();
    species.forEach((s) => map.set(s.id_species, s.species_name));
    return map;
  }, [species]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return breeds;
    return breeds.filter((b) => {
      const sName = speciesNameById.get(b.id_species)?.toLowerCase() || '';
      return b.breed_name.toLowerCase().includes(q) || sName.includes(q);
    });
  }, [breeds, searchQuery, speciesNameById]);

  const openCreate = () => {
    setSelected(null);
    setFormData({ name: '', species_id: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (b: Breed) => {
    setSelected(b);
    setFormData({ name: b.breed_name, species_id: b.id_species.toString() });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const speciesId = parseInt(formData.species_id);
    if (!name || Number.isNaN(speciesId)) return;

    setIsSaving(true);
    try {
      if (selected) {
        await adminBreedsApi.update(selected.id_breed, { name, species_id: speciesId });
        toast({ title: 'Éxito', description: 'Raza actualizada correctamente' });
      } else {
        await adminBreedsApi.create({ name, species_id: speciesId });
        toast({ title: 'Éxito', description: 'Raza creada correctamente' });
      }
      setIsDialogOpen(false);
      setIsLoading(true);
      await fetchCatalogs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo guardar la raza',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await adminBreedsApi.delete(selected.id_breed);
      toast({ title: 'Éxito', description: 'Raza eliminada correctamente' });
      setIsDeleteDialogOpen(false);
      setIsLoading(true);
      await fetchCatalogs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo eliminar la raza',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestionar Razas</h1>
                <p className="text-muted-foreground">Agregar, editar o eliminar razas</p>
              </div>
            </div>
            <Button onClick={openCreate} className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              Agregar Raza
            </Button>
          </div>

          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar razas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 rounded-full bg-secondary border-0 h-12"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Raza</TableHead>
                    <TableHead>Especie</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b) => (
                    <TableRow key={b.id_breed}>
                      <TableCell className="font-medium">{b.breed_name}</TableCell>
                      <TableCell className="text-muted-foreground">{speciesNameById.get(b.id_species) || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(b)} className="rounded-full">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelected(b);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="rounded-full text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? 'Editar Raza' : 'Agregar Nueva Raza'}</DialogTitle>
            <DialogDescription>
              {selected ? 'Actualiza los datos de la raza.' : 'Completa los datos de la nueva raza.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="species_id">Especie</Label>
              <Select
                value={formData.species_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, species_id: v }))}
              >
                <SelectTrigger id="species_id">
                  <SelectValue placeholder="Seleccionar especie" />
                </SelectTrigger>
                <SelectContent>
                  {species.map((s) => (
                    <SelectItem key={s.id_species} value={s.id_species.toString()}>
                      {s.species_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selected ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Raza</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{selected?.breed_name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminBreedsPage;
