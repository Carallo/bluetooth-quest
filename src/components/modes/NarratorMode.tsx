import { useState } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Sword, Users, Crown } from "lucide-react";
import { BestiaryList } from "@/components/bestiary/BestiaryList";
import { ShopInterface } from "@/components/shop/ShopInterface";
import { CombatInterface } from "@/components/combat/CombatInterface";
import { CampaignManager } from "@/components/campaign/CampaignManager";
import { bestiary } from "@/data/bestiary";
import type { Creature } from "@/data/bestiary";

interface NarratorModeProps {
  onBack: () => void;
}

type NarratorView = 'menu' | 'bestiary' | 'shop' | 'combat' | 'campaigns';

export const NarratorMode = ({ onBack }: NarratorModeProps) => {
  const [currentView, setCurrentView] = useState<NarratorView>('menu');
  const [selectedCreatures, setSelectedCreatures] = useState<Creature[]>([]);

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
        return <CombatInterface characters={[]} monsters={bestiary} onBack={() => setCurrentView('menu')} />;
      case 'campaigns':
        return <CampaignManager onBack={() => setCurrentView('menu')} />;
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>
          </div>
        );
    }
  };

  return renderCurrentView();
};