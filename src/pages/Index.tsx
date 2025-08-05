import { useState } from "react";
import { MainMenu } from "@/components/layout/MainMenu";
import { NarratorMode } from "@/components/modes/NarratorMode";
import { PlayerMode } from "@/components/modes/PlayerMode";
import { DiceMode } from "@/components/modes/DiceMode";
import { ShopMode } from "@/components/modes/ShopMode";

type AppMode = 'menu' | 'narrator' | 'player' | 'dice' | 'shop' | 'characters' | 'combat';

const Index = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>('menu');

  const handleModeSelect = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleBackToMenu = () => {
    setCurrentMode('menu');
  };

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'narrator':
        return <NarratorMode onBack={handleBackToMenu} />;
      case 'player':
        return <PlayerMode onBack={handleBackToMenu} />;
      case 'dice':
        return <DiceMode onBack={handleBackToMenu} />;
      case 'shop':
        return <ShopMode mode="player" onBack={handleBackToMenu} />;
      case 'characters':
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-accent mb-4">Gestión de Personajes</h1>
              <p className="text-xl text-muted-foreground mb-4">¡Próximamente!</p>
              <button 
                onClick={handleBackToMenu}
                className="text-accent hover:text-accent/80 underline"
              >
                Volver al Menú
              </button>
            </div>
          </div>
        );
      case 'combat':
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-destructive mb-4">Sistema de Combate</h1>
              <p className="text-xl text-muted-foreground mb-4">¡Próximamente!</p>
              <button 
                onClick={handleBackToMenu}
                className="text-accent hover:text-accent/80 underline"
              >
                Volver al Menú
              </button>
            </div>
          </div>
        );
      default:
        return <MainMenu onModeSelect={handleModeSelect} />;
    }
  };

  return <>{renderCurrentMode()}</>;
};

export default Index;
