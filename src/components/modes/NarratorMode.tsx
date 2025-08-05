import { useState } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BestiaryList } from "@/components/bestiary/BestiaryList";
import { type Creature } from "@/data/bestiary";
import { ArrowLeft, Plus, Download, QrCode, Flame } from "lucide-react";

interface NarratorModeProps {
  onBack: () => void;
}

export const NarratorMode = ({ onBack }: NarratorModeProps) => {
  const [activeTab, setActiveTab] = useState<'npcs' | 'bestiary' | 'combat'>('npcs');
  const [selectedCreatures, setSelectedCreatures] = useState<Creature[]>([]);

  const handleCreatureSelect = (creature: Creature) => {
    setSelectedCreatures(prev => {
      const isSelected = prev.some(c => c.id === creature.id);
      if (isSelected) {
        return prev.filter(c => c.id !== creature.id);
      } else {
        return [...prev, creature];
      }
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <EpicButton variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
            Volver
          </EpicButton>
          <h1 className="text-3xl font-bold text-primary">Modo Narrador</h1>
        </div>
        <div className="flex gap-2">
          <EpicButton variant="medieval">
            <Download className="w-5 h-5" />
            Generar Combate
          </EpicButton>
          <EpicButton variant="outline">
            <QrCode className="w-5 h-5" />
            Compartir QR
          </EpicButton>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-6">
        <EpicButton 
          variant={activeTab === 'npcs' ? 'default' : 'outline'}
          onClick={() => setActiveTab('npcs')}
        >
          Crear NPCs
        </EpicButton>
        <EpicButton 
          variant={activeTab === 'bestiary' ? 'default' : 'outline'}
          onClick={() => setActiveTab('bestiary')}
        >
          Bestiario
        </EpicButton>
        <EpicButton 
          variant={activeTab === 'combat' ? 'default' : 'outline'}
          onClick={() => setActiveTab('combat')}
        >
          Preparar Combate
        </EpicButton>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'npcs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-medieval border-primary/30">
            <h3 className="text-xl font-bold text-primary mb-4">Crear Nuevo NPC</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre del NPC
                </label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-input border border-border rounded-md text-foreground"
                  placeholder="Ej: Goblin Guerrero"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Puntos de Vida
                  </label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-input border border-border rounded-md text-foreground"
                    placeholder="45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Clase de Armadura
                  </label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-input border border-border rounded-md text-foreground"
                    placeholder="15"
                  />
                </div>
              </div>
              <EpicButton variant="default" className="w-full">
                <Plus className="w-5 h-5" />
                Crear NPC
              </EpicButton>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-medieval border-accent/30">
            <h3 className="text-xl font-bold text-accent mb-4">NPCs Creados</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div>
                  <h4 className="font-medium text-foreground">Orco Salvaje</h4>
                  <p className="text-sm text-muted-foreground">HP: 58 | AC: 13</p>
                </div>
                <EpicButton variant="ghost" size="sm">
                  Editar
                </EpicButton>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div>
                  <h4 className="font-medium text-foreground">Mago Oscuro</h4>
                  <p className="text-sm text-muted-foreground">HP: 40 | AC: 16</p>
                </div>
                <EpicButton variant="ghost" size="sm">
                  Editar
                </EpicButton>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'bestiary' && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Bestiario Épico</h2>
          <p className="text-muted-foreground mb-6">
            Selecciona criaturas para tu encuentro. Puedes elegir múltiples enemigos.
          </p>
          
          <BestiaryList 
            onSelectCreature={handleCreatureSelect}
            selectedCreatures={selectedCreatures}
          />
          
          {selectedCreatures.length > 0 && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
              <h3 className="font-bold text-primary mb-2">
                Criaturas Seleccionadas ({selectedCreatures.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCreatures.map((creature, index) => (
                  <Badge key={`${creature.id}-${index}`} variant="outline" className="text-primary">
                    {creature.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'combat' && (
        <Card className="p-6 bg-gradient-medieval border-destructive/30">
          <h3 className="text-xl font-bold text-destructive mb-4">Preparar Encuentro de Combate</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Enemigos Seleccionados</h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-foreground">2x Goblins</span>
                  <EpicButton variant="ghost" size="sm">Quitar</EpicButton>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-foreground">1x Orco</span>
                  <EpicButton variant="ghost" size="sm">Quitar</EpicButton>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Recompensas</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Oro</label>
                  <input 
                    type="number" 
                    className="w-full p-2 bg-input border border-border rounded text-foreground"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Objetos</label>
                  <EpicButton variant="outline" size="sm" className="w-full">
                    Seleccionar Objetos
                  </EpicButton>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};