// useTimelineTrips.ts - Combines realtime + webhook trips and adds simulated entries with type-safe filtering

import { useEffect, useState } from 'react';
import { useRealtimeTrips } from '../hooks/useRealtimeTrips';
import { Trip as RealtimeTrip } from '../hooks/useRealtimeTrips';
import { startOfWeek, addHours, isSameWeek } from 'date-fns';

interface TimelineTrip {
  id: string;
  group: string;
  title: string;
  start_time: number;
  end_time: number;
  background?: string;
  color?: string;
  status?: string;
  driver?: string;
  origin?: string;
  destination?: string;
}

interface VehicleGroup {
  id: string;
  title: string;
}

const COLOR_MAP: Record<string, string> = {
  active: '#a5b4fc',
  in_progress: '#a5b4fc',
  completed: '#6ee7b7',
  invoiced: '#fcd34d',
  paid: '#c4b5fd',
  delayed: '#fda4af',
  cancelled: '#fca5a5',
  simulated: '#e5e7eb',
};

// Type guard to ensure data matches Trip interface
function isValidTrip(trip: any): trip is RealtimeTrip {
  return (
    trip &&
    typeof trip.id === 'string' &&
    typeof trip.tripNumber === 'string' &&
    typeof trip.startDate === 'string' &&
    typeof trip.endDate === 'string' &&
    typeof trip.driver === 'string' &&
    typeof trip.vehicle === 'string' &&
    typeof trip.status === 'string'
  );
}

export function useTimelineTrips(webhookTrips: unknown[] = []) {
  const { trips: fetchedTrips } = useRealtimeTrips({ status: 'active' });
  const [items, setItems] = useState<TimelineTrip[]>([]);
  const [groups, setGroups] = useState<VehicleGroup[]>([]);

  useEffect(() => {
    const safeFetched: RealtimeTrip[] = (fetchedTrips ?? []).filter(isValidTrip);
    const safeWebhooks: RealtimeTrip[] = (webhookTrips ?? []).filter(isValidTrip);
    const allTrips: RealtimeTrip[] = [...safeFetched, ...safeWebhooks];

    const vehicleSet: Set<string> = new Set();
    const fleetMap: Record<string, boolean> = {};
    const timelineTrips: TimelineTrip[] = [];

    const now = new Date();
    const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });

    for (const trip of allTrips) {
      const vehicleId = trip.vehicle || 'unknown';
      vehicleSet.add(vehicleId);

      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      if (isSameWeek(start, now, { weekStartsOn: 1 })) fleetMap[vehicleId] = true;

      timelineTrips.push({
        id: trip.id,
        group: vehicleId,
        title: `${trip.tripNumber} (${trip.origin} → ${trip.destination})`,
        start_time: start.getTime(),
        end_time: end.getTime(),
        background: COLOR_MAP[trip.status] || '#dbeafe',
        color: COLOR_MAP[trip.status] || '#93c5fd',
        status: trip.status,
        origin: trip.origin,
        destination: trip.destination,
        driver: trip.driver,
      });
    }

    for (const vehicleId of vehicleSet) {
      if (!fleetMap[vehicleId]) {
        timelineTrips.push({
          id: `sim-${vehicleId}`,
          group: vehicleId,
          title: 'Simulated Trip',
          start_time: startOfThisWeek.getTime(),
          end_time: addHours(startOfThisWeek, 8).getTime(),
          background: COLOR_MAP.simulated,
          color: COLOR_MAP.simulated,
          status: 'simulated',
        });
      }
    }

    const groupArr: VehicleGroup[] = Array.from(vehicleSet).map((v) => ({
      id: v,
      title: v,
    }));

    setItems(timelineTrips);
    setGroups(groupArr);
  }, [fetchedTrips, webhookTrips]);

  return { items, groups };
}
