import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { type Creature } from '@/data/bestiary';
import { items, type Item } from '@/data/items';
import { Coins, Gem, Shield, Sword, Wand2 } from 'lucide-react';

interface RewardSystemProps {
  creatures: Creature[];
  partySize: number;
}

const creatureXP: { [key: string]: number } = {
    '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
    '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900, '11': 7200, '12': 8400,
    '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000, '18': 20000,
    '19': 22000, '20': 25000,
};

// Simplified treasure generation
const crTreasure = {
  '0-4': { gold: 50, items: 1, magicChance: 0.1 },
  '5-10': { gold: 500, items: 2, magicChance: 0.25 },
  '11-16': { gold: 5000, items: 3, magicChance: 0.5 },
  '17+': { gold: 20000, items: 4, magicChance: 0.75 },
};

const getCRBucket = (cr: number): keyof typeof crTreasure => {
  if (cr <= 4) return '0-4';
  if (cr <= 10) return '5-10';
  if (cr <= 16) return '11-16';
  return '17+';
};

export const RewardSystem = ({ creatures, partySize }: RewardSystemProps) => {
  const [generatedRewards, setGeneratedRewards] = useState<{ xp: number, gold: number, items: Item[] } | null>(null);

  const totalXP = useMemo(() => {
    return creatures.reduce((acc, c) => acc + (creatureXP[c.challenge_rating.toString()] || 0), 0);
  }, [creatures]);

  const averageCR = useMemo(() => {
    if (creatures.length === 0) return 0;
    const totalCR = creatures.reduce((acc, c) => {
        const cr = parseFloat(c.challenge_rating.replace('/', '.'));
        return acc + (isNaN(cr) ? 0 : cr);
    }, 0);
    return totalCR / creatures.length;
  }, [creatures]);

  const generateRewards = () => {
    // Gold generation can remain as a base amount of wealth from the encounter
    const bucket = getCRBucket(averageCR);
    const treasureInfo = crTreasure[bucket];
    const gold = Math.floor(treasureInfo.gold * (0.5 + Math.random())); // Slightly less random

    // Item generation from creature-specific loot tables
    const foundItemIds: string[] = [];
    creatures.forEach(creature => {
      if (creature.lootTable) {
        creature.lootTable.forEach(loot => {
          if (Math.random() < loot.dropChance) {
            foundItemIds.push(loot.itemId);
          }
        });
      }
    });

    const foundItems = foundItemIds
      .map(id => items.find(item => item.id === id))
      .filter((item): item is Item => item !== undefined);

    setGeneratedRewards({ xp: totalXP, gold, items: foundItems });
  };

  const getIcon = (item: Item) => {
    if (item.type === 'weapon') return <Sword className="w-4 h-4 mr-2" />;
    if (item.type === 'armor') return <Shield className="w-4 h-4 mr-2" />;
    if (item.type === 'potion') return <Wand2 className="w-4 h-4 mr-2" />;
    return <Gem className="w-4 h-4 mr-2" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sistema de Recompensas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">XP Total del Encuentro</p>
            <p className="text-2xl font-bold text-primary">{totalXP}</p>
          </div>
          {partySize > 0 && (
            <div className="text-right">
              <p className="text-sm font-medium">XP por Jugador</p>
              <p className="text-2xl font-bold text-primary">{Math.floor(totalXP / partySize)}</p>
            </div>
          )}
        </div>

        <Button onClick={generateRewards} className="w-full">Generar Tesoro</Button>

        {generatedRewards && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="gold">
              <AccordionTrigger>
                <div className="flex items-center">
                  <Coins className="w-5 h-5 mr-2" /> Oro y Riquezas
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-bold">{generatedRewards.gold} GP</p>
                  {partySize > 0 && (
                    <p className="text-md text-muted-foreground">
                      ({Math.floor(generatedRewards.gold / partySize)} GP cada uno)
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="items">
              <AccordionTrigger>
                <div className="flex items-center">
                  <Gem className="w-5 h-5 mr-2" /> Objetos Encontrados
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {generatedRewards.items.map((item, index) => (
                    <li key={index} className="flex items-center p-2 bg-muted/50 rounded">
                      {getIcon(item)}
                      <span>{item.name} ({item.rarity})</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
