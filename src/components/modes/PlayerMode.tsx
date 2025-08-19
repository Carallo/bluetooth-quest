import { useState } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Plus, Bluetooth } from "lucide-react";
import { CharacterList } from "@/components/character/CharacterList";
import { CharacterCreation } from "@/components/character/CharacterCreation";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { PlayerConnectionManager } from "@/components/mobile/PlayerConnectionManager";
import { type Character } from "@/data/characters";
import { useOfflineData } from "@/hooks/useOfflineData";
import { useToast } from "@/hooks/use-toast";

interface PlayerModeProps {
  onBack: () => void;
}

export const PlayerMode = ({ onBack }: PlayerModeProps) => {
  const { toast } = useToast();
  const { data, saveCharacter, deleteCharacter: removeCharacter } = useOfflineData();
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'view' | 'connect'>('list');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [initialTab, setInitialTab] = useState('stats');

  const characters = data.characters;

  const handleCreateCharacter = () => {
    setSelectedCharacter(null);
    setCurrentView('create');
  };

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentView('edit');
  };

  const handleViewCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setInitialTab('inventory');
    setCurrentView('view');
  };

  const handleSaveCharacter = (character: Character) => {
    saveCharacter(character);
    setCurrentView('list');
    setSelectedCharacter(null);
  };

  const handleUpdateCharacter = (character: Character) => {
    saveCharacter(character);
    setSelectedCharacter(character);
  };

  const handleDeleteCharacter = (characterId: string) => {
    removeCharacter(characterId);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCharacter(null);
    setInitialTab('stats');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
      case 'edit':
        return (
          <CharacterCreation
            onSave={handleSaveCharacter}
            onCancel={handleBackToList}
            editingCharacter={selectedCharacter || undefined}
          />
        );
      case 'view':
        return selectedCharacter ? (
          <CharacterSheet
            character={selectedCharacter}
            onEdit={handleEditCharacter}
            onUpdate={handleUpdateCharacter}
            onBack={handleBackToList}
            defaultTab={initialTab}
          />
        ) : null;
      case 'connect':
        return <PlayerConnectionManager onBack={handleBackToList} />;
      default:
        return (
          <CharacterList
            characters={characters}
            onCreateNew={handleCreateCharacter}
            onEdit={handleEditCharacter}
            onView={handleViewCharacter}
            onDelete={handleDeleteCharacter}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {currentView === 'list' && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <EpicButton variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
              Volver
            </EpicButton>
            <h1 className="text-3xl font-bold text-primary">Modo Jugador</h1>
          </div>
          <div className="mb-6 text-center">
            <EpicButton onClick={() => setCurrentView('connect')} size="lg">
              <Bluetooth className="w-5 h-5 mr-2" />
              Conectar con Narrador
            </EpicButton>
          </div>
        </>
      )}

      {renderCurrentView()}
    </div>
  );
};