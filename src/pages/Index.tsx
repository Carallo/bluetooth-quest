import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MainMenu } from "@/components/layout/MainMenu";
import { NarratorMode } from "@/components/modes/NarratorMode";
import { PlayerMode } from "@/components/modes/PlayerMode";
import { DiceMode } from "@/components/modes/DiceMode";
import { ShopMode } from "@/components/modes/ShopMode";
import { CombatInterface } from "@/components/combat/CombatInterface";
import { BluetoothManager } from "@/components/mobile/BluetoothManager";
import { OfflineManager } from "@/components/mobile/OfflineManager";
import { bestiary } from "@/data/bestiary";
import { useOfflineData } from "@/hooks/useOfflineData";
import { type Character } from "@/data/characters";

type AppMode = 'menu' | 'narrator' | 'player' | 'dice' | 'shop' | 'characters' | 'combat' | 'bluetooth' | 'offline';

const Index = () => {
  const { t } = useTranslation();
  const [currentMode, setCurrentMode] = useState<AppMode>('menu');
  const { data, saveCharacter, deleteCharacter } = useOfflineData();

  const handleModeSelect = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleBackToMenu = () => {
    setCurrentMode('menu');
  };

  const handleUpdateCharacter = (character: Character) => {
    saveCharacter(character);
  };

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'narrator':
        return <NarratorMode onBack={handleBackToMenu} />;
      case 'player':
        return <PlayerMode onBack={handleBackToMenu} characters={data.characters} onUpdateCharacter={handleUpdateCharacter} saveCharacter={saveCharacter} deleteCharacter={deleteCharacter} />;
      case 'dice':
        return <DiceMode onBack={handleBackToMenu} />;
      case 'shop':
        return <ShopMode onBack={handleBackToMenu} characters={data.characters} onUpdateCharacter={handleUpdateCharacter} />;
      case 'characters':
        return <PlayerMode onBack={handleBackToMenu} characters={data.characters} onUpdateCharacter={handleUpdateCharacter} saveCharacter={saveCharacter} deleteCharacter={deleteCharacter} />;
      case 'combat':
        return <CombatInterface characters={data.characters} monsters={bestiary} onBack={handleBackToMenu} />;
      case 'bluetooth':
        return (
          <div className="min-h-screen bg-background p-4">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">{t('pages.bluetoothTitle')}</h1>
              <BluetoothManager />
            </div>
          </div>
        );
      case 'offline':
        return (
          <div className="min-h-screen bg-background p-4">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">{t('pages.offlineTitle')}</h1>
              <OfflineManager onBack={handleBackToMenu} />
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
