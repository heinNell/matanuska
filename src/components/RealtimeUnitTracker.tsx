import { FC, useEffect } from 'react';
import wialonService from '../services/wialonService';

interface RealtimeUnitTrackerProps {
  unitId: number | null;
  map: L.Map | null;
}

const RealtimeUnitTracker: FC<RealtimeUnitTrackerProps> = ({ unitId, map }) => {
  useEffect(() => {
    if (!unitId || !map) return;

    let cleanup: (() => void) | undefined;

    wialonService.getUnitById(unitId).then((unit) => {
      if (!unit) {
        console.error(`Unit with ID ${unitId} not found.`);
        return;
      }

      const onPositionChange = (pos: any) => {
        const newLatLng = [pos.y, pos.x];
        map.panTo(newLatLng as L.LatLngExpression, { animate: true, duration: 0.5 });
      };

      // addPositionListener returns a cleanup function, not an ID
      cleanup = wialonService.addPositionListener(unit.getId(), onPositionChange);
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [unitId, map]);

  return null;
};

export default RealtimeUnitTracker;
