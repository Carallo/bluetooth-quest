import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bestiary, type Creature } from '@/data/bestiary';
import { EpicButton } from '../ui/epic-button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { toast } from '@/hooks/use-toast';

interface GroupedCreature {
  creature: Creature;
  count: number;
}

const difficultyThresholds = {
  easy: [25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2100, 2400, 2800, 3900],
  medium: [50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 4200, 4900, 5700, 7800],
  hard: [75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 6300, 7300, 8500, 11700],
  deadly: [100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 9500, 10900, 12700, 17500],
};

type Difficulty = keyof typeof difficultyThresholds;

const creatureXP: { [key: string]: number } = {
    '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
    '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900, '11': 7200, '12': 8400,
    '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000, '18': 20000,
    '19': 22000, '20': 25000, '21': 33000, '22': 41000, '23': 50000, '24': 62000,
    '25': 75000, '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000
};

const getEncounterMultiplier = (monsterCount: number): number => {
  if (monsterCount === 1) return 1;
  if (monsterCount === 2) return 1.5;
  if (monsterCount >= 3 && monsterCount <= 6) return 2;
  if (monsterCount >= 7 && monsterCount <= 10) return 2.5;
  if (monsterCount >= 11 && monsterCount <= 14) return 3;
  return 4;
};

