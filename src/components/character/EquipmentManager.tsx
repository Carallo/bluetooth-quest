import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Item } from '@/data/items';
import { type Character } from '@/data/characters';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Shield, Sword, CircleDot as Ring, Gem as Amulet, Footprints as Boot, Shirt, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ItemTypes = {
  EQUIPMENT: 'equipment',
};

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
      {item.requiresAttunement && <Sparkles className="w-4 h-4 text-purple-400" />}
    </div>
  );
};

interface DropSlotProps {
    slot: string;
    equippedItem: Item | null;
    isAttuned: boolean;
    onDrop: (item: Item) => void;
    onUnequip: (slot: string) => void;
    onAttune: (itemId: string) => void;
    children: React.ReactNode;
}

const DropSlot = ({ slot, equippedItem, isAttuned, onDrop, onUnequip, onAttune, children }: DropSlotProps) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemTypes.EQUIPMENT,
      drop: (dragged: { id: string; item: Item }) => onDrop(dragged.item),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    const borderColor = isAttuned ? 'border-purple-400' : isOver ? 'border-primary' : '';

    return (
      <div ref={drop} className={`p-4 border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center relative transition-colors ${borderColor}`}>
        {children}
        {equippedItem ? (
          <div className="mt-2 p-1 bg-primary/10 rounded-md text-center text-xs w-full flex flex-col items-center gap-1">
            <p className='truncate font-semibold'>{equippedItem.name}</p>
            {equippedItem.requiresAttunement && (
                 <Button variant="link" size="sm" className={`h-auto p-0 ${isAttuned ? 'text-purple-500' : 'text-blue-500'}`} onClick={() => onAttune(equippedItem.id)}>
                    {isAttuned ? 'Unattune' : 'Attune'}
                 </Button>
            )}
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
  onUpdateCharacter: (character: Character) => void;
}

export const EquipmentManager = ({ character, inventory, onUpdateCharacter }: EquipmentManagerProps) => {
  const [equipped, setEquipped] = useState(character.equipmentV2 || {});
  const [attunedItems, setAttunedItems] = useState(character.attunedItems || []);

  useEffect(() => {
    setEquipped(character.equipmentV2 || {});
    setAttunedItems(character.attunedItems || []);
  }, [character]);

  const handleUpdate = (newEquipped: typeof equipped, newAttuned: typeof attunedItems) => {
    onUpdateCharacter({
      ...character,
      equipmentV2: newEquipped,
      attunedItems: newAttuned,
    });
  };

  const handleAttune = (itemId: string) => {
    setAttunedItems(prev => {
        const isCurrentlyAttuned = prev.includes(itemId);
        let newAttuned;
        if (isCurrentlyAttuned) {
            newAttuned = prev.filter(id => id !== itemId);
        } else {
            if (prev.length >= 3) {
                toast({ variant: 'destructive', title: "Attunement Limit Reached", description: "You can only attune to a maximum of 3 items." });
                return prev;
            }
            newAttuned = [...prev, itemId];
        }
        handleUpdate(equipped, newAttuned);
        return newAttuned;
    });
  }

  const handleEquip = (item: Item, slot: string) => {
    const validSlots: {[key: string]: string[]} = {
        'armor': ['armor'],
        'shield': ['offHand'],
        'weapon': ['mainHand', 'offHand'],
        'accessory': ['ring1', 'ring2', 'amulet', 'boots', 'cloak']
    }

    if(!validSlots[item.type as string]?.includes(slot)){
        toast({ variant: 'destructive', title: "Invalid Slot", description: `${item.name} cannot be equipped in this slot.` });
        return;
    }

    setEquipped(prev => {
      const newEquipped = { ...prev };
      // Move previously equipped item back to inventory (logic to be handled by parent component)
      newEquipped[slot] = item;
      handleUpdate(newEquipped, attunedItems);
      return newEquipped;
    });
  };

  const handleUnequip = (slot: string) => {
    const itemToUnequip = equipped[slot];
    if (!itemToUnequip) return;

    const newAttuned = attunedItems.filter(id => id !== itemToUnequip.id);

    setEquipped(prev => {
      const newEquipped = { ...prev };
      delete newEquipped[slot];
      handleUpdate(newEquipped, newAttuned);
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
            <div className="flex justify-between items-center">
              <CardTitle>Equipment Slots</CardTitle>
              <Badge variant={attunedItems.length >= 3 ? 'destructive' : 'secondary'}>
                Attuned: {attunedItems.length} / 3
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries({
                mainHand: <Sword className="w-8 h-8 text-muted-foreground" />,
                offHand: <Shield className="w-8 h-8 text-muted-foreground" />,
                armor: <Shirt className="w-8 h-8 text-muted-foreground" />,
                amulet: <Amulet className="w-8 h-8 text-muted-foreground" />,
                ring1: <Ring className="w-8 h-8 text-muted-foreground" />,
                ring2: <Ring className="w-8 h-8 text-muted-foreground" />,
                boots: <Boot className="w-8 h-8 text-muted-foreground" />,
                cloak: <Sparkles className="w-8 h-8 text-muted-foreground" />,
            }).map(([slot, icon]) => (
                 <DropSlot
                    key={slot}
                    slot={slot}
                    equippedItem={equipped[slot] || null}
                    isAttuned={attunedItems.includes(equipped[slot]?.id || '')}
                    onDrop={(item) => handleEquip(item, slot)}
                    onUnequip={handleUnequip}
                    onAttune={handleAttune}
                >
                    {icon}
                    <p className="text-sm font-medium capitalize">{slot.replace(/([A-Z])/g, ' $1').replace('1',' 1').replace('2',' 2')}</p>
                </DropSlot>
            ))}
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-[32rem] overflow-y-auto">
            {unequippedInventory.map(item => (
              <DraggableItem key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
};
