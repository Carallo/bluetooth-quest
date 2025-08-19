import { useState, useMemo } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { items, categories, getRarityColor, type Item } from "@/data/items";
import { ShoppingCart, Plus, Minus, Search, Coins, User } from "lucide-react";
import { Character } from "@/data/characters";
import { toast } from "@/hooks/use-toast";
import { InventoryItem } from "../character/InventoryManager";

interface ShopInterfaceProps {
  characters: (Character & { inventory: InventoryItem[] })[];
  onUpdateCharacter: (character: Character & { inventory: InventoryItem[] }) => void;
}

export const ShopInterface = ({ characters, onUpdateCharacter }: ShopInterfaceProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('weapons');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [buyerId, setBuyerId] = useState<string>('');

  const selectedBuyer = useMemo(() => characters.find(c => c.id === buyerId), [buyerId, characters]);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      (item.category === selectedCategory || selectedCategory === 'all') &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [selectedCategory, searchTerm]);

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = items.find(i => i.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  }, [cart]);

  const addToCart = (item: Item) => setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) newCart[itemId]--;
      else delete newCart[itemId];
      return newCart;
    });
  };

  const handlePurchase = () => {
    if (!selectedBuyer) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona un comprador.' });
      return;
    }
    if (cartTotal > selectedBuyer.gold) {
      toast({ variant: 'destructive', title: 'Fondos insuficientes', description: `${selectedBuyer.name} no tiene suficiente oro.` });
      return;
    }

    const newInventory = [...selectedBuyer.inventory];
    Object.entries(cart).forEach(([itemId, quantity]) => {
      const item = items.find(i => i.id === itemId)!;
      const existingItem = newInventory.find(i => i.id === itemId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        newInventory.push({ ...item, quantity, equipped: false, attuned: false });
      }
    });

    const updatedCharacter = {
      ...selectedBuyer,
      gold: selectedBuyer.gold - cartTotal,
      inventory: newInventory,
    };

    onUpdateCharacter(updatedCharacter);
    setCart({});
    toast({ title: '¡Compra completada!', description: `${cartTotal} de oro gastado. Los objetos se han añadido al inventario de ${selectedBuyer.name}.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Tienda de Aventureros</h2>
          <p className="text-muted-foreground">Equipa a tus héroes con los mejores objetos</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={buyerId} onValueChange={setBuyerId}>
            <SelectTrigger className="w-[280px]">
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Seleccionar Comprador..." />
            </SelectTrigger>
            <SelectContent>
              {characters.map(char => <SelectItem key={char.id} value={char.id}>{char.name} ({char.gold} oro)</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input placeholder="Buscar objetos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/></div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card><CardHeader><CardTitle className="text-lg">Categorías</CardTitle></CardHeader><CardContent className="space-y-2">{categories.map((category) => (<EpicButton key={category.id} variant={selectedCategory === category.id ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedCategory(category.id)}><span className="mr-2">{category.icon}</span>{category.name}</EpicButton>))}</CardContent></Card>
          {Object.keys(cart).length > 0 && (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5" />Carrito</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(cart).map(([itemId, quantity]) => {
                  const item = items.find(i => i.id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1"><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-muted-foreground">{item.price} oro × {quantity}</p></div>
                      <div className="flex items-center gap-1"><EpicButton variant="ghost" size="sm" onClick={() => removeFromCart(itemId)}><Minus className="w-3 h-3" /></EpicButton><span className="text-sm w-6 text-center">{quantity}</span><EpicButton variant="ghost" size="sm" onClick={() => addToCart(item)}><Plus className="w-3 h-3" /></EpicButton></div>
                    </div>
                  );
                })}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-3"><span className="font-bold">Total:</span><span className="font-bold text-primary">{cartTotal} Oro</span></div>
                  <EpicButton className="w-full" onClick={handlePurchase} disabled={!selectedBuyer || cartTotal > (selectedBuyer?.gold || 0)}>{selectedBuyer && cartTotal > selectedBuyer.gold ? 'Oro Insuficiente' : 'Comprar'}</EpicButton>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="bg-gradient-medieval border-primary/20 hover:border-primary/40 transition-epic">
                <CardContent className="p-4"><div className="space-y-3"><div className="flex items-start justify-between"><h3 className="font-bold text-foreground">{item.name}</h3><Badge className={getRarityColor(item.rarity)}>{item.rarity}</Badge></div><p className="text-sm text-muted-foreground">{item.description}</p><div className="space-y-1 text-sm">{item.damage && (<div className="flex justify-between"><span className="text-muted-foreground">Daño:</span><span className="text-destructive font-medium">{item.damage}</span></div>)}{item.armorClass && (<div className="flex justify-between"><span className="text-muted-foreground">CA:</span><span className="text-accent font-medium">+{item.armorClass}</span></div>)}{item.effect && (<div className="flex justify-between"><span className="text-muted-foreground">Efecto:</span><span className="text-primary font-medium">{item.effect}</span></div>)}<div className="flex justify-between"><span className="text-muted-foreground">Precio:</span><span className="text-primary font-bold">{item.price} Oro</span></div></div><EpicButton variant="outline" size="sm" className="w-full" onClick={() => addToCart(item)}><Plus className="w-4 h-4 mr-2" />Añadir al Carrito</EpicButton></div></CardContent>
              </Card>
            ))}
          </div>
          {filteredItems.length === 0 && (<Card className="p-8 text-center"><p className="text-muted-foreground">No se encontraron objetos que coincidan con tu búsqueda.</p></Card>)}
        </div>
      </div>
    </div>
  );
};