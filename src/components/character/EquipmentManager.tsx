import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type Item } from '@/data/items';
import { type Character } from '@/data/characters';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Shield, Sword, CircleDot as Ring, Gem as Amulet, Footprints as Boot, Shirt } from 'lucide-react';

const ItemTypes = {
  EQUIPMENT: 'equipment',
};

interface DraggableItemProps {
  item: Item;
  onDrop: (item: Item, slot: string) => void;
}

const DraggableItem = ({ item }: { item: Item }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EQUIPMENT,
    item: { id: item.id, item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="p-2 border rounded-md bg-muted cursor-pointer flex items-center gap-2"
    >
      {item.name}
    </div>
  );
};

interface DropSlotProps {
    slot: string;
    equippedItem: Item | null;
    onDrop: (item: Item) => void;
    onUnequip: (slot: string) => void;
    children: React.ReactNode;
}

const DropSlot = ({ slot, equippedItem, onDrop, onUnequip, children }: DropSlotProps) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemTypes.EQUIPMENT,
      drop: (dragged: { id: string; item: Item }) => onDrop(dragged.item),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    return (
      <div ref={drop} className={`p-4 border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center relative ${isOver ? 'border-primary' : ''}`}>
        {children}
        {equippedItem ? (
          <div className="mt-2 p-1 bg-primary/10 rounded-md text-center text-xs w-full">
            <p className='truncate'>{equippedItem.name}</p>
            <Button variant="link" size="sm" className="text-red-500 h-auto p-0" onClick={() => onUnequip(slot)}>
              Unequip
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">Empty</p>
        )}
      </div>
    );
  };

interface EquipmentManagerProps {
  character: Character;
  inventory: Item[];
  onUpdateEquipment: (equipment: { [key: string]: Item | null }) => void;
}

export const EquipmentManager = ({ character, inventory, onUpdateEquipment }: EquipmentManagerProps) => {
  const [equipped, setEquipped] = useState(character.equipmentV2 || {});

  const handleEquip = (item: Item, slot: string) => {
    // Basic slot validation
    const itemType = item.type === 'armor' || item.type === 'shield' ? item.type : 'accessory';
    const validSlots: {[key: string]: string[]} = {
        'armor': ['armor'],
        'shield': ['offHand'],
        'weapon': ['mainHand', 'offHand'],
        'accessory': ['ring1', 'ring2', 'amulet', 'boots', 'cloak']
    }

    if(!validSlots[item.type as string]?.includes(slot)){
        // Maybe show a toast here
        return;
    }

    setEquipped(prev => {
      const newEquipped = { ...prev };
      // Move previously equipped item back to inventory (logic to be handled by parent)
      newEquipped[slot] = item;
      onUpdateEquipment(newEquipped);
      return newEquipped;
    });
  };

  const handleUnequip = (slot: string) => {
    setEquipped(prev => {
      const newEquipped = { ...prev };
      delete newEquipped[slot];
      onUpdateEquipment(newEquipped);
      return newEquipped;
    });
  };

  const unequippedInventory = inventory.filter(
    (item) => !Object.values(equipped).some((equippedItem: Item | null) => equippedItem?.id === item.id)
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment Slots */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Equipment Slots</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <DropSlot slot="mainHand" equippedItem={equipped.mainHand || null} onDrop={(item) => handleEquip(item, 'mainHand')} onUnequip={handleUnequip}>
                <Sword className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">Main Hand</p>
            </DropSlot>
            <DropSlot slot="offHand" equippedItem={equipped.offHand || null} onDrop={(item) => handleEquip(item, 'offHand')} onUnequip={handleUnequip}>
                <Shield className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">Off-Hand</p>
            </DropSlot>
            <DropSlot slot="armor" equippedItem={equipped.armor || null} onDrop={(item) => handleEquip(item, 'armor')} onUnequip={handleUnequip}>
                <Shirt className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">Armor</p>
            </DropSlot>
            <DropSlot slot="amulet" equippedItem={equipped.amulet || null} onDrop={(item) => handleEquip(item, 'amulet')} onUnequip={handleUnequip}>
                <Amulet className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">Amulet</p>
            </DropSlot>
            <DropSlot slot="ring1" equippedItem={equipped.ring1 || null} onDrop={(item) => handleEquip(item, 'ring1')} onUnequip={handleUnequip}>
                <Ring className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">Ring 1</p>
            </DropSlot>
            <DropSlot slot="ring2" equippedItem={equipped.ring2 || null} onDrop={(item) => handleEquip(item, 'ring2')} onUnequip={handleUnequip}>
                <Ring className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">Ring 2</p>
            </DropSlot>
             <DropSlot slot="boots" equippedItem={equipped.boots || null} onDrop={(item) => handleEquip(item, 'boots')} onUnequip={handleUnequip}>
                <Boot className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">Boots</p>
            </DropSlot>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-96 overflow-y-auto">
            {unequippedInventory.map(item => (
              <DraggableItem key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
};
