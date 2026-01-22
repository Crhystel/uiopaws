import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  adminDonationItemsCatalogApi,
  DonationCategory,
  DonationItemCatalog,
  DonationItemCatalogUpsertPayload,
  publicCatalogsApi,
  Shelter,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES: Array<{ value: DonationCategory; label: string }> = [
  { value: 'Alimentos', label: 'Alimentos' },
  { value: 'Medicamentos', label: 'Medicamentos' },
  { value: 'Juguetes', label: 'Juguetes' },
  { value: 'Ropa de cama', label: 'Ropa de cama' },
  { value: 'Higiene', label: 'Higiene' },
  { value: 'Otros', label: 'Otros' },
];

type FormState = {
  item_name: string;
  category: DonationCategory | '';
  quantity_needed: string;
  id_shelter: string; // 'all' | number string
  description: string;
};

const emptyForm: FormState = {
  item_name: '',
  category: '',
  quantity_needed: '',
  id_shelter: 'all',
  description: '',
};

const AdminDonationsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<DonationItemCatalog[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<DonationItemCatalog | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const shelterOptions = useMemo(
    () => [{ id_shelter: -1, shelter_name: 'Todos los refugios' } as Shelter, ...shelters],
    [shelters],
  );

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [catalog, sheltersData] = await Promise.all([
        adminDonationItemsCatalogApi.getAll(),
        publicCatalogsApi.getShelters(),
      ]);
      setItems(catalog.data ?? []);
      setShelters(sheltersData);
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudieron cargar las donaciones', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const openEdit = (item: DonationItemCatalog) => {
    setSelected(item);
    setFieldErrors({});
    setForm({
      item_name: item.item_name ?? '',
      category: (item.category as DonationCategory) ?? '',
      quantity_needed: String(item.quantity_needed ?? ''),
      id_shelter: item.id_shelter ? String(item.id_shelter) : 'all',
      description: item.description ?? '',
    });
    setIsDialogOpen(true);
  };

  const openDelete = (item: DonationItemCatalog) => {
    setSelected(item);
    setIsDeleteOpen(true);
  };

  const buildPayload = (): DonationItemCatalogUpsertPayload => {
    const quantity_needed = parseInt(form.quantity_needed, 10);
    const payload: DonationItemCatalogUpsertPayload = {
      item_name: form.item_name.trim(),
      category: form.category as DonationCategory,
      quantity_needed: Number.isFinite(quantity_needed) ? quantity_needed : 0,
      description: form.description.trim() ? form.description.trim() : undefined,
      id_shelter: form.id_shelter !== 'all' ? parseInt(form.id_shelter, 10) : undefined,
    };
    return payload;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFieldErrors({});
    try {
      const payload = buildPayload();
      if (selected) {
        await adminDonationItemsCatalogApi.update(selected.id_donation_item_catalog, payload);
        toast({ title: 'Éxito', description: 'Ítem actualizado correctamente' });
      } else {
        await adminDonationItemsCatalogApi.create(payload);
        toast({ title: 'Éxito', description: 'Ítem creado correctamente' });
      }

      setIsDialogOpen(false);
      await loadAll();
    } catch (e: any) {
      const status = e?.response?.status;
      const errors = e?.response?.data?.errors;
      if (status === 422 && errors) {
        setFieldErrors(errors);
        toast({ title: 'Revisa el formulario', description: 'Hay campos con errores', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'No se pudo guardar el ítem', variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await adminDonationItemsCatalogApi.delete(selected.id_donation_item_catalog);
      toast({ title: 'Eliminado', description: 'Ítem eliminado correctamente' });
      setIsDeleteOpen(false);
      await loadAll();
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo eliminar el ítem', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const err = (key: string) => (fieldErrors?.[key]?.[0] ? fieldErrors[key][0] : '');

  return (
    <Layout>
      <section className="relative py-12 bg-secondary/30 paw-pattern overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Donaciones</h1>
                <p className="text-muted-foreground">Administra el catálogo de necesidades.</p>
              </div>
            </div>
            <Button className="rounded-full gap-2" onClick={openCreate}>
              <Plus className="w-4 h-4" />
              Nuevo ítem
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Catálogo</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">Aún no hay ítems.</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <Card key={item.id_donation_item_catalog} className="rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-base">{item.item_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {item.category} · {item.shelter?.shelter_name ?? 'Todos'}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Cantidad necesaria: <span className="font-medium text-foreground">{item.quantity_needed}</span>
                        </p>
                        {item.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                        ) : null}
                        <div className="flex gap-2">
                          <Button variant="outline" className="rounded-full gap-2" onClick={() => openEdit(item)}>
                            <Pencil className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button variant="destructive" className="rounded-full gap-2" onClick={() => openDelete(item)}>
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected ? 'Editar ítem' : 'Crear ítem'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Nombre del artículo *</label>
              <Input
                className="mt-2"
                value={form.item_name}
                onChange={(e) => setForm((p) => ({ ...p, item_name: e.target.value }))}
                placeholder="Ej: Alimento para perros adultos"
                maxLength={255}
              />
              {err('item_name') ? <p className="text-sm text-destructive mt-2">{err('item_name')}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Categoría *</label>
              <Select value={form.category || 'all'} onValueChange={(v) => setForm((p) => ({ ...p, category: v as any }))}>
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
              {err('category') ? <p className="text-sm text-destructive mt-2">{err('category')}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Cantidad necesaria *</label>
              <Input
                className="mt-2"
                type="number"
                min={1}
                value={form.quantity_needed}
                onChange={(e) => setForm((p) => ({ ...p, quantity_needed: e.target.value }))}
                placeholder="50"
              />
              {err('quantity_needed') ? <p className="text-sm text-destructive mt-2">{err('quantity_needed')}</p> : null}
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Refugio (opcional)</label>
              <Select value={form.id_shelter} onValueChange={(v) => setForm((p) => ({ ...p, id_shelter: v }))}>
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
              {err('id_shelter') ? <p className="text-sm text-destructive mt-2">{err('id_shelter')}</p> : null}
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <Textarea
                className="mt-2"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe el ítem y su uso..."
              />
              {err('description') ? <p className="text-sm text-destructive mt-2">{err('description')}</p> : null}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-full" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="rounded-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar ítem</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará “{selected?.item_name}” del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSaving}>
              {isSaving ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default AdminDonationsPage;
