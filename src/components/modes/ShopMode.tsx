import { useState } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { ShopInterface } from "@/components/shop/ShopInterface";
import { type Item } from "@/data/items";
import { ArrowLeft } from "lucide-react";

interface ShopModeProps {
  onBack: () => void;
  mode: 'player' | 'narrator';
  playerGold?: number;
  onPurchase?: (item: Item, quantity: number) => void;
  onAddToEncounter?: (item: Item, quantity: number) => void;
}

export const ShopMode = ({ onBack, mode, playerGold, onPurchase, onAddToEncounter }: ShopModeProps) => {
  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <EpicButton variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
          Volver
        </EpicButton>
        <h1 className="text-3xl font-bold text-primary">
          {mode === 'player' ? 'Tienda' : 'Arsenal del Narrador'}
        </h1>
      </div>

      <ShopInterface
        mode={mode}
        playerGold={playerGold}
        onPurchase={onPurchase}
        onAddToEncounter={onAddToEncounter}
      />
    </div>
  );
};