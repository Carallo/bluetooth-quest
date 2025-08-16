import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Coins,
  Sword,
  Shield,
  Sparkles
} from "lucide-react";
import { items, type Item, categories } from "@/data/items";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem extends Item {
  quantity: number;
  equipped?: boolean;
}

interface InventoryManagerProps {
  characterId: string;
  inventory: InventoryItem[];
  gold: number;
  onUpdateInventory: (inventory: InventoryItem[]) => void;
  onUpdateGold: (gold: number) => void;
}

export const InventoryManager = ({ 
  characterId, 
  inventory, 
  gold, 
  onUpdateInventory, 
  onUpdateGold 
}: InventoryManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const addItem = (item: Item, quantity: number = 1) => {
    const existingItem = inventory.find(i => i.id === item.id);
    
    if (existingItem) {
      const updatedInventory = inventory.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
      );
      onUpdateInventory(updatedInventory);
    } else {
      const newItem: InventoryItem = { ...item, quantity, equipped: false };
      onUpdateInventory([...inventory, newItem]);
    }

    toast({
      title: "Item agregado",
      description: `${item.name} x${quantity} agregado al inventario`
    });
  };

  const removeItem = (itemId: string, quantity: number = 1) => {
    const updatedInventory = inventory.reduce((acc, item) => {
      if (item.id === itemId) {
        const newQuantity = item.quantity - quantity;
        if (newQuantity > 0) {
          acc.push({ ...item, quantity: newQuantity });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as InventoryItem[]);

    onUpdateInventory(updatedInventory);
  };

  const toggleEquipped = (itemId: string) => {
    const updatedInventory = inventory.map(item =>
      item.id === itemId ? { ...item, equipped: !item.equipped } : item
    );
    onUpdateInventory(updatedInventory);

    const item = inventory.find(i => i.id === itemId);
    toast({
      title: item?.equipped ? "Item desequipado" : "Item equipado",
      description: `${item?.name} ${item?.equipped ? 'desequipado' : 'equipado'}`
    });
  };

  const sellItem = (item: InventoryItem, quantity: number = 1) => {
    const sellPrice = Math.floor(item.price * 0.5 * quantity); // 50% del precio original
    removeItem(item.id, quantity);
    onUpdateGold(gold + sellPrice);

    toast({
      title: "Item vendido",
      description: `${item.name} x${quantity} vendido por ${sellPrice} oro`
    });
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getItemIcon = (category: string) => {
    switch (category) {
      case 'weapons': return <Sword className="w-4 h-4" />;
      case 'armor': return <Shield className="w-4 h-4" />;
      case 'magic': return <Sparkles className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getTotalValue = () => {
    return inventory.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getEquippedItems = () => {
    return inventory.filter(item => item.equipped);
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-primary">{gold}</span>
            </div>
            <p className="text-sm text-muted-foreground">Oro Disponible</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold text-accent">{inventory.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Items Únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-2xl font-bold text-secondary">{getTotalValue()}</span>
            </div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="equipped">Equipado</TabsTrigger>
          <TabsTrigger value="shop">Tienda</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Lista de inventario */}
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredInventory.map(item => (
                <Card key={item.id} className={`p-4 ${item.equipped ? 'border-primary bg-primary/10' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getItemIcon(item.category)}
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge variant="secondary">x{item.quantity}</Badge>
                          {item.equipped && <Badge variant="default">Equipado</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-primary">{item.price} oro</p>
                        {item.damage && <p className="text-xs text-destructive">Daño: {item.damage}</p>}
                        {item.armorClass && <p className="text-xs text-accent">CA: +{item.armorClass}</p>}
                        {item.effect && <p className="text-xs text-secondary">{item.effect}</p>}
                      </div>

                      <div className="flex flex-col gap-1">
                        {(item.category === 'weapons' || item.category === 'armor') && (
                          <EpicButton
                            variant={item.equipped ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleEquipped(item.id)}
                          >
                            {item.equipped ? "Desequipar" : "Equipar"}
                          </EpicButton>
                        )}
                        
                        <div className="flex gap-1">
                          <EpicButton
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id, 1)}
                            disabled={item.quantity <= 0}
                          >
                            <Minus className="w-3 h-3" />
                          </EpicButton>
                          <EpicButton
                            variant="outline"
                            size="sm"
                            onClick={() => sellItem(item, 1)}
                          >
                            Vender
                          </EpicButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredInventory.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No hay items en el inventario</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="equipped" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipo Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getEquippedItems().map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-primary/10 rounded-md">
                    <div className="flex items-center gap-3">
                      {getItemIcon(item.category)}
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex gap-2 text-sm">
                          {item.damage && <span className="text-destructive">Daño: {item.damage}</span>}
                          {item.armorClass && <span className="text-accent">CA: +{item.armorClass}</span>}
                          {item.effect && <span className="text-secondary">{item.effect}</span>}
                        </div>
                      </div>
                    </div>
                    <EpicButton
                      variant="outline"
                      size="sm"
                      onClick={() => toggleEquipped(item.id)}
                    >
                      Desequipar
                    </EpicButton>
                  </div>
                ))}

                {getEquippedItems().length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No hay items equipados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tienda de Aventureros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.slice(0, 10).map(item => (
                  <div key={item.id} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant="outline">{item.price} oro</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <EpicButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (gold >= item.price) {
                          addItem(item);
                          onUpdateGold(gold - item.price);
                        } else {
                          toast({
                            title: "Oro insuficiente",
                            description: "No tienes suficiente oro para comprar este item",
                            variant: "destructive"
                          });
                        }
                      }}
                      disabled={gold < item.price}
                      className="w-full"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Comprar
                    </EpicButton>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};