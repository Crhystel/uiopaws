import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FloatingPaws, BlobShape } from '@/components/ui/decorative-shapes';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If the user is already logged in and lands on /login, send them to /dashboard.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: '¡Bienvenido de nuevo!',
        description: 'Has iniciado sesión correctamente.',
      });

      // Always go through the role-based redirect entry point after login.
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast({
        title: 'Error al iniciar sesión',
        description: error.response?.data?.message || 'Credenciales inválidas',
        variant: 'destructive',
      });
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
              <h1 className="text-2xl font-bold text-foreground mb-2">¡Bienvenido de Nuevo!</h1>
              <p className="text-muted-foreground">Inicia sesión para continuar tu viaje de adopción</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 rounded-xl h-12 bg-secondary border-0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 rounded-xl h-12 bg-secondary border-0"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Regístrate
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

export default LoginPage;
