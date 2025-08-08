import { useState } from "react";
import { MainMenu } from "@/components/layout/MainMenu";
import { NarratorMode } from "@/components/modes/NarratorMode";
import { PlayerMode } from "@/components/modes/PlayerMode";
import { DiceMode } from "@/components/modes/DiceMode";
import { ShopMode } from "@/components/modes/ShopMode";
import { CombatInterface } from "@/components/combat/CombatInterface";
import { bestiary } from "@/data/bestiary";

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
        return <PlayerMode onBack={handleBackToMenu} />;
      case 'combat':
        return <CombatInterface characters={[]} monsters={bestiary} onBack={handleBackToMenu} />;
      default:
        return <MainMenu onModeSelect={handleModeSelect} />;
    }
  };

  return <>{renderCurrentMode()}</>;
};

export default Index;
