import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { publicCatalogsApi, Species, Breed, Shelter } from '@/lib/api';

interface FiltersState {
  animal_name: string;
  id_species: string;
  id_breed: string;
  id_shelter: string;
  size: string;
}

interface AnimalFiltersProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
}

const AnimalFilters = ({ filters, onFiltersChange }: AnimalFiltersProps) => {
  const [species, setSpecies] = useState<Species[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<Breed[]>([]);

  useEffect(() => {
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
        setFilteredBreeds(breedsData);
      } catch (error) {
        console.error('Error fetching catalogs:', error);
      }
    };
    fetchCatalogs();
  }, []);

  useEffect(() => {
    if (filters.id_species) {
      const filtered = breeds.filter(
        (breed) => breed.id_species === parseInt(filters.id_species)
      );
      setFilteredBreeds(filtered);
    } else {
      setFilteredBreeds(breeds);
    }
  }, [filters.id_species, breeds]);

  const handleChange = (key: keyof FiltersState, value: string) => {
    // Normalización: en el estado guardamos "" para representar "Todos".
    const normalizedValue = value === 'all' ? '' : value;
    const newFilters = { ...filters, [key]: normalizedValue };
    if (key === 'id_species') {
      newFilters.id_breed = '';
    }
    onFiltersChange(newFilters);
  };

  const sizes = [
    // La API valida estos valores en español.
    { value: 'Pequeño', label: 'Pequeño' },
    { value: 'Mediano', label: 'Mediano' },
    { value: 'Grande', label: 'Grande' },
  ];

  return (
    <div className="bg-card rounded-3xl p-6 shadow-card space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre..."
          value={filters.animal_name}
          onChange={(e) => handleChange('animal_name', e.target.value)}
          className="pl-12 rounded-full bg-secondary border-0 h-12"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Species */}
        <Select
          value={filters.id_species || 'all'}
          onValueChange={(value) => handleChange('id_species', value)}
        >
          <SelectTrigger className="rounded-full bg-secondary border-0 h-12">
            <SelectValue placeholder="Todas las Especies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Especies</SelectItem>
            {species.map((s) => (
              <SelectItem key={s.id_species} value={s.id_species.toString()}>
                {s.species_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Breed */}
        <Select
          value={filters.id_breed || 'all'}
          onValueChange={(value) => handleChange('id_breed', value)}
        >
          <SelectTrigger className="rounded-full bg-secondary border-0 h-12">
            <SelectValue placeholder="Todas las Razas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Razas</SelectItem>
            {filteredBreeds.map((b) => (
              <SelectItem key={b.id_breed} value={b.id_breed.toString()}>
                {b.breed_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Size */}
        <Select
          value={filters.size || 'all'}
          onValueChange={(value) => handleChange('size', value)}
        >
          <SelectTrigger className="rounded-full bg-secondary border-0 h-12">
            <SelectValue placeholder="Todos los Tamaños" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Tamaños</SelectItem>
            {sizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Shelter */}
        <Select
          value={filters.id_shelter || 'all'}
          onValueChange={(value) => handleChange('id_shelter', value)}
        >
          <SelectTrigger className="rounded-full bg-secondary border-0 h-12">
            <SelectValue placeholder="Todos los Refugios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Refugios</SelectItem>
            {shelters.map((s) => (
              <SelectItem key={s.id_shelter} value={s.id_shelter.toString()}>
                {s.shelter_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AnimalFilters;
