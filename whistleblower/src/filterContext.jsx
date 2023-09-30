import { createContext } from 'react';

export const FilterContext = createContext({
    uniqueAnimals: {},
    setUniqueAnimals: () => {},
    filters: {},
    setFilters: () => {},
    currentAnimal: "",
    setCurrentAnimal: () => {},
});