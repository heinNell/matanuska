import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';

// Define interface types for our reference data
interface TyreBrand {
  id: string;
  name: string;
  createdAt: string;
}

interface TyreSize {
  id: string;
  size: string;
  createdAt: string;
}

interface TyrePattern {
  id: string;
  brand: string;
  pattern: string;
  size: string;
  position: string;
  createdAt: string;
}

interface Position {
  id: string;
  name: string;
}

interface VehiclePosition {
  id: string;
  vehicleType: string;
  name: string;
  positions: Position[];
  createdAt: string;
}

// Context interface
interface TyreReferenceDataContextType {
  // Data states
  brands: TyreBrand[];
  sizes: TyreSize[];
  patterns: TyrePattern[];
  vehiclePositions: VehiclePosition[];
  loading: {
    brands: boolean;
    sizes: boolean;
    patterns: boolean;
    vehiclePositions: boolean;
  };
  error: Error | null;
  
  // CRUD operations
  // Brands
  addBrand: (name: string) => Promise<string>;
  updateBrand: (id: string, name: string) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  
  // Sizes
  addSize: (size: string) => Promise<string>;
  updateSize: (id: string, size: string) => Promise<void>;
  deleteSize: (id: string) => Promise<void>;
  
  // Patterns
  addPattern: (pattern: Omit<TyrePattern, 'id' | 'createdAt'>) => Promise<string>;
  updatePattern: (id: string, pattern: Partial<Omit<TyrePattern, 'id' | 'createdAt'>>) => Promise<void>;
  deletePattern: (id: string) => Promise<void>;
  
  // Vehicle Positions
  addVehiclePosition: (vehiclePosition: Omit<VehiclePosition, 'id' | 'createdAt'>) => Promise<string>;
  updateVehiclePosition: (id: string, data: Partial<Omit<VehiclePosition, 'id' | 'createdAt'>>) => Promise<void>;
  deleteVehiclePosition: (id: string) => Promise<void>;
  
  // Utility functions
  getPositionsForVehicleType: (vehicleType: string) => Position[];
  getPatternsForBrand: (brand: string) => TyrePattern[];
  getPatternsForSize: (size: string) => TyrePattern[];
  refreshData: () => Promise<void>;
}

// Create the context
const TyreReferenceDataContext = createContext<TyreReferenceDataContextType | undefined>(undefined);

