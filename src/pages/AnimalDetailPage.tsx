import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Calendar,
  Loader2,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Stethoscope,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { publicAnimalsApi, Animal } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const AnimalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    const fetchAnimal = async () => {
      if (!id) return;
      try {
        const data = await publicAnimalsApi.getById(parseInt(id));
        setAnimal(data);
      } catch (error) {
        console.error('Error fetching animal:', error);
        navigate('/animals');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimal();
  }, [id, navigate]);

  const handleAdoptClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/animals/${id}` } });
    } else {
      navigate('/adopt/coming-soon');
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'Small': return 'Pequeño';
      case 'Medium': return 'Mediano';
      case 'Large': return 'Grande';
      default: return size;
    }
  };

  const getSexLabel = (sex: string) => {
    switch (sex) {
      case 'Male': return 'Macho';
      case 'Female': return 'Hembra';
      default: return sex;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Available': return 'Disponible';
      case 'Adopted': return 'Adoptado';
      case 'Pending': return 'Pendiente';
      default: return status;
    }
  };

  const formatShelterAddress = (address: any) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    return [address.street, address.city, address.country, address.postal_code].filter(Boolean).join(', ');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!animal) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Mascota no encontrada</p>
        </div>
      </Layout>
    );
  }

  const photos = animal.photos?.length ? animal.photos : [{ photo_url: '/placeholder.svg', id_photo: 0 }];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/animals" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver a todas las mascotas
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Photo Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-card aspect-square">
              <img
                src={photos[selectedPhoto]?.photo_url || '/placeholder.svg'}
                alt={animal.animal_name}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full px-4">
                {getStatusLabel(animal.status)}
              </Badge>
            </div>

            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id_photo}
                    onClick={() => setSelectedPhoto(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                      selectedPhoto === index
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.photo_url}
                      alt={`${animal.animal_name} foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {animal.animal_name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {animal.breed?.breed_name || 'Raza Mixta'} • {animal.species?.species_name || 'Desconocido'}
              </p>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm">
                {getSexLabel(animal.sex)}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm">
                {animal.age} {animal.age === 1 ? 'año' : 'años'}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm">
                {getSizeLabel(animal.size)}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm">
                {animal.color}
              </Badge>
            </div>

            {/* Sterilization */}
            <div className="flex items-center gap-2 text-sm">
              {animal.is_sterilized ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-foreground">Esterilizado/a</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">No esterilizado/a</span>
                </>
              )}
            </div>

            {/* Description */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Sobre {animal.animal_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {animal.description || 'No hay descripción disponible.'}
                </p>
              </CardContent>
            </Card>

            {/* Shelter Info */}
            {animal.shelter && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Información del Refugio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-medium text-foreground">{animal.shelter.shelter_name}</p>
                  <p className="text-sm text-muted-foreground">{formatShelterAddress(animal.shelter.address)}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <a
                      href={`tel:${animal.shelter.phone}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {animal.shelter.phone}
                    </a>
                    <a
                      href={`mailto:${animal.shelter.email}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {animal.shelter.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medical Records */}
            {animal.medical_records && animal.medical_records.length > 0 && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    Historial Médico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {animal.medical_records.map((record) => (
                    <div key={record.id_medical_record} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.record_date).toLocaleDateString('es-ES')}
                      </div>
                      <p className="text-foreground">{record.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Por: {record.veterinarian}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Adopt Button */}
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1 rounded-full h-14 text-base gap-2"
                onClick={handleAdoptClick}
              >
                <Heart className="w-5 h-5" />
                Adoptar a {animal.animal_name}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-14 w-14"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AnimalDetailPage;
