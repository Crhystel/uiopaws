import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, Loader2, ArrowLeft, Phone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FloatingPaws, BlobShape } from '@/components/ui/decorative-shapes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authApi, type RegisterPayload } from '@/lib/api';
import { z } from 'zod';

type FieldErrors = Partial<Record<keyof (RegisterPayload & { confirmPassword: string }), string>>;

const documentTypeOptions = ['Cédula', 'Pasaporte', 'RUC'] as const;

const registerSchema = z
  .object({
    first_name: z.string().trim().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
    middle_name: z
      .string()
      .trim()
      .max(255, 'Máximo 255 caracteres')
      .optional()
      .or(z.literal('')),
    last_name: z.string().trim().min(1, 'El apellido es requerido').max(255, 'Máximo 255 caracteres'),
    second_last_name: z
      .string()
      .trim()
      .max(255, 'Máximo 255 caracteres')
      .optional()
      .or(z.literal('')),
    document_type: z.enum(documentTypeOptions, { required_error: 'Selecciona un tipo de documento' }),
    document_number: z
      .string()
      .trim()
      .min(1, 'El número de documento es requerido')
      .max(255, 'Máximo 255 caracteres'),
    phone: z.string().trim().min(1, 'El teléfono es requerido').max(20, 'Máximo 20 caracteres'),
    email: z.string().trim().email('El correo no es válido').max(255, 'Máximo 255 caracteres'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

const FieldErrorText = ({ id, message }: { id: string; message?: string }) => {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState<RegisterPayload & { confirmPassword: string }>({
    first_name: '',
    middle_name: '',
    last_name: '',
    second_last_name: '',
    document_type: 'Cédula',
    document_number: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const canSubmit = useMemo(() => {
    // Evita doble submit y ayuda a UX sin cambiar reglas de backend.
    return !isLoading;
  }, [isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSelectChange = (key: 'document_type', value: RegisterPayload['document_type']) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateClientSide = (): boolean => {
    const result = registerSchema.safeParse(formData);
    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const next: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FieldErrors | undefined;
      if (key && !next[key]) next[key] = issue.message;
    }
    setFieldErrors(next);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateClientSide()) return;

    setIsLoading(true);
    try {
      const { confirmPassword: _confirmPassword, ...payloadRaw } = formData;
      // La API acepta opcionales, pero no conviene enviar strings vacíos.
      const payload: RegisterPayload = {
        ...payloadRaw,
        middle_name: payloadRaw.middle_name?.trim() ? payloadRaw.middle_name.trim() : undefined,
        second_last_name: payloadRaw.second_last_name?.trim()
          ? payloadRaw.second_last_name.trim()
          : undefined,
      };

      await authApi.register(payload);
      toast({
        title: '¡Registro exitoso!',
        description: 'Ahora puedes iniciar sesión con tus credenciales.',
      });
      navigate('/login', { replace: true });
    } catch (error: any) {
      const status = error?.response?.status;
      const apiErrors = error?.response?.data?.errors as Record<string, string[] | string> | undefined;

      if (status === 422 && apiErrors) {
        const next: FieldErrors = {};
        for (const [k, v] of Object.entries(apiErrors)) {
          const message = Array.isArray(v) ? v[0] : v;
          // Mapeo directo: los nombres coinciden con la API.
          next[k as keyof FieldErrors] = message;
        }
        setFieldErrors((prev) => ({ ...prev, ...next }));
        toast({
          title: 'Revisa los campos',
          description: 'Hay errores de validación. Corrige los campos marcados.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error al registrarse',
          description: error?.response?.data?.message || 'Intenta nuevamente en unos minutos.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-hero paw-pattern">
      <FloatingPaws />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-20">
        <BlobShape className="w-full h-full text-primary" />
      </div>
      <div className="absolute bottom-0 left-0 w-80 h-80 opacity-20">
        <BlobShape className="w-full h-full text-sage" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-3xl shadow-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"
                >
                  <Heart className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <span className="text-xl font-bold text-foreground">UIO Paws</span>
              </Link>
              <h1 className="text-2xl font-bold text-foreground mb-2">¡Únete a Nuestra Familia!</h1>
              <p className="text-muted-foreground">Crea una cuenta para iniciar tu viaje de adopción</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="first_name"
                      name="first_name"
                      placeholder="Juan"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="pl-12 rounded-xl h-12 bg-secondary border-0"
                      aria-invalid={!!fieldErrors.first_name}
                      aria-describedby={fieldErrors.first_name ? 'first_name-error' : undefined}
                      required
                    />
                  </div>
                  <FieldErrorText id="first_name-error" message={fieldErrors.first_name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middle_name">Segundo nombre</Label>
                  <Input
                    id="middle_name"
                    name="middle_name"
                    placeholder="Carlos"
                    value={formData.middle_name ?? ''}
                    onChange={handleChange}
                    className="rounded-xl h-12 bg-secondary border-0"
                    aria-invalid={!!fieldErrors.middle_name}
                    aria-describedby={fieldErrors.middle_name ? 'middle_name-error' : undefined}
                  />
                  <FieldErrorText id="middle_name-error" message={fieldErrors.middle_name} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="Pérez"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="rounded-xl h-12 bg-secondary border-0"
                    aria-invalid={!!fieldErrors.last_name}
                    aria-describedby={fieldErrors.last_name ? 'last_name-error' : undefined}
                    required
                  />
                  <FieldErrorText id="last_name-error" message={fieldErrors.last_name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="second_last_name">Segundo apellido</Label>
                  <Input
                    id="second_last_name"
                    name="second_last_name"
                    placeholder="López"
                    value={formData.second_last_name ?? ''}
                    onChange={handleChange}
                    className="rounded-xl h-12 bg-secondary border-0"
                    aria-invalid={!!fieldErrors.second_last_name}
                    aria-describedby={fieldErrors.second_last_name ? 'second_last_name-error' : undefined}
                  />
                  <FieldErrorText id="second_last_name-error" message={fieldErrors.second_last_name} />
                </div>
              </div>

              {/* Documento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de documento *</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(value) => handleSelectChange('document_type', value as RegisterPayload['document_type'])}
                  >
                    <SelectTrigger
                      className="rounded-xl h-12 bg-secondary border-0"
                      aria-invalid={!!fieldErrors.document_type}
                      aria-describedby={fieldErrors.document_type ? 'document_type-error' : undefined}
                    >
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="Cédula">Cédula</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                      <SelectItem value="RUC">RUC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldErrorText id="document_type-error" message={fieldErrors.document_type} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document_number">Número de documento *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="document_number"
                      name="document_number"
                      placeholder="1712345678"
                      value={formData.document_number}
                      onChange={handleChange}
                      className="pl-12 rounded-xl h-12 bg-secondary border-0"
                      aria-invalid={!!fieldErrors.document_number}
                      aria-describedby={fieldErrors.document_number ? 'document_number-error' : undefined}
                      required
                    />
                  </div>
                  <FieldErrorText id="document_number-error" message={fieldErrors.document_number} />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="0991234567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-12 rounded-xl h-12 bg-secondary border-0"
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                    required
                  />
                </div>
                <FieldErrorText id="phone-error" message={fieldErrors.phone} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-12 rounded-xl h-12 bg-secondary border-0"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    required
                  />
                </div>
                <FieldErrorText id="email-error" message={fieldErrors.email} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-12 rounded-xl h-12 bg-secondary border-0"
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    required
                  />
                </div>
                <FieldErrorText id="password-error" message={fieldErrors.password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-12 rounded-xl h-12 bg-secondary border-0"
                    aria-invalid={!!fieldErrors.confirmPassword}
                    aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                    required
                  />
                </div>
                <FieldErrorText id="confirmPassword-error" message={fieldErrors.confirmPassword} />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full h-12 text-base"
                disabled={!canSubmit}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
