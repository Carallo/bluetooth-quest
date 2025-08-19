import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { type Creature } from '@/data/bestiary';
import { items, type Item, getRarityColor } from '@/data/items';
import { Coins, Gem, Shield, Sword, Wand2, Dices } from 'lucide-react';

interface RewardSystemProps {
  creatures: Creature[];
  partySize: number;
}

const creatureXP: { [key: string]: number } = {
    '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
    '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900, '11': 7200, '12': 8400,
    '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000, '18': 20000,
    '19': 22000, '20': 25000, '21': 33000, '22': 41000, '23': 50000, '24': 62000, '25': 75000, '30': 155000,
};

const crTreasure = {
  '0-4': { gold: 50, items: 1, magicChance: 0.1, maxRarity: 'uncommon' },
  '5-10': { gold: 500, items: 2, magicChance: 0.25, maxRarity: 'rare' },
  '11-16': { gold: 5000, items: 3, magicChance: 0.5, maxRarity: 'epic' },
  '17+': { gold: 20000, items: 4, magicChance: 0.75, maxRarity: 'legendary' },
};

type Rarity = Item['rarity'];
const rarityOrder: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const getCRBucket = (cr: number): keyof typeof crTreasure => {
  if (cr <= 4) return '0-4';
  if (cr <= 10) return '5-10';
  if (cr <= 16) return '11-16';
  return '17+';
};

export const RewardSystem = ({ creatures, partySize }: RewardSystemProps) => {
  const [generatedRewards, setGeneratedRewards] = useState<{ xp: number, gold: number, lootItems: Item[], hoardItems: Item[] } | null>(null);

  const totalXP = useMemo(() => {
    return creatures.reduce((acc, c) => acc + (creatureXP[c.challengeRating.toString()] || 0), 0);
  }, [creatures]);

  const averageCR = useMemo(() => {
    if (creatures.length === 0) return 0;
    const totalCR = creatures.reduce((acc, c) => {
        const crValue = c.challengeRating.includes('/') ? parseFloat(c.challengeRating.split('/')[0]) / parseFloat(c.challengeRating.split('/')[1]) : parseFloat(c.challengeRating);
        return acc + (isNaN(crValue) ? 0 : crValue);
    }, 0);
    return totalCR / creatures.length;
  }, [creatures]);

  const generateRewards = () => {
    const bucket = getCRBucket(averageCR);
    const treasureInfo = crTreasure[bucket];

    // 1. Gold Generation
    const gold = Math.floor(treasureInfo.gold * (Math.random() * 0.5 + 0.75));

    // 2. Creature-specific Loot
    const lootItems = creatures.flatMap(creature =>
      creature.lootTable?.filter(loot => Math.random() < loot.dropChance)
        .map(loot => items.find(item => item.id === loot.itemId))
        .filter((item): item is Item => !!item) || []
    );

    // 3. Hoard Treasure (Random Items)
    const hoardItems: Item[] = [];
    const maxRarityIndex = rarityOrder.indexOf(treasureInfo.maxRarity);

    for (let i = 0; i < treasureInfo.items; i++) {
      const isMagic = Math.random() < treasureInfo.magicChance;
      const availableItems = items.filter(item => {
        const itemRarityIndex = rarityOrder.indexOf(item.rarity);
        const categoryMatch = isMagic ? item.category === 'magic' : item.category !== 'magic';
        return categoryMatch && itemRarityIndex <= maxRarityIndex;
      });

      if (availableItems.length > 0) {
        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        hoardItems.push(randomItem);
      }
    }

    setGeneratedRewards({ xp: totalXP, gold, lootItems, hoardItems });
  };

  const getIcon = (item: Item) => {
    if (item.category === 'weapons') return <Sword className="w-5 h-5 mr-3" />;
    if (item.category === 'armor') return <Shield className="w-5 h-5 mr-3" />;
    if (item.category === 'potions') return <Wand2 className="w-5 h-5 mr-3" />;
    return <Gem className="w-5 h-5 mr-3" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sistema de Recompensas</CardTitle>
        <CardDescription>Calcula la XP y genera tesoros basados en los enemigos derrotados.</CardDescription>
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

        <Button onClick={generateRewards} className="w-full">
            <Dices className="w-4 h-4 mr-2" />
            Generar Tesoro y Botín
        </Button>

        {generatedRewards && (
          <Accordion type="multiple" className="w-full space-y-2">
            <AccordionItem value="gold" className="border-b-0">
                <Card className="bg-gradient-to-tr from-amber-500/10 to-yellow-400/10">
                    <AccordionTrigger className="p-4">
                        <div className="flex items-center text-lg font-semibold text-amber-600"><Coins className="w-6 h-6 mr-2" /> Oro y Riquezas</div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                        <div className="flex items-center gap-4">
                        <p className="text-2xl font-bold">{generatedRewards.gold} GP</p>
                        {partySize > 0 && (<p className="text-lg text-muted-foreground">({Math.floor(generatedRewards.gold / partySize)} GP cada uno)</p>)}
                        </div>
                    </AccordionContent>
                </Card>
            </AccordionItem>
            {generatedRewards.lootItems.length > 0 && (
                <AccordionItem value="loot" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="p-4">
                            <div className="flex items-center text-lg font-semibold"><Sword className="w-6 h-6 mr-2" /> Botín de Criaturas</div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                            <ul className="space-y-2">
                            {generatedRewards.lootItems.map((item, index) => (
                                <li key={`loot-${index}`} className="flex items-center p-2 bg-muted/50 rounded">
                                {getIcon(item)}
                                <span className={getRarityColor(item.rarity)}>{item.name}</span>
                                <Badge variant="outline" className="ml-auto">{item.rarity}</Badge>
                                </li>
                            ))}
                            </ul>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            )}
             {generatedRewards.hoardItems.length > 0 && (
                <AccordionItem value="hoard" className="border-b-0">
                    <Card>
                        <AccordionTrigger className="p-4">
                            <div className="flex items-center text-lg font-semibold"><Gem className="w-6 h-6 mr-2" /> Tesoro Adicional</div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                            <ul className="space-y-2">
                            {generatedRewards.hoardItems.map((item, index) => (
                                <li key={`hoard-${index}`} className="flex items-center p-2 bg-muted/50 rounded">
                                {getIcon(item)}
                                <span className={getRarityColor(item.rarity)}>{item.name}</span>
                                <Badge variant="outline" className="ml-auto">{item.rarity}</Badge>
                                </li>
                            ))}
                            </ul>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
