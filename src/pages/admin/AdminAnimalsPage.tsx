import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminAnimalsApi, publicCatalogsApi, Animal, Species, Breed, Shelter } from '@/lib/api';

const AdminAnimalsPage = () => {
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Catalogs
  const [species, setSpecies] = useState<Species[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);

  const [formData, setFormData] = useState({
    animal_name: '',
    status: 'Available',
    birth_date: '',
    color: '',
    is_sterilized: false,
    description: '',
    id_species: '',
    id_breed: '',
    id_shelter: '',
    sex: 'Male',
    age: '',
    size: 'Medium',
  });

  useEffect(() => {
    fetchAnimals();
    fetchCatalogs();
  }, []);

  const fetchAnimals = async () => {
    try {
      const response = await adminAnimalsApi.getAll();
      setAnimals(response.data);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los animales', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalogs = async () => {
    try {
      const [speciesData, breedsData, sheltersData] = await Promise.all([
        publicCatalogsApi.getSpecies(),
        publicCatalogsApi.getBreeds(),
        publicCatalogsApi.getShelters(),
      ]);
      setSpecies(speciesData);
      setBreeds(breedsData);
      setShelters(sheltersData);
    } catch (error) {
      console.error('Error fetching catalogs:', error);
    }
  };

  const openCreateDialog = () => {
    setSelectedAnimal(null);
    setFormData({
      animal_name: '',
      status: 'Available',
      birth_date: '',
      color: '',
      is_sterilized: false,
      description: '',
      id_species: '',
      id_breed: '',
      id_shelter: '',
      sex: 'Male',
      age: '',
      size: 'Medium',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (animal: Animal) => {
    const derivedSpeciesId =
      animal.breed?.id_species ?? breeds.find((b) => b.id_breed === animal.id_breed)?.id_species;
    setSelectedAnimal(animal);
    setFormData({
      animal_name: animal.animal_name,
      status: animal.status,
      birth_date: animal.birth_date,
      color: animal.color,
      is_sterilized: animal.is_sterilized,
      description: animal.description || '',
      id_species: derivedSpeciesId ? derivedSpeciesId.toString() : '',
      id_breed: animal.id_breed?.toString() || '',
      id_shelter: animal.id_shelter?.toString() || '',
      sex: animal.sex,
      age: animal.age?.toString() || '',
      size: animal.size,
    });
    setIsDialogOpen(true);
  };

  const filteredBreeds = formData.id_species
    ? breeds.filter((b) => b.id_species === parseInt(formData.id_species))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id_breed) {
      toast({
        title: 'Faltan datos',
        description: 'Selecciona una especie y una raza antes de guardar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // id_species se usa solo para filtrar razas en el UI
      const { id_species: _idSpecies, ...rest } = formData;
      const data = {
        ...rest,
        id_breed: parseInt(formData.id_breed),
        id_shelter: parseInt(formData.id_shelter),
        age: parseInt(formData.age),
      };

      if (selectedAnimal) {
        await adminAnimalsApi.update(selectedAnimal.id_animal, data);
        toast({ title: 'Éxito', description: 'Animal actualizado correctamente' });
      } else {
        await adminAnimalsApi.create(data);
        toast({ title: 'Éxito', description: 'Animal creado correctamente' });
      }

      setIsDialogOpen(false);
      fetchAnimals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo guardar el animal',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnimal) return;
    setIsSaving(true);

    try {
      await adminAnimalsApi.delete(selectedAnimal.id_animal);
      toast({ title: 'Éxito', description: 'Animal eliminado correctamente' });
      setIsDeleteDialogOpen(false);
      fetchAnimals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo eliminar el animal',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAnimals = animals.filter((animal) =>
    animal.animal_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sizes = [
    { value: 'Small', label: 'Pequeño' },
    { value: 'Medium', label: 'Mediano' },
    { value: 'Large', label: 'Grande' },
  ];

  const statuses = [
    { value: 'Available', label: 'Disponible' },
    { value: 'Adopted', label: 'Adoptado' },
    { value: 'Pending', label: 'Pendiente' },
  ];

  const sexes = [
    { value: 'Male', label: 'Macho' },
    { value: 'Female', label: 'Hembra' },
  ];

  const getStatusLabel = (status: string) => {
    const found = statuses.find(s => s.value === status);
    return found ? found.label : status;
  };

  return (
    <Layout>
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestionar Animales</h1>
                <p className="text-muted-foreground">Agregar, editar o eliminar animales de la plataforma</p>
              </div>
            </div>
            <Button onClick={openCreateDialog} className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              Agregar Animal
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar animales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 rounded-full bg-secondary border-0 h-12"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Especie/Raza</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnimals.map((animal) => (
                    <TableRow key={animal.id_animal}>
                      <TableCell className="font-medium">{animal.animal_name}</TableCell>
                      <TableCell>
                        <Badge variant={animal.status === 'Available' ? 'default' : 'secondary'} className="rounded-full">
                          {getStatusLabel(animal.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{animal.breed?.breed_name || 'N/A'}</TableCell>
                      <TableCell>{sizes.find(s => s.value === animal.size)?.label || animal.size}</TableCell>
                      <TableCell>{animal.age} años</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(animal)}
                            className="rounded-full"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAnimal(animal);
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAnimal ? 'Editar Animal' : 'Agregar Nuevo Animal'}</DialogTitle>
            <DialogDescription>
              {selectedAnimal ? 'Actualiza los datos del animal a continuación.' : 'Completa los datos del nuevo animal.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="animal_name">Nombre</Label>
                <Input
                  id="animal_name"
                  value={formData.animal_name}
                  onChange={(e) => setFormData({ ...formData, animal_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_species">Especie</Label>
                <Select
                  value={formData.id_species}
                  onValueChange={(v) => setFormData({ ...formData, id_species: v, id_breed: '' })}
                >
                  <SelectTrigger id="id_species">
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

              <div className="space-y-2">
                <Label htmlFor="id_breed">Raza</Label>
                <Select
                  value={formData.id_breed}
                  onValueChange={(v) => setFormData({ ...formData, id_breed: v })}
                  disabled={!formData.id_species}
                >
                  <SelectTrigger id="id_breed">
                    <SelectValue
                      placeholder={formData.id_species ? 'Seleccionar raza' : 'Primero selecciona una especie'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBreeds.map((b) => (
                      <SelectItem key={b.id_breed} value={b.id_breed.toString()}>
                        {b.breed_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_shelter">Refugio</Label>
                <Select value={formData.id_shelter} onValueChange={(v) => setFormData({ ...formData, id_shelter: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar refugio" />
                  </SelectTrigger>
                  <SelectContent>
                    {shelters.map((s) => (
                      <SelectItem key={s.id_shelter} value={s.id_shelter.toString()}>{s.shelter_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sex">Sexo</Label>
                <Select value={formData.sex} onValueChange={(v) => setFormData({ ...formData, sex: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sexes.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Edad (años)</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Tamaño</Label>
                <Select value={formData.size} onValueChange={(v) => setFormData({ ...formData, size: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_sterilized"
                checked={formData.is_sterilized}
                onCheckedChange={(checked) => setFormData({ ...formData, is_sterilized: checked as boolean })}
              />
              <Label htmlFor="is_sterilized" className="font-normal">Está esterilizado/a</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedAnimal ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Animal</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a "{selectedAnimal?.animal_name}"? Esta acción no se puede deshacer.
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

export default AdminAnimalsPage;
