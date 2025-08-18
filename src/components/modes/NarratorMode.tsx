import { useState } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Sword, Users, Crown, Wand2 } from "lucide-react";
import { BestiaryList } from "@/components/bestiary/BestiaryList";
import { ShopInterface } from "@/components/shop/ShopInterface";
import { CombatInterface } from "@/components/combat/CombatInterface";
import { CampaignManager } from "@/components/campaign/CampaignManager";
import { CharacterManager } from "@/components/narrator/CharacterManager";
import { RandomEncounterGenerator } from "@/components/narrator/RandomEncounterGenerator";
import { bestiary } from "@/data/bestiary";
import type { Creature } from "@/data/bestiary";
import type { Character } from "@/data/characters";

interface NarratorModeProps {
  onBack: () => void;
}

type NarratorView = 'menu' | 'bestiary' | 'shop' | 'combat' | 'campaigns' | 'characters' | 'randomEncounter';

export const NarratorMode = ({ onBack }: NarratorModeProps) => {
  const [currentView, setCurrentView] = useState<NarratorView>('menu');
  const [selectedCreatures, setSelectedCreatures] = useState<Creature[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);

  const handleSelectCreature = (creature: Creature) => {
    setSelectedCreatures(prev => {
      const isSelected = prev.find(c => c.name === creature.name);
      if (isSelected) {
        return prev.filter(c => c.name !== creature.name);
      } else {
        return [...prev, creature];
      }
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'bestiary':
        return (
          <div className="min-h-screen bg-background p-4">
            <EpicButton variant="ghost" onClick={() => setCurrentView('menu')} className="mb-4">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </EpicButton>
            <BestiaryList 
              onSelectCreature={handleSelectCreature}
              selectedCreatures={selectedCreatures}
            />
          </div>
        );
      case 'shop':
        return (
          <div className="min-h-screen bg-background p-4">
            <EpicButton variant="ghost" onClick={() => setCurrentView('menu')} className="mb-4">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </EpicButton>
            <ShopInterface mode="narrator" />
          </div>
        );
      case 'combat':
        return <CombatInterface characters={selectedCharacters} monsters={selectedCreatures.length > 0 ? selectedCreatures : bestiary} onBack={() => setCurrentView('menu')} />;
      case 'campaigns':
        return <CampaignManager onBack={() => setCurrentView('menu')} />;
      case 'characters':
        return (
          <div className="min-h-screen bg-background p-4">
            <EpicButton variant="ghost" onClick={() => setCurrentView('menu')} className="mb-4">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </EpicButton>
            <CharacterManager 
              onSelectCharacters={setSelectedCharacters}
              selectedCharacters={selectedCharacters}
            />
          </div>
        );
      case 'randomEncounter':
        return (
          <div className="min-h-screen bg-background p-4">
            <EpicButton variant="ghost" onClick={() => setCurrentView('menu')} className="mb-4">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </EpicButton>
            <RandomEncounterGenerator
              partyLevel={selectedCharacters.length > 0 ? Math.floor(selectedCharacters.reduce((acc, c) => acc + c.level, 0) / selectedCharacters.length) : 1}
              partySize={selectedCharacters.length > 0 ? selectedCharacters.length : 4}
            />
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-background p-4">
            <div className="flex items-center gap-4 mb-8">
              <EpicButton variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
                Volver
              </EpicButton>
              <h1 className="text-4xl font-bold bg-gradient-epic bg-clip-text text-transparent">
                Modo Maestro de Juego
              </h1>
            </div>

            <p className="text-xl text-muted-foreground mb-12 text-center">
              Herramientas profesionales para dirigir aventuras épicas de D&D 5e
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                className="p-6 bg-gradient-medieval border-secondary/30 hover:border-secondary/50 transition-all cursor-pointer group"
                onClick={() => setCurrentView('characters')}
              >
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto text-secondary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-secondary mb-2">Personajes</h3>
                  <p className="text-muted-foreground">
                    Gestiona personajes de jugadores
                  </p>
                  {selectedCharacters.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                        {selectedCharacters.length} seleccionados
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              <Card 
                className="p-6 bg-gradient-medieval border-primary/30 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => setCurrentView('bestiary')}
              >
                <div className="text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-primary mb-2">Bestiario</h3>
                  <p className="text-muted-foreground">
                    Explora criaturas y estadísticas
                  </p>
                  {selectedCreatures.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        {selectedCreatures.length} seleccionadas
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              <Card 
                className="p-6 bg-gradient-medieval border-accent/30 hover:border-accent/50 transition-all cursor-pointer group"
                onClick={() => setCurrentView('combat')}
              >
                <div className="text-center">
                  <Sword className="w-12 h-12 mx-auto text-accent mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-accent mb-2">Sistema de Combate</h3>
                  <p className="text-muted-foreground">
                    Gestiona encuentros e iniciativa
                  </p>
                  <div className="mt-2 flex gap-2 justify-center">
                    {selectedCharacters.length > 0 && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                        {selectedCharacters.length} PJs
                      </span>
                    )}
                    {selectedCreatures.length > 0 && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                        {selectedCreatures.length} criaturas
                      </span>
                    )}
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 bg-gradient-medieval border-secondary/30 hover:border-secondary/50 transition-all cursor-pointer group"
                onClick={() => setCurrentView('shop')}
              >
                <div className="text-center">
                  <div className="text-4xl mx-auto text-secondary mb-4 group-hover:scale-110 transition-transform">🛒</div>
                  <h3 className="text-xl font-bold text-secondary mb-2">Tienda</h3>
                  <p className="text-muted-foreground">
                    Gestiona tiendas y economía
                  </p>
                </div>
              </Card>

              <Card 
                className="p-6 bg-gradient-medieval border-primary/30 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => setCurrentView('campaigns')}
              >
                <div className="text-center">
                  <Crown className="w-12 h-12 mx-auto text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-primary mb-2">Campañas</h3>
                  <p className="text-muted-foreground">
                    Administra campañas y sesiones
                  </p>
                </div>
              </Card>

              <Card
                className="p-6 bg-gradient-medieval border-accent/30 hover:border-accent/50 transition-all cursor-pointer group"
                onClick={() => setCurrentView('randomEncounter')}
              >
                <div className="text-center">
                  <Wand2 className="w-12 h-12 mx-auto text-accent mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-accent mb-2">Generador de Encuentros</h3>
                  <p className="text-muted-foreground">
                    Crea combates aleatorios
                  </p>
                </div>
              </Card>
            </div>
          </div>
        );
    }
  };

  return renderCurrentView();
};