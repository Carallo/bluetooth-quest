import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sword, Shield, Heart, Zap, Users, Dice6, RotateCcw, Plus, Minus, Trophy, Footprints, ShieldCheck, HeartPulse, Package, Skull, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Character } from "@/data/characters";
import { Creature } from "@/data/bestiary";
import { Item } from "@/data/items";
import { RewardSystem } from "../narrator/RewardSystem";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "../ui/label";
import { useBluetooth } from "@/hooks/useBluetooth";

// --- START: Condition System Implementation ---
export const DND_CONDITIONS = {
  "Aturdido": { description: "No puede realizar acciones ni reacciones. Falla automáticamente las tiradas de salvación de Fuerza y Destreza. Los ataques en su contra tienen ventaja." },
  "Cegado": { description: "No puede ver y falla automáticamente cualquier prueba de característica que requiera la vista. Las tiradas de ataque en su contra tienen ventaja, y sus propias tiradas de ataque tienen desventaja." },
  "Derribado": { description: "Su único movimiento posible es arrastrarse, a menos que se levante. Tiene desventaja en las tiradas de ataque. Un ataque en su contra tiene ventaja si el atacante está a 5 pies, si no, el ataque tiene desventaja." },
  "Ensordecido": { description: "No puede oír y falla automáticamente cualquier prueba de característica que requiera el oído." },
  "Envenenado": { description: "Tiene desventaja en las tiradas de ataque y en las pruebas de característica." },
  "Hechizado": { description: "No puede atacar al lanzador del hechizo ni elegirlo como objetivo de habilidades o efectos mágicos dañinos. El lanzador tiene ventaja en cualquier prueba de característica para interactuar socialmente con la criatura." },
  "Incapacitado": { description: "No puede realizar acciones ni reacciones." },
  "Invisible": { description: "Es imposible de ver sin la ayuda de la magia o un sentido especial. Se considera que está muy oscuro para el propósito de esconderse. Las tiradas de ataque en su contra tienen desventaja, y sus propias tiradas de ataque tienen ventaja." },
  "Paralizado": { description: "Está incapacitado y no puede moverse ni hablar. Falla automáticamente las tiradas de salvación de Fuerza y Destreza. Los ataques en su contra tienen ventaja. Cualquier ataque que impacte es un golpe crítico si el atacante está a 5 pies." },
  "Petrificado": { description: "Se transforma, junto con cualquier objeto no mágico que lleve, en una sustancia sólida inanimada. Su peso se multiplica por diez y deja de envejecer. Está incapacitado, no puede moverse ni hablar y no es consciente de su entorno. Los ataques en su contra tienen ventaja. Falla automáticamente las tiradas de salvación de Fuerza y Destreza. Tiene resistencia a todo el daño. Se considera un objeto." },
  "Asustado": { description: "Tiene desventaja en las pruebas de característica y en las tiradas de ataque mientras la fuente de su miedo esté en su línea de visión. No puede acercarse voluntariamente a la fuente de su miedo." },
  "Sujetado": { description: "Su velocidad se convierte en 0, y no puede beneficiarse de ninguna bonificación a su velocidad. Las tiradas de ataque en su contra tienen ventaja, y sus propias tiradas de ataque tienen desventaja. Tiene desventaja en las tiradas de salvación de Destreza." },
  "Inconsciente": { description: "Está incapacitado, no puede moverse ni hablar, y no es consciente de su entorno. Cae derribado si está de pie. Falla automáticamente las tiradas de salvación de Fuerza y Destreza. Los ataques en su contra tienen ventaja. Cualquier ataque que impacte es un golpe crítico si el atacante está a 5 pies de él."}
};
export type ConditionName = keyof typeof DND_CONDITIONS;

interface ActiveCondition {
  name: string; // Using string to allow custom conditions like "Defendiendo"
  duration: number; // in rounds, -1 for indefinite
}

// --- END: Condition System Implementation ---

interface CombatParticipant {
  id: string;
  name: string;
  type: 'character' | 'monster';
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  conditions: ActiveCondition[];
  isActive: boolean;
  data: Character | Creature;
}

interface CombatAction {
  id: string;
  participantId: string;
  action: string;
  target?: string;
  damage?: number;
  healing?: number;
  round: number;
  timestamp: number;
}

interface CombatInterfaceProps {
  characters: Character[];
  monsters: Creature[];
  onBack: () => void;
  isNarratorMode?: boolean;
  connectedDeviceId?: string | null;
}

