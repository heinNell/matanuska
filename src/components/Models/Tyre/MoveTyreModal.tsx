import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select, Input } from '@/components/ui/FormElements';
import type { StockEntry, TyreStore } from '@/types/tyre';
import { useTyreStores } from '@/context/TyreStoresContext';

interface MoveTyreModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromStoreId: string;
  entry: StockEntry | null;
}

export const MoveTyreModal: React.FC<MoveTyreModalProps> = ({ isOpen, onClose, fromStoreId, entry }) => {
  const { stores, moveEntry } = useTyreStores();
  const [toStoreId, setToStoreId] = useState<string>('');
  const [odometer, setOdometer] = useState<number>(entry?.currentOdometer || 0);

  const handleSubmit = async () => {
    if (!entry || !toStoreId) return;
    // Clone entry
    const updated: StockEntry = { ...entry };
    const prevOdo = updated.currentOdometer;
    const odo = odometer;
    const kmDiff = odo - (updated.lastMountOdometer || prevOdo);
    updated.lastMountOdometer = prevOdo;
    updated.currentOdometer = odo;
    updated.kmCovered = (updated.kmCovered || 0) + (kmDiff > 0 ? kmDiff : 0);
    updated.status = toStoreId === 'VehicleTyreStore' ? 'active'
      : toStoreId === 'HoldingBay' ? 'holding'
      : toStoreId === 'ToBeRetreaded' ? 'retread'
      : 'scrapped';
    // Append history
    updated.history = [
      ...updated.history,
      {
        event: 'moved',
        fromStore: fromStoreId,
        toStore: toStoreId,
        vehicleReg: updated.vehicleReg,
        position: updated.position,
        odometer: odo,
        date: new Date().toISOString(),
        user: 'system'
      }
    ];
    try {
      await moveEntry(fromStoreId, toStoreId, updated);
      onClose();
    } catch (err) {
      console.error('Move tyre failed', err);
    }
  };

  const storeOptions = stores.map((s: TyreStore) => ({ label: s.name, value: s.id }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Move Tyre ${entry?.tyreId}`} maxWidth="sm">
      <div className="space-y-4">
        <Select
          label="From Store"
          value={fromStoreId}
          onChange={() => {}}
          options={storeOptions}
          disabled
        />
        <Select
          label="To Store"
          value={toStoreId}
          onChange={(e) => setToStoreId(e.target.value)}
          options={[{ label: 'Select store...', value: '' }, ...storeOptions.filter(o => o.value !== fromStoreId)]}
        />
        <Input
          label="Odometer (km)"
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(Number(e.target.value))}
        />
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!toStoreId}>Move</Button>
        </div>
      </div>
    </Modal>
  );
};

export default MoveTyreModal;
