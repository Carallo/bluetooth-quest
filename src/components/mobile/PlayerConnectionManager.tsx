import { useState } from 'react';
import { useBluetooth } from '@/hooks/useBluetooth';
import { BluetoothManager } from './BluetoothManager';
import { CombatInterface } from '@/components/combat/CombatInterface';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useOfflineData } from '@/hooks/useOfflineData';

interface PlayerConnectionManagerProps {
  onBack: () => void;
}

export const PlayerConnectionManager = ({ onBack }: PlayerConnectionManagerProps) => {
  const { connectedDevice } = useBluetooth();
  const { data } = useOfflineData();

  if (connectedDevice) {
    return (
      <CombatInterface
        characters={data.characters}
        monsters={[]}
        onBack={onBack}
        isNarratorMode={false}
        connectedDeviceId={connectedDevice.id}
      />
    );
  }

  return (
    <div className="p-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver
      </Button>
      <Card>
        <CardContent className="p-6">
          <BluetoothManager />
        </CardContent>
      </Card>
    </div>
  );
};