export const CombatInterface = ({ characters, monsters, onBack, isNarratorMode = true, connectedDeviceId = null }: CombatInterfaceProps) => {
  const [participants, setParticipants] = useState<CombatParticipant[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [combatLog, setCombatLog] = useState<CombatAction[]>([]);
  const [isInitiativeRolled, setIsInitiativeRolled] = useState(false);
  const [showRewardSystem, setShowRewardSystem] = useState(false);
  const [defeatedMonsters, setDefeatedMonsters] = useState<Creature[]>([]);
  const [isTargeting, setIsTargeting] = useState<{ attackerId: string | null }>({ attackerId: null });
  const [itemUseModalOpen, setItemUseModalOpen] = useState(false);
  const [conditionModal, setConditionModal] = useState<{ open: boolean; participantId: string | null }>({ open: false, participantId: null });
  const [aoeModalOpen, setAoeModalOpen] = useState(false);
  const [aoeTargets, setAoeTargets] = useState<string[]>([]);
  const [aoeDamage, setAoeDamage] = useState('6d6');
  const [aoeDamageType, setAoeDamageType] = useState('Fuego');
  const [defeatedCharacter, setDefeatedCharacter] = useState<CombatParticipant | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<{characters: string[], monsters: string[]}>({
    characters: [],
    monsters: []
  });
  const { toast } = useToast();
  const { startServer, stopServer, updateCombatState, startClient, stopClient } = useBluetooth();

  const hasCondition = (p: CombatParticipant, name: string) => p.conditions.some(c => c.name === name);

  // Bi-directional sync effect for the Narrator
  useEffect(() => {
    if (isNarratorMode) {
      if (participants.length > 0) {
        updateCombatState(JSON.stringify(participants));
      }
    }
  }, [participants, isNarratorMode, updateCombatState]);

  // Bluetooth connection management effect
  useEffect(() => {
    if (isNarratorMode) {
      startServer().catch(err => toast({ variant: 'destructive', title: 'Error de Servidor BLE', description: err.message }));
      return () => {
        stopServer().catch(err => console.error("Error stopping server", err));
      };
    } else if(connectedDeviceId) {
      const handleStateUpdate = (state: string) => {
        try {
          const receivedParticipants = JSON.parse(state);
          // Basic validation to prevent malformed data errors
          if (Array.isArray(receivedParticipants)) {
            setParticipants(receivedParticipants);
          }
        } catch (e) {
          console.error("Error parsing received combat state:", e);
          toast({ variant: 'destructive', title: 'Error de Sincronización', description: 'Se recibieron datos corruptos.' });
        }
      };
      startClient(connectedDeviceId, handleStateUpdate)
        .catch(err => toast({ variant: 'destructive', title: 'Error de Cliente BLE', description: err.message }));

      return () => {
        stopClient().catch(err => console.error("Error stopping client", err));
      };
    }
  }, [isNarratorMode, connectedDeviceId, startServer, stopServer, startClient, stopClient, toast]);

  useEffect(() => {
    if (!isInitiativeRolled) return;
    const aliveCharacters = participants.filter(p => p.type === 'character' && p.hp > 0 && !hasCondition(p, 'Huyó'));
    const aliveMonsters = participants.filter(p => p.type === 'monster' && p.hp > 0 && !hasCondition(p, 'Huyó'));

    if (aliveMonsters.length === 0 && participants.some(p => p.type === 'monster')) {
      toast({ title: "¡Victoria!", description: "Todos los monstruos han sido derrotados.", duration: 5000 });
      const allMonsters = participants.filter(p => p.type === 'monster').map(p => p.data as Creature);
      setDefeatedMonsters(allMonsters);
      setShowRewardSystem(true);
    } else if (aliveCharacters.length === 0 && participants.some(p => p.type === 'character')) {
        toast({ title: "¡Derrota!", description: "Todos los personajes han sido derrotados o han huido.", duration: 5000 });
    }
  }, [participants, isInitiativeRolled, toast]);

  const addCharacter = (character: Character) => {
    if (selectedParticipants.characters.includes(character.id)) return;
    setSelectedParticipants(prev => ({ ...prev, characters: [...prev.characters, character.id] }));
  };

  const addMonster = (monster: Creature) => {
    const monsterId = `${monster.name}-${Date.now()}`;
    setSelectedParticipants(prev => ({ ...prev, monsters: [...prev.monsters, monsterId] }));
  };

  const removeParticipant = (id: string, type: 'character' | 'monster') => {
    setSelectedParticipants(prev => ({
      ...prev,
      [type === 'character' ? 'characters' : 'monsters']: prev[type === 'character' ? 'characters' : 'monsters'].filter(p => p !== id)
    }));
  };

  const rollInitiative = () => {
    const newParticipants: CombatParticipant[] = [];
    selectedParticipants.characters.forEach(charId => {
      const character = characters.find(c => c.id === charId);
      if (character) {
        const dexModifier = Math.floor((character.stats.dexterity - 10) / 2);
        const initiative = Math.floor(Math.random() * 20) + 1 + dexModifier;
        newParticipants.push({
          id: character.id, name: character.name, type: 'character', hp: character.hitPoints.current, maxHp: character.hitPoints.maximum,
          ac: character.armorClass, initiative, conditions: [], isActive: false, data: character
        });
      }
    });
    selectedParticipants.monsters.forEach(monsterId => {
      const monsterName = monsterId.split('-')[0];
      const monster = monsters.find(m => m.name === monsterName);
      if (monster) {
        const initiative = Math.floor(Math.random() * 20) + 1 + Math.floor((monster.dexterity - 10) / 2);
        newParticipants.push({
          id: monsterId, name: monster.name, type: 'monster', hp: monster.hitPoints, maxHp: monster.hitPoints,
          ac: monster.armorClass, initiative, conditions: [], isActive: false, data: monster
        });
      }
    });
    newParticipants.sort((a, b) => b.initiative - a.initiative);
    if (newParticipants.length > 0) newParticipants[0].isActive = true;
    setParticipants(newParticipants);
    setIsInitiativeRolled(true);
    setCurrentTurn(0);
    setCurrentRound(1);
    toast({ title: "Iniciativa rodada", description: "¡El combate ha comenzado!" });
  };

  const logAction = (participantId: string, action: string, target?: string, damage?: number, healing?: number) => {
    const newAction: CombatAction = { id: Date.now().toString(), participantId, action, target, damage, healing, round: currentRound, timestamp: Date.now() };
    setCombatLog(prev => [newAction, ...prev]);
  };

  const applyCondition = (participantId: string, name: string, duration: number) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === participantId) {
        const existingCondition = p.conditions.find(c => c.name === name);
        if (existingCondition) return p; // Avoid duplicates
        logAction(participantId, `sufre el estado: ${name}.`);
        return { ...p, conditions: [...p.conditions, { name, duration }] };
      }
      return p;
    }));
  };

  const removeCondition = (participantId: string, name: string) => {
    setParticipants(prev => prev.map(p => {
       if (p.id === participantId) {
         logAction(participantId, `se recupera del estado: ${name}.`);
         return { ...p, conditions: p.conditions.filter(c => c.name !== name) };
       }
       return p;
    }));
  };

  const nextTurn = () => {
    const activeParticipant = participants[currentTurn];
    if (!activeParticipant) return;

    // Process end-of-turn for the current participant
    let updatedParticipants = participants.map((p, index) => {
        if (index === currentTurn) {
            let newConditions = p.conditions;
            // Decrement duration at the end of the affected creature's turn
            newConditions = newConditions.map(c => ({ ...c, duration: c.duration > 0 ? c.duration - 1 : c.duration }))
                                         .filter(c => c.duration !== 0);
            return { ...p, isActive: false, conditions: newConditions };
        }
        return p;
    });

    let nextTurnIndex = (currentTurn + 1) % updatedParticipants.length;
    if (nextTurnIndex === 0) {
      setCurrentRound(prev => prev + 1);
    }

    // Find next valid participant
    let safetyBreak = updatedParticipants.length;
    while (hasCondition(updatedParticipants[nextTurnIndex], 'Muerto') || hasCondition(updatedParticipants[nextTurnIndex], 'Huyó')) {
        nextTurnIndex = (nextTurnIndex + 1) % updatedParticipants.length;
        if (safetyBreak-- <= 0) break;
    }

    // Activate next participant
    updatedParticipants = updatedParticipants.map((p, index) => ({
        ...p,
        isActive: index === nextTurnIndex,
        conditions: index === nextTurnIndex ? p.conditions.filter(c => c.name !== 'Defendiendo') : p.conditions
    }));

    setParticipants(updatedParticipants);
    setCurrentTurn(nextTurnIndex);

    const nextParticipant = updatedParticipants[nextTurnIndex];
    if (hasCondition(nextParticipant, 'Paralizado') || hasCondition(nextParticipant, 'Aturdido') || hasCondition(nextParticipant, 'Inconsciente')) {
        logAction(nextParticipant.id, `no puede actuar debido a su estado y pierde su turno.`);
        setTimeout(nextTurn, 1200); // Automatically skip turn after a short delay
    }
  };

  const applyDamage = (participantId: string, damage: number) => {
    let defeatedChar: CombatParticipant | null = null;
    setParticipants(prev => 
      prev.map(p => {
        if (p.id === participantId) {
          const newHp = Math.max(0, p.hp - damage);
          if (newHp === 0 && p.hp > 0) { // Only trigger on the hit that brings them to 0
            if (p.type === 'character') defeatedChar = { ...p, hp: 0 };
            const existingConditions = p.conditions.filter(c => c.name !== 'Inconsciente');
            logAction(p.id, `cae inconsciente!`);
            return { ...p, hp: newHp, conditions: [...existingConditions, { name: 'Inconsciente', duration: -1 }] };
          }
          return { ...p, hp: newHp };
        }
        return p;
      })
    );
    if (defeatedChar) setDefeatedCharacter(defeatedChar);
    const participant = participants.find(p => p.id === participantId);
    if (participant) logAction(participantId, `recibe ${damage} de daño.`);
  };

  const applyHealing = (participantId: string, healing: number) => {
    setParticipants(prev => 
      prev.map(p => {
        if (p.id === participantId && !hasCondition(p, 'Muerto')) {
          const newHp = Math.min(p.maxHp, p.hp + healing);
          let newConditions = p.conditions;
          if (p.hp === 0 && newHp > 0) {
             newConditions = newConditions.filter(c => c.name !== 'Inconsciente');
             logAction(participantId, `recupera la consciencia.`);
          }
          return { ...p, hp: newHp, conditions: newConditions };
        }
        return p;
      })
    );
    const participant = participants.find(p => p.id === participantId);
    if (participant && !hasCondition(p, 'Muerto')) logAction(participantId, `recibe ${healing} de curación.`);
  };

  const handleAttack = (attackerId: string) => {
    setIsTargeting({ attackerId });
    toast({ title: "Selecciona un objetivo", description: "Haz clic en el participante que deseas atacar." });
  };

  const handleSelectTarget = (targetId: string) => {
    if (!isTargeting.attackerId) return;

    const attacker = participants.find(p => p.id === isTargeting.attackerId);
    const target = participants.find(p => p.id === targetId);

    if (!attacker || !target || attacker.id === target.id || hasCondition(target, 'Huyó')) {
      setIsTargeting({ attackerId: null });
      toast({ variant: "destructive", title: "Objetivo inválido" });
      return;
    }

    let advantage = false;
    let disadvantage = false;

    if (hasCondition(attacker, 'Envenenado') || hasCondition(attacker, 'Asustado') || hasCondition(attacker, 'Derribado') || hasCondition(attacker, 'Cegado')) disadvantage = true;
    if (hasCondition(attacker, 'Invisible')) advantage = true;

    if (hasCondition(target, 'Sujetado') || hasCondition(target, 'Aturdido') || hasCondition(target, 'Paralizado') || hasCondition(target, 'Inconsciente') || hasCondition(target, 'Cegado')) advantage = true;
    if (hasCondition(target, 'Invisible')) disadvantage = true;
    if (hasCondition(target, 'Derribado')) advantage = true; // Assuming melee for simplicity
    if (hasCondition(target, 'Defendiendo')) disadvantage = true;


    let roll1 = Math.floor(Math.random() * 20) + 1;
    let roll2 = Math.floor(Math.random() * 20) + 1;
    let attackRoll = roll1;
    let rollDescription = `(tirada ${roll1})`;

    if (advantage && !disadvantage) {
        attackRoll = Math.max(roll1, roll2);
        rollDescription = `(ventaja, tiradas ${roll1}, ${roll2} -> ${attackRoll})`;
    } else if (disadvantage && !advantage) {
        attackRoll = Math.min(roll1, roll2);
        rollDescription = `(desventaja, tiradas ${roll1}, ${roll2} -> ${attackRoll})`;
    }

    const isCritical = attackRoll === 20 || hasCondition(target, 'Paralizado');
    const hitThreshold = target.ac;

    if (attackRoll >= hitThreshold) {
        let damage = Math.floor(Math.random() * 6) + 1; // 1d6
        if (isCritical) damage += Math.floor(Math.random() * 6) + 1; // Extra die for crit
        applyDamage(target.id, damage);
        logAction(attacker.id, `ataca a ${target.name} y le inflige ${damage} de daño ${isCritical ? '¡CRÍTICO!' : ''} ${rollDescription}.`);
    } else {
        logAction(attacker.id, `falla su ataque contra ${target.name} ${rollDescription}.`);
    }

    setIsTargeting({ attackerId: null });
    nextTurn();
  };

  const handleDefend = (participantId: string) => {
    applyCondition(participantId, 'Defendiendo', 1);
    logAction(participantId, 'adopta una postura defensiva.');
    nextTurn();
  };

  const handleFlee = (participantId: string) => {
    applyCondition(participantId, 'Huyó', -1);
    nextTurn();
  };

  const handleSelfHeal = (participantId: string) => {
    const healingAmount = Math.floor(Math.random() * 8) + 1;
    applyHealing(participantId, healingAmount);
    logAction(participantId, `se concentra y se cura ${healingAmount} puntos de vida.`);
    nextTurn();
  };

  const handleUseItem = (item: Item, participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant || hasCondition(participant, 'Muerto')) return;
    if (item.type === 'potion' && item.effect?.includes('heal')) {
      const healing = parseInt(item.effect.split(' ')[1], 10) || 5;
      applyHealing(participantId, healing);
      logAction(participantId, `usa ${item.name} y se cura ${healing} puntos de vida.`);
    }
    setParticipants(prev => prev.map(p => {
        if (p.id === participantId && p.data.inventory) {
            const newInv = [...p.data.inventory];
            const itemIndex = newInv.findIndex(i => i.id === item.id);
            if (itemIndex > -1) newInv.splice(itemIndex, 1);
            return { ...p, data: { ...p.data, inventory: newInv } };
        }
        return p;
    }));
    setItemUseModalOpen(false);
    nextTurn();
  };

  const handleRevive = () => {
    if (!defeatedCharacter) return;
    setParticipants(prev => prev.map(p => p.id === defeatedCharacter.id
          ? { ...p, hp: 1, conditions: [...p.conditions.filter(c => c.name !== 'Muerto' && c.name !== 'Inconsciente'), { name: 'Debilitado', duration: -1 }] }
          : p
    ));
    logAction(defeatedCharacter.id, 'es revivido, pero se siente debilitado.');
    setDefeatedCharacter(null);
  };

  const handleDestroy = () => {
    if (!defeatedCharacter) return;
    setParticipants(prev => prev.map(p => p.id === defeatedCharacter.id
          ? { ...p, conditions: [...p.conditions.filter(c => c.name !== 'Debilitado' && c.name !== 'Inconsciente'), { name: 'Muerto', duration: -1 }] }
          : p
    ));
    logAction(defeatedCharacter.id, 'ha muerto permanentemente.');
    setDefeatedCharacter(null);
  };

  const rollDice = (diceString: string): number => {
    const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return 0;
    const numDice = parseInt(match[1]);
    const numSides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * numSides) + 1;
    }
    return total + modifier;
  };

  const handleApplyAoeDamage = () => {
    if (aoeTargets.length === 0) {
      toast({ variant: 'destructive', title: 'No se seleccionaron objetivos.' });
      return;
    }
    const totalDamageDealt: { [key: string]: number } = {};
    aoeTargets.forEach(targetId => {
      const damage = rollDice(aoeDamage);
      applyDamage(targetId, damage);
      totalDamageDealt[targetId] = damage;
    });

    const targetNames = aoeTargets.map(id => participants.find(p => p.id === id)?.name || 'desconocido').join(', ');
    logAction('Sistema', `Lanza un ataque de área de ${aoeDamage} de daño de ${aoeDamageType} sobre ${targetNames}.`);

    setAoeModalOpen(false);
    setAoeTargets([]);
  };

  const resetCombat = () => {
    setParticipants([]);
    setCurrentRound(1);
    setCurrentTurn(0);
    setCombatLog([]);
    setIsInitiativeRolled(false);
    setSelectedParticipants({ characters: [], monsters: [] });
  };

  const getHpBarColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 60) return "bg-green-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (showRewardSystem) {
    return (
      <div className="min-h-screen bg-background p-4"><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-4"><EpicButton variant="ghost" onClick={onBack}>← Volver</EpicButton><h1 className="text-3xl font-bold text-primary"><Trophy className="w-8 h-8 inline mr-2" />Recompensas del Encuentro</h1></div><EpicButton onClick={resetCombat}>Finalizar</EpicButton></div><RewardSystem creatures={defeatedMonsters} partySize={participants.filter(p => p.type === 'character' && !hasCondition(p, 'Huyó')).length}/></div>
    );
  }

  const isTurnDisabled = (p: CombatParticipant) => hasCondition(p, 'Incapacitado') || hasCondition(p, 'Paralizado') || hasCondition(p, 'Aturdido') || hasCondition(p, 'Inconsciente');

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background p-4">
      {/* Header & Modals */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4"><EpicButton variant="ghost" onClick={onBack}>← Volver</EpicButton><h1 className="text-3xl font-bold text-primary">Sistema de Combate</h1></div>
        <div className="flex items-center gap-4"><Badge variant="outline" className="text-lg px-4 py-2">Ronda {currentRound}</Badge><EpicButton variant="outline" onClick={resetCombat}><RotateCcw className="w-4 h-4 mr-2" />Reiniciar</EpicButton></div>
      </div>
      <AlertDialog open={!!defeatedCharacter}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{defeatedCharacter?.name} ha caído!</AlertDialogTitle><AlertDialogDescription>El personaje ha llegado a 0 puntos de golpe. ¿Qué sucede ahora?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><EpicButton variant="outline" onClick={handleRevive}>Estabilizado (a 1 HP, Debilitado)</EpicButton><EpicButton variant="destructive" onClick={handleDestroy}>Muerto Permanentemente</EpicButton></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={conditionModal.open} onOpenChange={(open) => setConditionModal({ open, participantId: null })}>
        <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Gestionar Estados</DialogTitle><DialogDescription>Aplica o remueve estados para {participants.find(p => p.id === conditionModal.participantId)?.name}.</DialogDescription></DialogHeader><ScrollArea className="h-96"><div className="grid grid-cols-2 gap-4 py-4">{Object.entries(DND_CONDITIONS).map(([name, { description }]) => (<div key={name} className="flex items-center"><Tooltip><TooltipTrigger asChild><EpicButton size="sm" variant={participants.find(p => p.id === conditionModal.participantId)?.conditions.some(c => c.name === name) ? 'default' : 'outline'} onClick={() => {if (!conditionModal.participantId) return; const participant = participants.find(p => p.id === conditionModal.participantId); if (participant?.conditions.some(c => c.name === name)) { removeCondition(conditionModal.participantId, name); } else { applyCondition(conditionModal.participantId, name, -1); }}}>{name}</EpicButton></TooltipTrigger><TooltipContent><p className="max-w-xs">{description}</p></TooltipContent></Tooltip></div>))}</div></ScrollArea></DialogContent>
      </Dialog>

      <Dialog open={aoeModalOpen} onOpenChange={setAoeModalOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Ataque de Área (AoE)</DialogTitle>
                <DialogDescription>Selecciona los objetivos y define el daño del ataque.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Objetivos</Label>
                    <ScrollArea className="h-64 border rounded-md p-2">
                        {participants.filter(p => p.hp > 0 && !hasCondition(p, 'Huyó')).map(p => (
                            <div key={p.id} className="flex items-center space-x-2 my-1">
                                <Input
                                    type="checkbox"
                                    id={`aoe-target-${p.id}`}
                                    checked={aoeTargets.includes(p.id)}
                                    onChange={() => {
                                        setAoeTargets(prev =>
                                            prev.includes(p.id)
                                            ? prev.filter(id => id !== p.id)
                                            : [...prev, p.id]
                                        )
                                    }}
                                    className="h-4 w-4"
                                />
                                <label htmlFor={`aoe-target-${p.id}`}>{p.name}</label>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="aoe-damage">Daño (ej. 6d6)</Label>
                        <Input id="aoe-damage" value={aoeDamage} onChange={e => setAoeDamage(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="aoe-damage-type">Tipo de Daño</Label>
                        <Input id="aoe-damage-type" value={aoeDamageType} onChange={e => setAoeDamageType(e.target.value)} />
                    </div>
                    <EpicButton onClick={() => setAoeTargets(participants.filter(p => p.hp > 0 && p.type === 'character').map(p => p.id))}>Seleccionar PJs</EpicButton>
                    <EpicButton onClick={() => setAoeTargets(participants.filter(p => p.hp > 0 && p.type === 'monster').map(p => p.id))}>Seleccionar Monstruos</EpicButton>
                </div>
            </div>
            <DialogFooter>
                <EpicButton onClick={handleApplyAoeDamage} size="lg" className="w-full">Aplicar Daño a {aoeTargets.length} Objetivos</EpicButton>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {(!isInitiativeRolled && isNarratorMode) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-medieval border-primary/30"><h3 className="text-xl font-bold text-primary mb-4"><Users className="w-5 h-5 inline mr-2" />Personajes</h3><ScrollArea className="h-64"><div className="space-y-2">{characters.map(character => (<div key={character.id} className="flex items-center justify-between p-3 bg-muted rounded-md"><div><p className="font-medium">{character.name}</p><p className="text-sm text-muted-foreground">Nivel {character.level} {character.race} {character.class}</p></div><EpicButton variant={selectedParticipants.characters.includes(character.id) ? "default" : "outline"} size="sm" onClick={() => selectedParticipants.characters.includes(character.id) ? removeParticipant(character.id, 'character') : addCharacter(character)}>{selectedParticipants.characters.includes(character.id) ? "Remover" : "Agregar"}</EpicButton></div>))}</div></ScrollArea></Card>
          <Card className="p-6 bg-gradient-medieval border-accent/30"><h3 className="text-xl font-bold text-accent mb-4"><Sword className="w-5 h-5 inline mr-2" />Monstruos</h3><ScrollArea className="h-64"><div className="space-y-2">{monsters.slice(0, 10).map(monster => (<div key={monster.name} className="flex items-center justify-between p-3 bg-muted rounded-md"><div><p className="font-medium">{monster.name}</p><p className="text-sm text-muted-foreground">CR {monster.challengeRating} • CA {monster.armorClass} • {monster.hitPoints} HP</p></div><EpicButton variant="outline" size="sm" onClick={() => addMonster(monster)}><Plus className="w-4 h-4" /></EpicButton></div>))}</div></ScrollArea></Card>
          <div className="lg:col-span-2"><Card className="p-6 text-center bg-gradient-epic border-primary"><EpicButton variant="default" size="lg" onClick={rollInitiative} disabled={selectedParticipants.characters.length === 0 && selectedParticipants.monsters.length === 0} className="text-lg px-8 py-4"><Dice6 className="w-5 h-5 mr-2" />Rodar Iniciativa e Iniciar Combate</EpicButton></Card></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gradient-medieval border-primary/30"><h3 className="text-xl font-bold text-primary mb-4">Orden de Iniciativa</h3><div className="space-y-3">{participants.map((participant) => (<div key={participant.id} className={`p-4 rounded-lg border-2 transition-all ${participant.isActive ? 'border-primary bg-primary/10 shadow-lg' : 'border-muted bg-muted/50'} ${isTargeting.attackerId && isTargeting.attackerId !== participant.id && participant.hp > 0 ? 'cursor-crosshair hover:border-red-500' : ''} ${participant.hp === 0 || hasCondition(participant, 'Huyó') ? 'opacity-50' : ''} ${hasCondition(participant, 'Derribado') ? 'transform -rotate-6' : ''}`} onClick={() => isNarratorMode && isTargeting.attackerId && handleSelectTarget(participant.id)}><div className="flex items-center justify-between flex-wrap gap-y-2"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${participant.type === 'character' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>{participant.initiative}</div><div><p className="font-medium">{participant.name}</p><div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">{<Shield className="w-4 h-4" />}CA {participant.ac}{participant.conditions.length > 0 && <Separator orientation="vertical" className="h-4" />}{participant.conditions.map(c => (<Tooltip key={c.name}><TooltipTrigger><Badge variant="secondary" className={isTurnDisabled(participant) && c.name !== 'Inconsciente' ? 'bg-yellow-400' : ''}>{c.name}{c.duration > 0 ? ` (${c.duration})` : ''}</Badge></TooltipTrigger><TooltipContent><p className="max-w-xs">{DND_CONDITIONS[c.name as ConditionName]?.description || "Efecto personalizado."}</p></TooltipContent></Tooltip>))}</div></div></div><div className="flex items-center gap-3"><div className="w-32"><div className="flex items-center justify-between text-sm mb-1"><span className="text-muted-foreground">HP</span><span className="font-medium">{participant.hp}/{participant.maxHp}</span></div><div className="w-full bg-muted rounded-full h-2"><div className={`h-2 rounded-full transition-all ${getHpBarColor(participant.hp, participant.maxHp)}`} style={{ width: `${(participant.hp / participant.maxHp) * 100}%` }}/></div></div>{isNarratorMode && (<div className="flex gap-1"><EpicButton variant="outline" size="sm" onClick={() => applyDamage(participant.id, 5)}>-5</EpicButton><EpicButton variant="outline" size="sm" onClick={() => applyDamage(participant.id, 1)}>-1</EpicButton><EpicButton variant="outline" size="sm" onClick={() => applyHealing(participant.id, 1)}>+1</EpicButton><EpicButton variant="outline" size="sm" onClick={() => applyHealing(participant.id, 5)}>+5</EpicButton></div>)}</div></div>{isNarratorMode && participant.isActive && participant.hp > 0 && !hasCondition(participant, 'Muerto') && !isTargeting.attackerId && (<div className="mt-4 flex flex-wrap gap-2 justify-center border-t border-primary/20 pt-3"><EpicButton size="sm" onClick={() => handleAttack(participant.id)} disabled={isTurnDisabled(participant)}><Sword className="w-4 h-4 mr-2" />Atacar</EpicButton><EpicButton size="sm" onClick={() => handleDefend(participant.id)} disabled={isTurnDisabled(participant)}><ShieldCheck className="w-4 h-4 mr-2" />Defender</EpicButton><EpicButton size="sm" onClick={() => handleSelfHeal(participant.id)} disabled={isTurnDisabled(participant)}><HeartPulse className="w-4 h-4 mr-2" />Curarse</EpicButton><Dialog open={itemUseModalOpen} onOpenChange={setItemUseModalOpen}><DialogTrigger asChild><EpicButton size="sm" disabled={participant.type === 'monster' || !participant.data.inventory?.some(i => i.type === 'potion') || isTurnDisabled(participant)}><Package className="w-4 h-4 mr-2" />Usar Objeto</EpicButton></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Usar un objeto del inventario de {participant.name}</DialogTitle></DialogHeader><ScrollArea className="h-64"><div className="space-y-2">{(participant.data as Character).inventory?.filter(i => i.type === 'potion').map(item => (<div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded"><p>{item.name} <span className="text-muted-foreground text-xs">({item.description})</span></p><EpicButton size="sm" onClick={() => handleUseItem(item, participant.id)}>Usar</EpicButton></div>))}{(participant.data as Character).inventory?.filter(i => i.type === 'potion').length === 0 && (<p className="text-muted-foreground text-center">No hay objetos utilizables.</p>)}</div></ScrollArea></DialogContent></Dialog><EpicButton size="sm" onClick={() => setConditionModal({open: true, participantId: participant.id})}><Sparkles className="w-4 h-4 mr-2" />Estados</EpicButton><EpicButton size="sm" variant="destructive" onClick={() => handleFlee(participant.id)}><Footprints className="w-4 h-4 mr-2" />Huir</EpicButton></div>)}</div>))}</div>{isNarratorMode && <div className="mt-6 flex justify-center gap-4"><EpicButton onClick={() => setAoeModalOpen(true)} variant="destructive" size="lg"><Zap className="w-5 h-5 mr-2" />Ataque de Área</EpicButton><EpicButton onClick={nextTurn} size="lg" disabled={isTargeting.attackerId !== null}>Siguiente Turno</EpicButton></div>}</Card>
          </div>
          <Card className="p-6 bg-gradient-medieval border-accent/30"><h3 className="text-xl font-bold text-accent mb-4"><Zap className="w-5 h-5 inline mr-2" />Log de Combate</h3><ScrollArea className="h-96"><div className="space-y-2 text-sm">{combatLog.map(action => (<div key={action.id} className="p-3 bg-muted rounded-md"><div className="flex items-center justify-between"><span className="font-medium">{participants.find(p => p.id === action.participantId)?.name || 'Sistema'}</span><Badge variant="outline">R{action.round}</Badge></div><p className="text-muted-foreground mt-1">{action.action}</p></div>))}</div></ScrollArea></Card>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
};