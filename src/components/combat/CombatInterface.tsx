import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sword, Shield, Heart, Zap, Users, Dice6, RotateCcw, Plus, Minus, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Character } from "@/data/characters";
import { Creature } from "@/data/bestiary";
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
}

export const CombatInterface = ({ characters, monsters, onBack }: CombatInterfaceProps) => {
  const [participants, setParticipants] = useState<CombatParticipant[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [combatLog, setCombatLog] = useState<CombatAction[]>([]);
  const [isInitiativeRolled, setIsInitiativeRolled] = useState(false);
  const [showRewardSystem, setShowRewardSystem] = useState(false);
  const [defeatedMonsters, setDefeatedMonsters] = useState<Creature[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<{characters: string[], monsters: string[]}>({
    characters: [],
    monsters: []
  });
  const { toast } = useToast();

  useEffect(() => {
    const aliveMonsters = participants.filter(p => p.type === 'monster' && p.hp > 0);
    if (isInitiativeRolled && aliveMonsters.length === 0 && participants.some(p => p.type === 'monster')) {
      toast({
        title: "¡Combate finalizado!",
        description: "Todos los monstruos han sido derrotados.",
        duration: 5000,
      });
      const allMonsters = participants
        .filter(p => p.type === 'monster')
        .map(p => p.data as Creature);
      setDefeatedMonsters(allMonsters);
      setShowRewardSystem(true);
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

  // Siguiente turno
  const nextTurn = () => {
    setParticipants(prev => {
      const newParticipants = [...prev];
      newParticipants[currentTurn].isActive = false;
      
      const nextTurnIndex = (currentTurn + 1) % newParticipants.length;
      newParticipants[nextTurnIndex].isActive = true;
      
      return newParticipants;
    });

    if (currentTurn === participants.length - 1) {
      setCurrentRound(prev => prev + 1);
      setCurrentTurn(0);
    } else {
      setCurrentTurn(prev => prev + 1);
    }
  };

  // Aplicar daño
  const applyDamage = (participantId: string, damage: number) => {
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, hp: Math.max(0, p.hp - damage) }
          : p
      )
    );

    const action: CombatAction = {
      id: Date.now().toString(),
      participantId,
      action: `Recibe ${damage} de daño`,
      damage,
      round: currentRound,
      timestamp: Date.now()
    };

    setCombatLog(prev => [action, ...prev]);
  };

  // Aplicar curación
  const applyHealing = (participantId: string, healing: number) => {
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, hp: Math.min(p.maxHp, p.hp + healing) }
          : p
      )
    );

    const action: CombatAction = {
      id: Date.now().toString(),
      participantId,
      action: `Recibe ${healing} de curación`,
      healing,
      round: currentRound,
      timestamp: Date.now()
    };

    setCombatLog(prev => [action, ...prev]);
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

      {!isInitiativeRolled ? (
        /* Configuración del combate */
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
                    }`}
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

                        {/* Controles de HP */}
                        <div className="flex gap-1">
                          <EpicButton
                            variant="outline"
                            size="sm"
                            onClick={() => applyDamage(participant.id, 5)}
                          >
                            -5
                          </EpicButton>
                          <EpicButton
                            variant="outline"
                            size="sm"
                            onClick={() => applyHealing(participant.id, 5)}
                          >
                            +5
                          </EpicButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <EpicButton onClick={nextTurn} size="lg">
                  Siguiente Turno
                </EpicButton>
              </div>
            </Card>
          </div>

          {/* Log de combate */}
          <Card className="p-6 bg-gradient-medieval border-accent/30">
            <h3 className="text-xl font-bold text-accent mb-4">
              <Zap className="w-5 h-5 inline mr-2" />
              Log de Combate
            </h3>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {combatLog.map(action => (
                  <div key={action.id} className="p-3 bg-muted rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {participants.find(p => p.id === action.participantId)?.name}
                      </span>
                      <Badge variant="outline">R{action.round}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
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