import { useState } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Download, QrCode, Flame } from "lucide-react";

interface NarratorModeProps {
  onBack: () => void;
}

export const NarratorMode = ({ onBack }: NarratorModeProps) => {
  const [activeTab, setActiveTab] = useState<'npcs' | 'bestiary' | 'combat'>('npcs');

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Criaturas del bestiario */}
          {[
            { name: "Goblin", hp: 7, ac: 15, cr: "1/4" },
            { name: "Orco", hp: 15, ac: 13, cr: "1/2" },
            { name: "Esqueleto", hp: 13, ac: 13, cr: "1/4" },
            { name: "Lobo", hp: 11, ac: 13, cr: "1/4" },
            { name: "Oso", hp: 19, ac: 11, cr: "1/2" },
            { name: "Dragón Joven", hp: 178, ac: 18, cr: "9" },
          ].map((creature, index) => (
            <Card key={index} className="p-4 bg-gradient-medieval border-primary/30 hover:border-primary transition-epic group cursor-pointer">
              <div className="text-center">
                <Flame className="w-8 h-8 text-primary mx-auto mb-2 group-hover:animate-epic-bounce" />
                <h4 className="font-bold text-foreground">{creature.name}</h4>
                <p className="text-sm text-muted-foreground">
                  HP: {creature.hp} | AC: {creature.ac} | CR: {creature.cr}
                </p>
                <EpicButton variant="outline" size="sm" className="mt-2 w-full">
                  Seleccionar
                </EpicButton>
              </div>
            </Card>
          ))}
        </div>
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