import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Home,
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { adminSheltersApi, Shelter } from '@/lib/api';

const formatShelterAddress = (address: Shelter['address']) => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [address.street, address.city, address.country, address.postal_code].filter(Boolean).join(', ');
};

const AdminSheltersPage = () => {
  const { toast } = useToast();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    shelter_name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      country: '',
      postal_code: '',
    },
  });

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const data = await adminSheltersApi.getAll();
      setShelters(data);
    } catch (error) {
      console.error('Error fetching shelters:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los refugios', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedShelter(null);
    setFormData({
      shelter_name: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        country: '',
        postal_code: '',
      },
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (shelter: Shelter) => {
    setSelectedShelter(shelter);
    const addressObj =
      typeof shelter.address === 'string'
        ? { street: shelter.address, city: '', country: '', postal_code: '' }
        : shelter.address;
    setFormData({
      shelter_name: shelter.shelter_name,
      phone: shelter.phone,
      email: shelter.email,
      address: {
        street: addressObj?.street || '',
        city: addressObj?.city || '',
        country: addressObj?.country || '',
        postal_code: addressObj?.postal_code || '',
      },
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: any = {
        shelter_name: formData.shelter_name,
        contact_phone: formData.phone,
        contact_email: formData.email,
        address: formData.address,
      };

      // Asegura que nunca se envíe un id_shelter (o cualquier id) en el body.
      delete payload.id_shelter;

      if (selectedShelter) {
        await adminSheltersApi.update(selectedShelter.id_shelter, payload);
        toast({ title: 'Éxito', description: 'Refugio actualizado correctamente' });
      } else {
        await adminSheltersApi.create(payload);
        toast({ title: 'Éxito', description: 'Refugio creado correctamente' });
      }

      setIsDialogOpen(false);
      fetchShelters();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo guardar el refugio',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedShelter) return;
    setIsSaving(true);

    try {
      await adminSheltersApi.delete(selectedShelter.id_shelter);
      toast({ title: 'Éxito', description: 'Refugio eliminado correctamente' });
      setIsDeleteDialogOpen(false);
      fetchShelters();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo eliminar el refugio',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredShelters = shelters.filter((shelter) =>
    shelter.shelter_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <h1 className="text-2xl font-bold text-foreground">Gestionar Refugios</h1>
                <p className="text-muted-foreground">Agregar, editar o eliminar refugios asociados</p>
              </div>
            </div>
            <Button onClick={openCreateDialog} className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              Agregar Refugio
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar refugios..."
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
                    <TableHead>Dirección</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShelters.map((shelter) => (
                    <TableRow key={shelter.id_shelter}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Home className="w-4 h-4 text-primary" />
                          </div>
                          {shelter.shelter_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatShelterAddress(shelter.address)}</TableCell>
                      <TableCell>{shelter.phone}</TableCell>
                      <TableCell>{shelter.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(shelter)}
                            className="rounded-full"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedShelter(shelter);
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedShelter ? 'Editar Refugio' : 'Agregar Nuevo Refugio'}</DialogTitle>
            <DialogDescription>
              {selectedShelter ? 'Actualiza los datos del refugio a continuación.' : 'Completa los datos del nuevo refugio.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shelter_name">Nombre del Refugio</Label>
              <Input
                id="shelter_name"
                value={formData.shelter_name}
                onChange={(e) => setFormData({ ...formData, shelter_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address_street">Calle</Label>
                <Input
                  id="address_street"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, address: { ...p.address, street: e.target.value } }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_city">Ciudad</Label>
                <Input
                  id="address_city"
                  value={formData.address.city}
                  onChange={(e) => setFormData((p) => ({ ...p, address: { ...p.address, city: e.target.value } }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_country">País</Label>
                <Input
                  id="address_country"
                  value={formData.address.country}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, address: { ...p.address, country: e.target.value } }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_postal_code">Código Postal</Label>
                <Input
                  id="address_postal_code"
                  value={formData.address.postal_code}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, address: { ...p.address, postal_code: e.target.value } }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedShelter ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Refugio</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{selectedShelter?.shelter_name}"? Esta acción no se puede deshacer.
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

export default AdminSheltersPage;
