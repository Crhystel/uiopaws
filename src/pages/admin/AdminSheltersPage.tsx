import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Home,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
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
    address: '',
    phone: '',
    email: '',
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
      toast({ title: 'Error', description: 'Failed to fetch shelters', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedShelter(null);
    setFormData({
      shelter_name: '',
      address: '',
      phone: '',
      email: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (shelter: Shelter) => {
    setSelectedShelter(shelter);
    setFormData({
      shelter_name: shelter.shelter_name,
      address: shelter.address,
      phone: shelter.phone,
      email: shelter.email,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (selectedShelter) {
        await adminSheltersApi.update(selectedShelter.id_shelter, formData);
        toast({ title: 'Success', description: 'Shelter updated successfully' });
      } else {
        await adminSheltersApi.create(formData);
        toast({ title: 'Success', description: 'Shelter created successfully' });
      }

      setIsDialogOpen(false);
      fetchShelters();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save shelter',
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
      toast({ title: 'Success', description: 'Shelter deleted successfully' });
      setIsDeleteDialogOpen(false);
      fetchShelters();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete shelter',
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
                <h1 className="text-2xl font-bold text-foreground">Manage Shelters</h1>
                <p className="text-muted-foreground">Add, edit, or remove partner shelters</p>
              </div>
            </div>
            <Button onClick={openCreateDialog} className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              Add Shelter
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search shelters..."
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
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-muted-foreground">{shelter.address}</TableCell>
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
            <DialogTitle>{selectedShelter ? 'Edit Shelter' : 'Add New Shelter'}</DialogTitle>
            <DialogDescription>
              {selectedShelter ? 'Update the shelter details below.' : 'Fill in the details for the new shelter.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shelter_name">Shelter Name</Label>
              <Input
                id="shelter_name"
                value={formData.shelter_name}
                onChange={(e) => setFormData({ ...formData, shelter_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedShelter ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shelter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedShelter?.shelter_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminSheltersPage;
