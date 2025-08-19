import { useState, useEffect } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Heart, Shield, Zap, Coins, Backpack, BookOpen, Swords, Package } from "lucide-react";
import { type Character, getStatModifier, getProficiencyBonus, getExperienceForLevel } from "@/data/characters";
import { type Item } from "@/data/items";
import { InventoryManager } from "./InventoryManager";
import { SpellManager } from "./SpellManager";
import { LevelUpManager } from "./LevelUpManager";
import { CharacterStats } from "./CharacterStats";
import { EquipmentManager } from "./EquipmentManager";
import { useToast } from "@/hooks/use-toast";
import { useOfflineData } from "@/hooks/useOfflineData";

interface CharacterSheetProps {
  character: Character;
  onEdit: (character: Character) => void;
  onUpdate: (character: Character) => void;
  onBack: () => void;
  defaultTab?: string;
}

export const CharacterSheet = ({ character, onEdit, onUpdate, onBack, defaultTab = 'stats' }: CharacterSheetProps) => {
  const { toast } = useToast();
  const { data, addToInventory, removeFromInventory } = useOfflineData();
  const [tempHp, setTempHp] = useState(character.hitPoints.current);
  const [tempAc, setTempAc] = useState(character.armorClass);
  const [tempGold, setTempGold] = useState(character.gold);
  const [notes, setNotes] = useState(character.notes);
  const [inventory, setInventory] = useState(data.inventory.filter(item => item.characterId === character.id) || []);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showEquipmentManager, setShowEquipmentManager] = useState(false);

  useEffect(() => {
    let newAc = 10 + getStatModifier(character.stats.dexterity); // Unarmored
    const armor = character.equipmentV2?.armor;
    if(armor && armor.armorClass){
        newAc = armor.armorClass + getStatModifier(character.stats.dexterity); // Simplified
    }
    const shield = character.equipmentV2?.offHand;
    if(shield && shield.armorClass && shield.name.toLowerCase().includes('escudo')){
        newAc += shield.armorClass;
    }
    setTempAc(newAc);
  }, [character.equipmentV2, character.stats.dexterity]);

  const handleUpdateEquipment = (newEquipment: { [key: string]: Item | null }) => {
    const updatedCharacter = { ...character, equipmentV2: newEquipment };
    onUpdate(updatedCharacter);
  };

  const saveChanges = () => {
    const updatedCharacter = {
      ...character,
      hitPoints: { ...character.hitPoints, current: tempHp },
      armorClass: tempAc,
      gold: tempGold,
      notes,
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedCharacter);
    toast({
      title: "Personaje actualizado",
      description: "Los cambios han sido guardados"
    });
  };

  const levelUp = () => {
    if (character.level >= 20) return;
    
    const updatedCharacter = {
      ...character,
      level: character.level + 1,
      proficiencyBonus: getProficiencyBonus(character.level + 1),
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedCharacter);
    toast({
      title: "¡Subida de nivel!",
      description: `${character.name} ha alcanzado el nivel ${character.level + 1}`
    });
  };

  const getStatModifierText = (stat: number) => {
    const mod = getStatModifier(stat);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const experienceToNext = character.level < 20 ? getExperienceForLevel(character.level + 1) : 0;
  const experienceProgress = character.level < 20 ? 
    ((character.experience - getExperienceForLevel(character.level)) / 
     (experienceToNext - getExperienceForLevel(character.level))) * 100 : 100;

  const canLevelUp = character.experience >= experienceToNext && character.level < 20;

  const handleLevelUp = (updatedCharacter: Character) => {
    onUpdate(updatedCharacter);
    setShowLevelUp(false);
  };

  if (showLevelUp) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <LevelUpManager
          character={character}
          onLevelUp={handleLevelUp}
          onClose={() => setShowLevelUp(false)}
        />
      </div>
    );
  }

  if (showEquipmentManager) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary">Gestionar Equipo</h1>
            <p className="text-xl text-muted-foreground">{character.name}</p>
          </div>
          <EpicButton onClick={() => setShowEquipmentManager(false)}>
            Volver a la Ficha
          </EpicButton>
        </div>
        <EquipmentManager
          character={character}
          inventory={inventory}
          onUpdateEquipment={handleUpdateEquipment}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary">{character.name}</h1>
          <p className="text-xl text-muted-foreground">
            {character.race} {character.class} - Nivel {character.level}
          </p>
        </div>
        <div className="flex gap-2">
          <EpicButton variant="ghost" onClick={onBack}>
            Volver
          </EpicButton>
          <EpicButton variant="outline" onClick={() => onEdit(character)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </EpicButton>
          <EpicButton onClick={saveChanges}>
            Guardar Cambios
          </EpicButton>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="combat">Combate</TabsTrigger>
          <TabsTrigger value="equipment">Equipo</TabsTrigger>
          <TabsTrigger value="spells">Hechizos</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          <CharacterStats character={character} />

          {/* Notas del personaje */}
          <Card>
            <CardHeader>
              <CardTitle>Notas del Personaje</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Historia del personaje, personalidad, objetivos..."
                rows={6}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Puntos de vida */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Puntos de Vida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current-hp">PV Actuales</Label>
                  <Input
                    id="current-hp"
                    type="number"
                    value={tempHp}
                    onChange={(e) => setTempHp(parseInt(e.target.value) || 0)}
                    max={character.hitPoints.maximum}
                    min={0}
                  />
                </div>
                <div>
                  <Label>PV Máximos</Label>
                  <div className="text-2xl font-bold">{character.hitPoints.maximum}</div>
                </div>
                <div>
                  <Label>PV Temporales</Label>
                  <div className="text-lg">{character.hitPoints.temporary}</div>
                </div>
                <Progress 
                  value={(tempHp / character.hitPoints.maximum) * 100} 
                  className="h-3"
                />
              </CardContent>
            </Card>

            {/* Clase de armadura */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Defensa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ac">Clase de Armadura</Label>
                  <Input
                    id="ac"
                    type="number"
                    value={tempAc}
                    onChange={(e) => setTempAc(parseInt(e.target.value) || 10)}
                  />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{tempAc}</div>
                  <p className="text-sm text-muted-foreground">CA Total</p>
                </div>
              </CardContent>
            </Card>

            {/* Tiradas de salvación */}
            <Card>
              <CardHeader>
                <CardTitle>Tiradas de Salvación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(character.savingThrows).map(([stat, proficient]) => {
                  const statValue = character.stats[stat as keyof typeof character.stats];
                  const modifier = getStatModifier(statValue);
                  const bonus = modifier + (proficient ? character.proficiencyBonus : 0);
                  
                  return (
                    <div key={stat} className="flex items-center justify-between">
                      <span className="text-sm">
                        {stat === 'strength' ? 'Fuerza' :
                         stat === 'dexterity' ? 'Destreza' :
                         stat === 'constitution' ? 'Constitución' :
                         stat === 'intelligence' ? 'Inteligencia' :
                         stat === 'wisdom' ? 'Sabiduría' : 'Carisma'}
                        {proficient && ' ✓'}
                      </span>
                      <Badge variant={proficient ? "default" : "outline"}>
                        {bonus >= 0 ? '+' : ''}{bonus}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Oro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Riqueza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="gold">Monedas de Oro</Label>
                  <Input
                    id="gold"
                    type="number"
                    value={tempGold}
                    onChange={(e) => setTempGold(parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="text-3xl font-bold text-yellow-500">{tempGold}</div>
                  <p className="text-sm text-muted-foreground">Monedas de Oro</p>
                </div>
              </CardContent>
            </Card>

            {/* Equipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Backpack className="w-5 h-5" />
                  Equipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {character.equipmentV2 && Object.values(character.equipmentV2).some(i => i) ? (
                    Object.entries(character.equipmentV2).map(([slot, item]) =>
                      item ? (
                        <Badge key={slot} variant="outline" className="mr-2 mb-2">
                          {item.name} ({slot})
                        </Badge>
                      ) : null
                    )
                  ) : (
                    <p className="text-muted-foreground text-sm">No hay equipo equipado</p>
                  )}
                </div>
                <EpicButton variant="outline" className="w-full mt-4" onClick={() => setShowEquipmentManager(true)}>
                  Gestionar Equipo
                </EpicButton>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryManager
            characterId={character.id}
            inventory={inventory}
            gold={tempGold}
            onUpdateInventory={setInventory}
            onUpdateGold={setTempGold}
          />
        </TabsContent>

        <TabsContent value="spells" className="space-y-6">
          <SpellManager
            characterId={character.id}
            characterLevel={character.level}
            characterClass={character.class}
            knownSpells={character.spells}
            onUpdateSpells={(spells) => {
              const updatedCharacter = { ...character, spells, updatedAt: new Date().toISOString() };
              onUpdate(updatedCharacter);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};