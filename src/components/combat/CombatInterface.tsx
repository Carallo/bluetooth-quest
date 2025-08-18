import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sword, Shield, Heart, Zap, Users, Dice6, RotateCcw, Plus, Minus, Trophy, Run, ShieldCheck, HeartPulse, Package, Skull } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Character } from "@/data/characters";
import { Creature } from "@/data/bestiary";
import { Item } from "@/data/items";
import { RewardSystem } from "../narrator/RewardSystem";

interface CombatParticipant {
  id: string;
  name: string;
  type: 'character' | 'monster';
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  conditions: string[];
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
  const [defeatedCharacter, setDefeatedCharacter] = useState<CombatParticipant | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<{characters: string[], monsters: string[]}>({
    characters: [],
    monsters: []
  });
  const { toast } = useToast();
  const { startServer, stopServer, updateCombatState, startClient, stopClient } = useBluetooth();

  // Bi-directional sync effect
  useEffect(() => {
    // Narrator broadcasts state
    if (isNarratorMode) {
      if (participants.length > 0) {
        updateCombatState(JSON.stringify(participants));
      }
    }
  }, [participants, isNarratorMode, updateCombatState]);

  // Bluetooth connection management effect
  useEffect(() => {
    if (isNarratorMode) {
      startServer();
      return () => {
        stopServer();
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
        }
      };
      startClient(connectedDeviceId, handleStateUpdate);
      return () => {
        stopClient();
      };
    }
  }, [isNarratorMode, connectedDeviceId, startServer, stopServer, startClient, stopClient]);

  useEffect(() => {
    const aliveCharacters = participants.filter(p => p.type === 'character' && p.hp > 0 && !p.conditions.includes('Huyó'));
    const aliveMonsters = participants.filter(p => p.type === 'monster' && p.hp > 0 && !p.conditions.includes('Huyó'));

    if (!isInitiativeRolled) return;

    if (aliveMonsters.length === 0 && participants.some(p => p.type === 'monster')) {
      toast({
        title: "¡Victoria!",
        description: "Todos los monstruos han sido derrotados.",
        duration: 5000,
      });
      const allMonsters = participants
        .filter(p => p.type === 'monster')
        .map(p => p.data as Creature);
      setDefeatedMonsters(allMonsters);
      setShowRewardSystem(true);
    } else if (aliveCharacters.length === 0 && participants.some(p => p.type === 'character')) {
        toast({
            title: "¡Derrota!",
            description: "Todos los personajes han sido derrotados o han huido.",
            duration: 5000,
        });
        // Here we could trigger the defeat mechanics (revive/destroy)
    }
  }, [participants, isInitiativeRolled, toast]);

  // Agregar participantes al combate
  const addCharacter = (character: Character) => {
    if (selectedParticipants.characters.includes(character.id)) return;
    
    setSelectedParticipants(prev => ({
      ...prev,
      characters: [...prev.characters, character.id]
    }));
  };

  const addMonster = (monster: Creature) => {
    const monsterId = `${monster.name}-${Date.now()}`;
    setSelectedParticipants(prev => ({
      ...prev,
      monsters: [...prev.monsters, monsterId]
    }));
  };

  const removeParticipant = (id: string, type: 'character' | 'monster') => {
    setSelectedParticipants(prev => ({
      ...prev,
      [type === 'character' ? 'characters' : 'monsters']: 
        prev[type === 'character' ? 'characters' : 'monsters'].filter(p => p !== id)
    }));
  };

  // Tirar iniciativa
  const rollInitiative = () => {
    const newParticipants: CombatParticipant[] = [];

    // Agregar personajes seleccionados
    selectedParticipants.characters.forEach(charId => {
      const character = characters.find(c => c.id === charId);
      if (character) {
        const dexModifier = Math.floor((character.stats.dexterity - 10) / 2);
        const initiative = Math.floor(Math.random() * 20) + 1 + dexModifier;
        newParticipants.push({
          id: character.id,
          name: character.name,
          type: 'character',
          hp: character.hitPoints.current,
          maxHp: character.hitPoints.maximum,
          ac: character.armorClass,
          initiative,
          conditions: [],
          isActive: false,
          data: character
        });
      }
    });

    // Agregar monstruos seleccionados
    selectedParticipants.monsters.forEach(monsterId => {
      const monsterName = monsterId.split('-')[0];
      const monster = monsters.find(m => m.name === monsterName);
      if (monster) {
        const initiative = Math.floor(Math.random() * 20) + 1 + Math.floor((monster.dexterity - 10) / 2);
        newParticipants.push({
          id: monsterId,
          name: monster.name,
          type: 'monster',
          hp: monster.hitPoints,
          maxHp: monster.hitPoints,
          ac: monster.armorClass,
          initiative,
          conditions: [],
          isActive: false,
          data: monster
        });
      }
    });

    // Ordenar por iniciativa (mayor a menor)
    newParticipants.sort((a, b) => b.initiative - a.initiative);
    
    // El primer participante está activo
    if (newParticipants.length > 0) {
      newParticipants[0].isActive = true;
    }

    setParticipants(newParticipants);
    setIsInitiativeRolled(true);
    setCurrentTurn(0);
    setCurrentRound(1);

    toast({
      title: "Iniciativa rodada",
      description: "¡El combate ha comenzado!",
    });
  };

  const logAction = (participantId: string, action: string, target?: string, damage?: number, healing?: number) => {
    const newAction: CombatAction = {
      id: Date.now().toString(),
      participantId,
      action,
      target,
      damage,
      healing,
      round: currentRound,
      timestamp: Date.now()
    };
    setCombatLog(prev => [newAction, ...prev]);
  };

  // Siguiente turno
  const nextTurn = () => {
    let nextTurnIndex = (currentTurn + 1) % participants.length;

    // Find the next participant that is not dead or fled
    while (participants[nextTurnIndex].hp === 0 || participants[nextTurnIndex].conditions.includes('Huyó')) {
        nextTurnIndex = (nextTurnIndex + 1) % participants.length;
        // If we loop back to the start, something is wrong, but this is a safeguard
        if (nextTurnIndex === currentTurn) break;
    }

    setParticipants(prev => {
      const newParticipants = prev.map((p, index) => {
        const isCurrent = index === currentTurn;
        const isNext = index === nextTurnIndex;

        // Deactivate current participant
        if (isCurrent) {
          return { ...p, isActive: false };
        }

        // Activate next participant and remove 'Defendiendo' status
        if (isNext) {
          return {
            ...p,
            isActive: true,
            conditions: p.conditions.filter(c => c !== 'Defendiendo'),
          };
        }

        return p;
      });
      return newParticipants;
    });

    if (nextTurnIndex < currentTurn) {
      setCurrentRound(prev => prev + 1);
    }
    setCurrentTurn(nextTurnIndex);
  };

  // Aplicar daño
  const applyDamage = (participantId: string, damage: number) => {
    let defeatedChar: CombatParticipant | null = null;
    setParticipants(prev => 
      prev.map(p => {
        if (p.id === participantId) {
          const newHp = Math.max(0, p.hp - damage);
          if (newHp === 0 && p.type === 'character') {
            defeatedChar = { ...p, hp: 0 };
          }
          return { ...p, hp: newHp };
        }
        return p;
      })
    );

    if (defeatedChar) {
      setDefeatedCharacter(defeatedChar);
    }

    const participant = participants.find(p => p.id === participantId);
    if (participant) {
        logAction(participantId, `recibe ${damage} de daño.`);
    }
  };

  // Aplicar curación
  const applyHealing = (participantId: string, healing: number) => {
    setParticipants(prev => 
      prev.map(p => {
        if (p.id === participantId && !p.conditions.includes('Muerto')) {
          return { ...p, hp: Math.min(p.maxHp, p.hp + healing) };
        }
        return p;
      })
    );
    const participant = participants.find(p => p.id === participantId);
    if (participant && !participant.conditions.includes('Muerto')) {
        logAction(participantId, `recibe ${healing} de curación.`);
    }
  };

  const handleAttack = (attackerId: string) => {
    setIsTargeting({ attackerId });
    toast({ title: "Selecciona un objetivo", description: "Haz clic en el participante que deseas atacar." });
  };

  const handleSelectTarget = (targetId: string) => {
    if (!isTargeting.attackerId) return;

    const attacker = participants.find(p => p.id === isTargeting.attackerId);
    const target = participants.find(p => p.id === targetId);

    if (!attacker || !target || attacker.id === target.id || target.hp === 0) {
      setIsTargeting({ attackerId: null });
      toast({ variant: "destructive", title: "Objetivo inválido" });
      return;
    }

    // Simplified attack logic
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const isDefending = target.conditions.includes('Defendiendo');
    // In a real scenario, we'd use attacker's bonus vs target's AC.
    // For now, let's say >10 hits, or >15 if defending.
    const hitThreshold = isDefending ? 15 : 10;

    if (attackRoll >= hitThreshold) {
        const damage = Math.floor(Math.random() * 6) + 1; // 1d6 damage
        applyDamage(target.id, damage);
        logAction(attacker.id, `ataca a ${target.name} y le inflige ${damage} de daño (tirada ${attackRoll}).`);
    } else {
        logAction(attacker.id, `falla su ataque contra ${target.name} (tirada ${attackRoll}).`);
    }

    setIsTargeting({ attackerId: null });
    nextTurn();
  };

  const handleDefend = (participantId: string) => {
    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId ? { ...p, conditions: [...p.conditions, 'Defendiendo'] } : p
      )
    );
    logAction(participantId, 'adopta una postura defensiva.');
    nextTurn();
  };

  const handleFlee = (participantId: string) => {
    setParticipants(prev =>
        prev.map(p =>
          p.id === participantId ? { ...p, conditions: [...p.conditions, 'Huyó'] } : p
        )
    );
    logAction(participantId, 'ha huido del combate.');
    nextTurn();
  };

  const handleSelfHeal = (participantId: string) => {
    const healingAmount = Math.floor(Math.random() * 8) + 1; // 1d8
    applyHealing(participantId, healingAmount);
    logAction(participantId, `se concentra y se cura ${healingAmount} puntos de vida.`);
    nextTurn();
  };

  const handleUseItem = (item: Item, participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant || participant.conditions.includes('Muerto')) return;

    // For now, we only handle healing potions
    if (item.type === 'potion' && item.effect?.includes('heal')) {
      const healing = parseInt(item.effect.split(' ')[1], 10) || 5;
      applyHealing(participantId, healing);
      logAction(participantId, `usa ${item.name} y se cura ${healing} puntos de vida.`);
    }

    // Consume item - This is a local mutation, ideally this should be handled by a global state manager
    const updatedParticipants = participants.map(p => {
        if (p.id === participantId && p.data.inventory) {
            const newInventory = [...p.data.inventory];
            const itemIndex = newInventory.findIndex(i => i.id === item.id);
            if (itemIndex > -1) {
                newInventory.splice(itemIndex, 1);
            }
            return { ...p, data: { ...p.data, inventory: newInventory } };
        }
        return p;
    });
    setParticipants(updatedParticipants);

    setItemUseModalOpen(false);
    nextTurn();
  };

  const handleRevive = () => {
    if (!defeatedCharacter) return;
    setParticipants(prev =>
      prev.map(p =>
        p.id === defeatedCharacter.id
          ? { ...p, hp: 1, conditions: [...p.conditions.filter(c => c !== 'Muerto'), 'Debilitado'] }
          : p
      )
    );
    logAction(defeatedCharacter.id, 'es revivido, pero se siente debilitado.');
    setDefeatedCharacter(null);
  };

  const handleDestroy = () => {
    if (!defeatedCharacter) return;
    setParticipants(prev =>
      prev.map(p =>
        p.id === defeatedCharacter.id
          ? { ...p, conditions: [...p.conditions.filter(c => c !== 'Debilitado'), 'Muerto'] }
          : p
      )
    );
    logAction(defeatedCharacter.id, 'ha muerto permanentemente.');
    setDefeatedCharacter(null);
     // Here we would call a function passed via props to permanently delete the character from the game state
  };

  // Reiniciar combate
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
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <EpicButton variant="ghost" onClick={onBack}>
              ← Volver
            </EpicButton>
            <h1 className="text-3xl font-bold text-primary">
              <Trophy className="w-8 h-8 inline mr-2" />
              Recompensas del Encuentro
            </h1>
          </div>
          <EpicButton onClick={resetCombat}>
            Finalizar
          </EpicButton>
        </div>
        <RewardSystem
          creatures={defeatedMonsters}
          partySize={participants.filter(p => p.type === 'character').length}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <EpicButton variant="ghost" onClick={onBack}>
            ← Volver
          </EpicButton>
          <h1 className="text-3xl font-bold text-primary">Sistema de Combate</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Ronda {currentRound}
          </Badge>
          <EpicButton variant="outline" onClick={resetCombat}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </EpicButton>
        </div>
      </div>

      {(!isInitiativeRolled && isNarratorMode) ? (
        /* Configuración del combate (solo para el narrador) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selección de personajes */}
          <Card className="p-6 bg-gradient-medieval border-primary/30">
            <h3 className="text-xl font-bold text-primary mb-4">
              <Users className="w-5 h-5 inline mr-2" />
              Personajes
            </h3>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {characters.map(character => (
                  <div key={character.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">{character.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Nivel {character.level} {character.race} {character.class}
                      </p>
                    </div>
                    <EpicButton
                      variant={selectedParticipants.characters.includes(character.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => 
                        selectedParticipants.characters.includes(character.id)
                          ? removeParticipant(character.id, 'character')
                          : addCharacter(character)
                      }
                    >
                      {selectedParticipants.characters.includes(character.id) ? "Remover" : "Agregar"}
                    </EpicButton>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Selección de monstruos */}
          <Card className="p-6 bg-gradient-medieval border-accent/30">
            <h3 className="text-xl font-bold text-accent mb-4">
              <Sword className="w-5 h-5 inline mr-2" />
              Monstruos
            </h3>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {monsters.slice(0, 10).map(monster => (
                  <div key={monster.name} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">{monster.name}</p>
                      <p className="text-sm text-muted-foreground">
                        CR {monster.challengeRating} • CA {monster.armorClass} • {monster.hitPoints} HP
                      </p>
                    </div>
                    <EpicButton
                      variant="outline"
                      size="sm"
                      onClick={() => addMonster(monster)}
                    >
                      <Plus className="w-4 h-4" />
                    </EpicButton>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Botón para iniciar combate */}
          <div className="lg:col-span-2">
            <Card className="p-6 text-center bg-gradient-epic border-primary">
              <EpicButton
                variant="default"
                size="lg"
                onClick={rollInitiative}
                disabled={selectedParticipants.characters.length === 0 && selectedParticipants.monsters.length === 0}
                className="text-lg px-8 py-4"
              >
                <Dice6 className="w-5 h-5 mr-2" />
                Rodar Iniciativa e Iniciar Combate
              </EpicButton>
            </Card>
          </div>
        </div>
      ) : (
        /* Interface de combate activo */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orden de iniciativa y participantes */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gradient-medieval border-primary/30">
              <h3 className="text-xl font-bold text-primary mb-4">Orden de Iniciativa</h3>
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      participant.isActive 
                        ? 'border-primary bg-primary/10 shadow-lg' 
                        : 'border-muted bg-muted/50'
                    } ${isTargeting.attackerId && isTargeting.attackerId !== participant.id && participant.hp > 0 ? 'cursor-crosshair hover:border-red-500' : ''}
                    ${participant.hp === 0 || participant.conditions.includes('Huyó') ? 'opacity-50' : ''}
                    `}
                    onClick={() => isNarratorMode && isTargeting.attackerId && handleSelectTarget(participant.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          participant.type === 'character' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {participant.initiative}
                        </div>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="w-4 h-4" />
                            CA {participant.ac}
                            {participant.conditions.length > 0 && <Separator orientation="vertical" className="h-4" />}
                            {participant.conditions.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Barra de HP */}
                        <div className="w-32">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">HP</span>
                            <span className="font-medium">{participant.hp}/{participant.maxHp}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getHpBarColor(participant.hp, participant.maxHp)}`}
                              style={{ width: `${(participant.hp / participant.maxHp) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Controles de HP Manuales (solo narrador) */}
                        {isNarratorMode && (
                          <div className="flex gap-1">
                            <Input type="number" defaultValue={5} className="w-16 h-9" id={`dmg-${participant.id}`} />
                            <EpicButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                  const input = document.getElementById(`dmg-${participant.id}`) as HTMLInputElement;
                                  applyDamage(participant.id, parseInt(input.value) || 5)
                              }}
                            >
                              <Minus className="w-4 h-4"/>
                            </EpicButton>
                            <EpicButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                  const input = document.getElementById(`dmg-${participant.id}`) as HTMLInputElement;
                                  applyHealing(participant.id, parseInt(input.value) || 5)
                              }}
                            >
                              <Plus className="w-4 h-4"/>
                            </EpicButton>
                          </div>
                        )}
                      </div>
                    </div>
                    {isNarratorMode && participant.isActive && participant.hp > 0 && !participant.conditions.includes('Muerto') && !isTargeting.attackerId && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-center border-t border-primary/20 pt-3">
                            <EpicButton size="sm" onClick={() => handleAttack(participant.id)}>
                                <Sword className="w-4 h-4 mr-2" />
                                Atacar
                            </EpicButton>
                            <EpicButton size="sm" onClick={() => handleDefend(participant.id)}>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Defender
                            </EpicButton>
                             <EpicButton size="sm" onClick={() => handleSelfHeal(participant.id)}>
                                <HeartPulse className="w-4 h-4 mr-2" />
                                Curarse
                            </EpicButton>
                            <Dialog open={itemUseModalOpen} onOpenChange={setItemUseModalOpen}>
                                <DialogTrigger asChild>
                                    <EpicButton size="sm" onClick={() => setItemUseModalOpen(true)} disabled={participant.type === 'monster' || !participant.data.inventory?.some(i => i.type === 'potion')}>
                                        <Package className="w-4 h-4 mr-2" />
                                        Usar Objeto
                                    </EpicButton>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Usar un objeto del inventario de {participant.name}</DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="h-64">
                                        <div className="space-y-2">
                                            {(participant.data as Character).inventory?.filter(i => i.type === 'potion').map(item => (
                                                <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                                                    <p>{item.name} <span className="text-muted-foreground text-xs">({item.description})</span></p>
                                                    <EpicButton size="sm" onClick={() => handleUseItem(item, participant.id)}>Usar</EpicButton>
                                                </div>
                                            ))}
                                             {(participant.data as Character).inventory?.filter(i => i.type === 'potion').length === 0 && (
                                                <p className="text-muted-foreground text-center">No hay objetos utilizables.</p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                            <EpicButton size="sm" variant="destructive" onClick={() => handleFlee(participant.id)}>
                                <Run className="w-4 h-4 mr-2" />
                                Huir
                            </EpicButton>
                        </div>
                    )}
                  </div>
                ))}
              </div>

              {isNarratorMode && <div className="mt-6 flex justify-center">
                <EpicButton onClick={nextTurn} size="lg" disabled={isTargeting.attackerId !== null}>
                  Siguiente Turno
                </EpicButton>
              </div>}
            </Card>
          </div>

          {/* Log de combate */}
          <Card className="p-6 bg-gradient-medieval border-accent/30">
            <h3 className="text-xl font-bold text-accent mb-4">
              <Zap className="w-5 h-5 inline mr-2" />
              Log de Combate
            </h3>
            <ScrollArea className="h-96">
              <div className="space-y-2 text-sm">
                {combatLog.map(action => (
                  <div key={action.id} className="p-3 bg-muted rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {participants.find(p => p.id === action.participantId)?.name || 'Sistema'}
                      </span>
                      <Badge variant="outline">R{action.round}</Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {action.action}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
};