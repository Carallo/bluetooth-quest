import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bestiary, type Creature } from "@/data/bestiary";
import { Search, Plus, Sword, Shield, Heart, Zap } from "lucide-react";

interface BestiaryListProps {
  onSelectCreature: (creature: Creature) => void;
  selectedCreatures: Creature[];
}

export const BestiaryList = ({ onSelectCreature, selectedCreatures }: BestiaryListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const creatureTypes = [
    "all",
    "Humanoide",
    "No-muerto", 
    "Bestia",
    "Gigante",
    "Monstruosidad",
    "Feérico"
  ];

  const filteredCreatures = bestiary.filter(creature => {
    const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creature.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || creature.type.includes(selectedType);
    return matchesSearch && matchesType;
  });

  const isSelected = (creature: Creature) => 
    selectedCreatures.some(selected => selected.id === creature.id);

  const getCRColor = (cr: string) => {
    const num = parseFloat(cr);
    if (num < 1) return "text-emerald-400";
    if (num <= 2) return "text-yellow-400";
    if (num <= 5) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar criaturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-7">
            {creatureTypes.map(type => (
              <TabsTrigger key={type} value={type} className="text-xs">
                {type === "all" ? "Todos" : type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Lista de criaturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredCreatures.map(creature => (
          <Card 
            key={creature.id} 
            className={`p-4 transition-epic cursor-pointer ${
              isSelected(creature) 
                ? 'border-primary bg-primary/10 shadow-glow' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectCreature(creature)}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-primary">{creature.name}</h3>
                <Badge variant="outline" className={getCRColor(creature.challengeRating)}>
                  CR {creature.challengeRating}
                </Badge>
              </div>

              {/* Tipo y tamaño */}
              <p className="text-sm text-muted-foreground">
                {creature.size} {creature.type}
              </p>

              {/* Stats básicas */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-accent" />
                  <span>CA {creature.armorClass}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-destructive" />
                  <span>{creature.hitPoints} PG</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" />
                  <span>{creature.speed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sword className="h-3 w-3 text-accent" />
                  <span>+{creature.proficiencyBonus}</span>
                </div>
              </div>

              {/* Descripción */}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {creature.description}
              </p>

              {/* Botón de selección */}
              <EpicButton 
                variant={isSelected(creature) ? "blood" : "outline"} 
                size="sm"
                className="w-full"
              >
                {isSelected(creature) ? (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    Seleccionado
                  </>
                ) : (
                  "Seleccionar"
                )}
              </EpicButton>
            </div>
          </Card>
        ))}
      </div>

      {filteredCreatures.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron criaturas</p>
        </div>
      )}
    </div>
  );
};