export const RandomEncounterGenerator = () => {
  const [partyLevel, setPartyLevel] = useState(1);
  const [partySize, setPartySize] = useState(4);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [encounter, setEncounter] = useState<GroupedCreature[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  const generateEncounter = () => {
    if (partyLevel < 1 || partyLevel > 20 || partySize < 1) {
      toast({
        variant: 'destructive',
        title: 'Valores inválidos',
        description: 'El nivel del grupo debe estar entre 1 y 20, y el tamaño del grupo debe ser al menos 1.'
      });
      return;
    }
    const xpBudget = difficultyThresholds[difficulty][partyLevel - 1] * partySize;
    let generatedEncounter: Creature[] = [];
    let currentRawXP = 0;

    const possibleCreatures = bestiary.filter(c => {
      const cr = c.challengeRating.toString();
      const xp = creatureXP[cr];
      return xp && xp <= xpBudget;
    }).sort((a, b) => creatureXP[b.challengeRating] - creatureXP[a.challengeRating]);

    if (possibleCreatures.length === 0) {
      setEncounter([]);
      setTotalXP(0);
      toast({ variant: 'destructive', title: 'No se encontraron criaturas', description: 'No hay criaturas adecuadas para este nivel y presupuesto de XP.' });
      return;
    }

    let attempts = 0;
    while (attempts < 200) {
      const monsterCount = generatedEncounter.length;
      const multiplier = getEncounterMultiplier(monsterCount + 1);

      const remainingBudget = xpBudget - (currentRawXP * multiplier);
      if (remainingBudget <= 0 && monsterCount > 0) break;

      const affordableCreatures = possibleCreatures.filter(c => (creatureXP[c.challengeRating] * multiplier) <= remainingBudget);
      if (affordableCreatures.length === 0) {
        if (monsterCount > 0) break; // Can't add more, but we have something
        // If we have nothing, we must be stuck. Let's find at least one creature.
        const fallbackCreature = possibleCreatures.find(c => creatureXP[c.challengeRating] <= xpBudget);
        if (fallbackCreature) generatedEncounter.push(fallbackCreature);
        break;
      }

      const randomCreature = affordableCreatures[Math.floor(Math.random() * affordableCreatures.length)];
      generatedEncounter.push(randomCreature);
      currentRawXP += creatureXP[randomCreature.challengeRating];

      const adjustedXP = currentRawXP * getEncounterMultiplier(generatedEncounter.length);
      if (adjustedXP > xpBudget * 1.3) { // Stop if we go too far over budget
          // remove the last added creature and break
          const lastCreature = generatedEncounter.pop();
          if (lastCreature) currentRawXP -= creatureXP[lastCreature.challengeRating];
          break;
      }
      attempts++;
    }

    // Grouping
    const grouped = generatedEncounter.reduce((acc, creature) => {
      const existing = acc.find(item => item.creature.id === creature.id);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ creature, count: 1 });
      }
      return acc;
    }, [] as GroupedCreature[]);

    setEncounter(grouped);
    setTotalXP(currentRawXP * getEncounterMultiplier(generatedEncounter.length));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generador de Encuentros Aleatorios</CardTitle>
        <CardDescription>Ajusta los parámetros de tu grupo y la dificultad deseada para generar un encuentro.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="party-level">Nivel del Grupo</Label>
            <Input id="party-level" type="number" value={partyLevel} onChange={e => setPartyLevel(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="party-size">Tamaño del Grupo</Label>
            <Input id="party-size" type="number" value={partySize} onChange={e => setPartySize(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
          </div>
          <div className="space-y-2">
            <Label>Dificultad</Label>
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
          </div>
          <EpicButton onClick={generateEncounter}>Generar Encuentro</EpicButton>
        </div>

        {encounter.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Encuentro Generado</h3>
            <p className="text-sm text-muted-foreground mb-4">XP Total Ajustado: {Math.floor(totalXP)}</p>
            <div className="space-y-2">
              {encounter.map(({ creature, count }) => (
                <Card key={creature.id} className="p-3 flex justify-between items-center bg-muted/50">
                  <div>
                    <p className="font-bold">{creature.name} <span className="font-normal text-muted-foreground">x{count}</span></p>
                    <p className="text-sm text-muted-foreground">CR: {creature.challengeRating} ({creatureXP[creature.challengeRating] || 0} XP c/u)</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Ver Stats</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{creature.name}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] p-4">
                        <div className="space-y-4">
                          <p className="text-sm italic text-muted-foreground">{creature.size} {creature.type}</p>
                          <Separator />
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div><strong>Clase de Armadura:</strong> {creature.armorClass}</div>
                            <div><strong>Puntos de Golpe:</strong> {creature.hitPoints}</div>
                            <div><strong>Velocidad:</strong> {creature.speed}</div>
                          </div>
                          <Separator />
                           <div className="grid grid-cols-6 gap-2 text-center">
                              <div><div className="font-bold">FUE</div><div>{creature.strength} ({Math.floor((creature.strength - 10) / 2)})</div></div>
                              <div><div className="font-bold">DES</div><div>{creature.dexterity} ({Math.floor((creature.dexterity - 10) / 2)})</div></div>
                              <div><div className="font-bold">CON</div><div>{creature.constitution} ({Math.floor((creature.constitution - 10) / 2)})</div></div>
                              <div><div className="font-bold">INT</div><div>{creature.intelligence} ({Math.floor((creature.intelligence - 10) / 2)})</div></div>
                              <div><div className="font-bold">SAB</div><div>{creature.wisdom} ({Math.floor((creature.wisdom - 10) / 2)})</div></div>
                              <div><div className="font-bold">CAR</div><div>{creature.charisma} ({Math.floor((creature.charisma - 10) / 2)})</div></div>
                          </div>
                          <Separator />
                          <div className="text-sm space-y-1">
                            {creature.skills && <div><strong>Habilidades:</strong> {creature.skills.join(', ')}</div>}
                            {creature.damageResistances && <div><strong>Resistencias al Daño:</strong> {creature.damageResistances.join(', ')}</div>}
                            {creature.damageImmunities && <div><strong>Inmunidades al Daño:</strong> {creature.damageImmunities.join(', ')}</div>}
                            {creature.conditionImmunities && <div><strong>Inmunidades a Estados:</strong> {creature.conditionImmunities.join(', ')}</div>}
                            <div><strong>Sentidos:</strong> {creature.senses}</div>
                            <div><strong>Idiomas:</strong> {creature.languages}</div>
                            <div><strong>Desafío:</strong> {creature.challengeRating} ({creatureXP[creature.challengeRating] || 0} XP)</div>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-bold text-lg mb-2">Acciones</h4>
                            <div className="space-y-3">
                              {creature.actions.map(action => (
                                <div key={action.name}>
                                  <p><span className="font-bold italic">{action.name}.</span> {action.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
