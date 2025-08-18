import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bestiary, type Creature } from '@/data/bestiary';
import { EpicButton } from '../ui/epic-button';

interface RandomEncounterGeneratorProps {
  partyLevel: number;
  partySize: number;
}

// Simplified XP thresholds for encounter difficulty
const difficultyThresholds = {
  easy: [25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2100, 2400, 2800, 3900],
  medium: [50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 4200, 4900, 5700, 7800],
  hard: [75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 6300, 7300, 8500, 11700],
  deadly: [100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 9500, 10900, 12700, 17500],
};

type Difficulty = keyof typeof difficultyThresholds;

const creatureXP: { [key: string]: number } = {
    '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
    '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900, '11': 7200, '12': 8400,
    '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000, '18': 20000,
    '19': 22000, '20': 25000, '21': 33000, '22': 41000, '23': 50000, '24': 62000,
    '25': 75000, '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000
};

const encounterMultipliers = [1, 1.5, 2, 2.5, 3, 4, 5];

export const RandomEncounterGenerator = ({ partyLevel = 1, partySize = 4 }: RandomEncounterGeneratorProps) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [encounter, setEncounter] = useState<Creature[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  const generateEncounter = () => {
    const xpBudget = difficultyThresholds[difficulty][partyLevel - 1] * partySize;
    let generatedEncounter: Creature[] = [];
    let currentXP = 0;

    const possibleCreatures = bestiary.filter(c => {
      const cr = c.challenge_rating.toString();
      const xp = creatureXP[cr];
      return xp && xp <= xpBudget;
    });

    if (possibleCreatures.length === 0) {
      setEncounter([]);
      setTotalXP(0);
      return;
    }

    let attempts = 0;
    while (currentXP < xpBudget * 0.8 && attempts < 100) {
      const randomCreature = possibleCreatures[Math.floor(Math.random() * possibleCreatures.length)];
      const cr = randomCreature.challenge_rating.toString();
      const xp = creatureXP[cr];

      if (xp) {
        const tempEncounter = [...generatedEncounter, randomCreature];
        const multiplier = encounterMultipliers[Math.min(tempEncounter.length - 1, encounterMultipliers.length - 1)];
        const adjustedXP = tempEncounter.reduce((acc, c) => acc + (creatureXP[c.challenge_rating.toString()] || 0), 0) * multiplier;

        if (adjustedXP <= xpBudget * 1.2) {
          generatedEncounter.push(randomCreature);
          currentXP = adjustedXP;
        }
      }
      attempts++;
    }

    setEncounter(generatedEncounter);
    setTotalXP(currentXP);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generador de Encuentros Aleatorios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Select onValueChange={(value: Difficulty) => setDifficulty(value)} defaultValue={difficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Fácil</SelectItem>
              <SelectItem value="medium">Medio</SelectItem>
              <SelectItem value="hard">Difícil</SelectItem>
              <SelectItem value="deadly">Mortal</SelectItem>
            </SelectContent>
          </Select>
          <EpicButton onClick={generateEncounter}>Generar Encuentro</EpicButton>
        </div>

        {encounter.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Encuentro Generado</h3>
            <p className="text-sm text-muted-foreground mb-4">XP Total Ajustado: {Math.floor(totalXP)}</p>
            <div className="space-y-2">
              {encounter.map((creature, index) => (
                <Card key={index} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{creature.name}</p>
                    <p className="text-sm text-muted-foreground">CR: {creature.challenge_rating}</p>
                  </div>
                  <Button variant="outline" size="sm">Ver Stats</Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