// Provider component
export const TyreReferenceDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for storing reference data
  const [brands, setBrands] = useState<TyreBrand[]>([]);
  const [sizes, setSizes] = useState<TyreSize[]>([]);
  const [patterns, setPatterns] = useState<TyrePattern[]>([]);
  const [vehiclePositions, setVehiclePositions] = useState<VehiclePosition[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    brands: true,
    sizes: true,
    patterns: true,
    vehiclePositions: true
  });
  
  // Error state
  const [error, setError] = useState<Error | null>(null);
  
  // Reference to Firestore
  const db = getFirestore();
  
  // Fetch all reference data on mount
  useEffect(() => {
    fetchAllReferenceData();
  }, []);
  
  // Fetch all reference data
  const fetchAllReferenceData = async () => {
    try {
      await Promise.all([
        fetchBrands(),
        fetchSizes(),
        fetchPatterns(),
        fetchVehiclePositions()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error fetching reference data'));
    }
  };
  
  // Fetch brands
  const fetchBrands = async () => {
    setLoading(prev => ({ ...prev, brands: true }));
    try {
      const q = query(collection(db, 'tyreBrands'));
      const querySnapshot = await getDocs(q);
      
      const brandsData: TyreBrand[] = [];
      querySnapshot.forEach(doc => {
        brandsData.push({
          id: doc.id,
          name: doc.data().name,
          createdAt: doc.data().createdAt
        });
      });
      
      setBrands(brandsData.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(prev => ({ ...prev, brands: false }));
    } catch (err) {
      console.error('Error fetching tyre brands:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching brands'));
      setLoading(prev => ({ ...prev, brands: false }));
    }
  };
  
  // Fetch sizes
  const fetchSizes = async () => {
    setLoading(prev => ({ ...prev, sizes: true }));
    try {
      const q = query(collection(db, 'tyreSizes'));
      const querySnapshot = await getDocs(q);
      
      const sizesData: TyreSize[] = [];
      querySnapshot.forEach(doc => {
        sizesData.push({
          id: doc.id,
          size: doc.data().size,
          createdAt: doc.data().createdAt
        });
      });
      
      setSizes(sizesData.sort((a, b) => a.size.localeCompare(b.size)));
      setLoading(prev => ({ ...prev, sizes: false }));
    } catch (err) {
      console.error('Error fetching tyre sizes:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching sizes'));
      setLoading(prev => ({ ...prev, sizes: false }));
    }
  };
  
  // Fetch patterns
  const fetchPatterns = async () => {
    setLoading(prev => ({ ...prev, patterns: true }));
    try {
      const q = query(collection(db, 'tyrePatterns'));
      const querySnapshot = await getDocs(q);
      
      const patternsData: TyrePattern[] = [];
      querySnapshot.forEach(doc => {
        patternsData.push({
          id: doc.id,
          brand: doc.data().brand,
          pattern: doc.data().pattern,
          size: doc.data().size,
          position: doc.data().position,
          createdAt: doc.data().createdAt
        });
      });
      
      setPatterns(patternsData.sort((a, b) => {
        // Sort by brand first, then by pattern
        if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
        return a.pattern.localeCompare(b.pattern);
      }));
      setLoading(prev => ({ ...prev, patterns: false }));
    } catch (err) {
      console.error('Error fetching tyre patterns:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching patterns'));
      setLoading(prev => ({ ...prev, patterns: false }));
    }
  };
  
  // Fetch vehicle positions
  const fetchVehiclePositions = async () => {
    setLoading(prev => ({ ...prev, vehiclePositions: true }));
    try {
      const q = query(collection(db, 'vehiclePositions'));
      const querySnapshot = await getDocs(q);
      
      const positionsData: VehiclePosition[] = [];
      querySnapshot.forEach(doc => {
        positionsData.push({
          id: doc.id,
          vehicleType: doc.data().vehicleType,
          name: doc.data().name,
          positions: doc.data().positions || [],
          createdAt: doc.data().createdAt
        });
      });
      
      setVehiclePositions(positionsData);
      setLoading(prev => ({ ...prev, vehiclePositions: false }));
    } catch (err) {
      console.error('Error fetching vehicle positions:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching vehicle positions'));
      setLoading(prev => ({ ...prev, vehiclePositions: false }));
    }
  };
  
  // Refresh all data
  const refreshData = async () => {
    try {
      await fetchAllReferenceData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error refreshing data'));
    }
  };
  
  // CRUD operations for brands
  const addBrand = async (name: string): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'tyreBrands'), {
        name,
        createdAt: new Date().toISOString()
      });
      
      // Update local state
      setBrands(prev => [...prev, {
        id: docRef.id,
        name,
        createdAt: new Date().toISOString()
      }].sort((a, b) => a.name.localeCompare(b.name)));
      
      return docRef.id;
    } catch (err) {
      console.error('Error adding brand:', err);
      setError(err instanceof Error ? err : new Error('Unknown error adding brand'));
      throw err;
    }
  };
  
  const updateBrand = async (id: string, name: string): Promise<void> => {
    try {
      const brandRef = doc(db, 'tyreBrands', id);
      await updateDoc(brandRef, { name });
      
      // Update local state
      setBrands(prev => 
        prev.map(brand => 
          brand.id === id ? { ...brand, name } : brand
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      console.error('Error updating brand:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating brand'));
      throw err;
    }
  };
  
  const deleteBrand = async (id: string): Promise<void> => {
    try {
      const brandRef = doc(db, 'tyreBrands', id);
      await deleteDoc(brandRef);
      
      // Update local state
      setBrands(prev => prev.filter(brand => brand.id !== id));
      
      // Also consider deleting related patterns (or update to show that this brand is no longer available)
    } catch (err) {
      console.error('Error deleting brand:', err);
      setError(err instanceof Error ? err : new Error('Unknown error deleting brand'));
      throw err;
    }
  };
  
  // CRUD operations for sizes
  const addSize = async (size: string): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'tyreSizes'), {
        size,
        createdAt: new Date().toISOString()
      });
      
      // Update local state
      setSizes(prev => [...prev, {
        id: docRef.id,
        size,
        createdAt: new Date().toISOString()
      }].sort((a, b) => a.size.localeCompare(b.size)));
      
      return docRef.id;
    } catch (err) {
      console.error('Error adding size:', err);
      setError(err instanceof Error ? err : new Error('Unknown error adding size'));
      throw err;
    }
  };
  
  const updateSize = async (id: string, size: string): Promise<void> => {
    try {
      const sizeRef = doc(db, 'tyreSizes', id);
      await updateDoc(sizeRef, { size });
      
      // Update local state
      setSizes(prev => 
        prev.map(s => 
          s.id === id ? { ...s, size } : s
        ).sort((a, b) => a.size.localeCompare(b.size))
      );
    } catch (err) {
      console.error('Error updating size:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating size'));
      throw err;
    }
  };
  
  const deleteSize = async (id: string): Promise<void> => {
    try {
      const sizeRef = doc(db, 'tyreSizes', id);
      await deleteDoc(sizeRef);
      
      // Update local state
      setSizes(prev => prev.filter(size => size.id !== id));
    } catch (err) {
      console.error('Error deleting size:', err);
      setError(err instanceof Error ? err : new Error('Unknown error deleting size'));
      throw err;
    }
  };
  
  // CRUD operations for patterns
  const addPattern = async (pattern: Omit<TyrePattern, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'tyrePatterns'), {
        ...pattern,
        createdAt: new Date().toISOString()
      });
      
      // Update local state
      setPatterns(prev => [...prev, {
        id: docRef.id,
        ...pattern,
        createdAt: new Date().toISOString()
      }].sort((a, b) => {
        if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
        return a.pattern.localeCompare(b.pattern);
      }));
      
      return docRef.id;
    } catch (err) {
      console.error('Error adding pattern:', err);
      setError(err instanceof Error ? err : new Error('Unknown error adding pattern'));
      throw err;
    }
  };
  
  const updatePattern = async (id: string, patternData: Partial<Omit<TyrePattern, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      const patternRef = doc(db, 'tyrePatterns', id);
      await updateDoc(patternRef, patternData);
      
      // Update local state
      setPatterns(prev => 
        prev.map(pattern => 
          pattern.id === id ? { ...pattern, ...patternData } : pattern
        ).sort((a, b) => {
          if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
          return a.pattern.localeCompare(b.pattern);
        })
      );
    } catch (err) {
      console.error('Error updating pattern:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating pattern'));
      throw err;
    }
  };
  
  const deletePattern = async (id: string): Promise<void> => {
    try {
      const patternRef = doc(db, 'tyrePatterns', id);
      await deleteDoc(patternRef);
      
      // Update local state
      setPatterns(prev => prev.filter(pattern => pattern.id !== id));
    } catch (err) {
      console.error('Error deleting pattern:', err);
      setError(err instanceof Error ? err : new Error('Unknown error deleting pattern'));
      throw err;
    }
  };
  
  // CRUD operations for vehicle positions
  const addVehiclePosition = async (vehiclePosition: Omit<VehiclePosition, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'vehiclePositions'), {
        ...vehiclePosition,
        createdAt: new Date().toISOString()
      });
      
      // Update local state
      setVehiclePositions(prev => [...prev, {
        id: docRef.id,
        ...vehiclePosition,
        createdAt: new Date().toISOString()
      }]);
      
      return docRef.id;
    } catch (err) {
      console.error('Error adding vehicle position:', err);
      setError(err instanceof Error ? err : new Error('Unknown error adding vehicle position'));
      throw err;
    }
  };
  
  const updateVehiclePosition = async (id: string, data: Partial<Omit<VehiclePosition, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      const positionRef = doc(db, 'vehiclePositions', id);
      await updateDoc(positionRef, data);
      
      // Update local state
      setVehiclePositions(prev => 
        prev.map(position => 
          position.id === id ? { ...position, ...data } : position
        )
      );
    } catch (err) {
      console.error('Error updating vehicle position:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating vehicle position'));
      throw err;
    }
  };
  
  const deleteVehiclePosition = async (id: string): Promise<void> => {
    try {
      const positionRef = doc(db, 'vehiclePositions', id);
      await deleteDoc(positionRef);
      
      // Update local state
      setVehiclePositions(prev => prev.filter(position => position.id !== id));
    } catch (err) {
      console.error('Error deleting vehicle position:', err);
      setError(err instanceof Error ? err : new Error('Unknown error deleting vehicle position'));
      throw err;
    }
  };
  
  // Utility functions
  const getPositionsForVehicleType = (vehicleType: string): Position[] => {
    const vehiclePosition = vehiclePositions.find(vp => vp.vehicleType === vehicleType);
    return vehiclePosition?.positions || [];
  };
  
  const getPatternsForBrand = (brand: string): TyrePattern[] => {
    return patterns.filter(p => p.brand === brand);
  };
  
  const getPatternsForSize = (size: string): TyrePattern[] => {
    return patterns.filter(p => p.size === size);
  };
  
  // Context value
  const value: TyreReferenceDataContextType = {
    // Data
    brands,
    sizes,
    patterns,
    vehiclePositions,
    loading,
    error,
    
    // CRUD operations
    // Brands
    addBrand,
    updateBrand,
    deleteBrand,
    
    // Sizes
    addSize,
    updateSize,
    deleteSize,
    
    // Patterns
    addPattern,
    updatePattern,
    deletePattern,
    
    // Vehicle Positions
    addVehiclePosition,
    updateVehiclePosition,
    deleteVehiclePosition,
    
    // Utility functions
    getPositionsForVehicleType,
    getPatternsForBrand,
    getPatternsForSize,
    refreshData
  };
  
  return (
    <TyreReferenceDataContext.Provider value={value}>
      {children}
    </TyreReferenceDataContext.Provider>
  );
};

// Custom hook to use the context
export function useTyreReferenceData(): TyreReferenceDataContextType {
  const context = useContext(TyreReferenceDataContext);
  if (!context) {
    throw new Error('useTyreReferenceData must be used within a TyreReferenceDataProvider');
  }
  return context;
}
