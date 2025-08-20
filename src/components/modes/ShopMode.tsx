import { EpicButton } from "@/components/ui/epic-button";
import { ShopInterface } from "@/components/shop/ShopInterface";
import { ArrowLeft } from "lucide-react";
import { Character } from "@/data/characters";
import { InventoryItem } from "../character/InventoryManager";

interface ShopModeProps {
  onBack: () => void;
  characters: (Character & { inventory: InventoryItem[] })[];
  onUpdateCharacter: (character: Character & { inventory: InventoryItem[] }) => void;
}

export const ShopMode = ({ onBack, characters, onUpdateCharacter }: ShopModeProps) => {
  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <EpicButton variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
          Volver
        </EpicButton>
        <h1 className="text-3xl font-bold text-primary">
          Tienda
        </h1>
      </div>

      <ShopInterface
        characters={characters}
        onUpdateCharacter={onUpdateCharacter}
      />
    </div>
  );
};