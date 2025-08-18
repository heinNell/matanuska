import { useEffect } from 'react';
import { fetchWialonUnits } from '@/api/wialonApi';
import type { WialonUnitBrief } from '@/types/wialon';

// Add type imports if needed
// import type { WialonUnit } from '@/types/wialon';

export const useWialonVehicles = () => {
  // Return vehicle tracking related functionality
  return {
    updateLocation: {
  mutate: (_data: {
        id: string;
        location: { lat: number; lng: number };
        heading: number;
        speed: number;
      }) => {
        // Implement location update logic
      }
    }
  };
};

export const useWialonIntegration = () => {
  const { updateLocation } = useWialonVehicles();

  useEffect(() => {
    const interval = setInterval(async () => {
      const wialonData: WialonUnitBrief[] = await fetchWialonUnits();
      for (const unit of wialonData) {
        if (typeof unit.lat !== 'number' || typeof unit.lng !== 'number') continue;
        updateLocation.mutate({
          id: String(unit.id),
          location: { lat: unit.lat, lng: unit.lng },
          heading: unit.course ?? 0,
          speed: unit.speed ?? 0,
        });
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, []);
};
