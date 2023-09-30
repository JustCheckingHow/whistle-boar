import { createContext } from 'react';

export const FilterContext = createContext({
    uniqueAnimals: {},
    setUniqueAnimals: () => {},
    filter: {},
    setFilter: () => {},
    currentAnimal: "",
    setCurrentAnimal: () => {},
});