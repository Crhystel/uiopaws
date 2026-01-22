import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar } from 'lucide-react';
import { Animal } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { resolveAnimalPhotoUrl } from '@/lib/media';

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard = ({ animal }: AnimalCardProps) => {
  const photoUrl = resolveAnimalPhotoUrl(animal.photos?.[0], '/placeholder.svg');

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

  return (
    <Link to={`/animals/${animal.id_animal}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-shadow duration-300"
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={photoUrl}
            alt={animal.animal_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
          
          {/* Favorite Button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to favorites
            }}
          >
            <Heart className="w-5 h-5 text-primary" />
          </button>

          {/* Status Badge */}
          <Badge className="absolute bottom-4 left-4 bg-primary text-primary-foreground rounded-full px-3">
            {getStatusLabel(animal.status)}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">{animal.animal_name}</h3>
              <p className="text-sm text-muted-foreground">
                {animal.breed?.breed_name || 'Raza Mixta'}
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              {getSexLabel(animal.sex)}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{animal.age} {animal.age === 1 ? 'año' : 'años'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{animal.shelter?.shelter_name || 'Refugio'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline" className="rounded-full text-xs">
              {getSizeLabel(animal.size)}
            </Badge>
            <Badge variant="outline" className="rounded-full text-xs">
              {animal.color}
            </Badge>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default AnimalCard;
