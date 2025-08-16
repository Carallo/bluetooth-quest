import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Users, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOfflineData } from "@/hooks/useOfflineData";
import { Character, races, classes, backgrounds, alignments, getStatModifier, getProficiencyBonus } from "@/data/characters";

interface CharacterManagerProps {
  onSelectCharacters: (characters: Character[]) => void;
  selectedCharacters: Character[];
}

export const CharacterManager = ({ onSelectCharacters, selectedCharacters }: CharacterManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [newCharacter, setNewCharacter] = useState<Partial<Character>>({
    name: '',
    race: '',
    class: '',
    level: 1,
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
  });
  
  const { data, saveCharacter, deleteCharacter: removeCharacter } = useOfflineData();
  const { toast } = useToast();

  const characters = data.characters;

  const createCharacter = () => {
    if (!newCharacter.name || !newCharacter.race || !newCharacter.class) {
      toast({
        title: "Error",
        description: "Nombre, raza y clase son requeridos",
        variant: "destructive"
      });
      return;
    }

    const selectedClass = classes.find(c => c.name === newCharacter.class);
    const hitPoints = (selectedClass?.hitDie || 8) + getStatModifier(newCharacter.stats?.constitution || 10);

    const character: Character = {
      id: Date.now().toString(),
      name: newCharacter.name!,
      race: newCharacter.race!,
      class: newCharacter.class!,
      level: newCharacter.level || 1,
      experience: 0,
      hitPoints: {
        current: hitPoints,
        maximum: hitPoints,
        temporary: 0
      },
      armorClass: 10 + getStatModifier(newCharacter.stats?.dexterity || 10),
      proficiencyBonus: getProficiencyBonus(newCharacter.level || 1),
      speed: 30,
      stats: newCharacter.stats!,
      savingThrows: {
        strength: false,
        dexterity: false,
        constitution: false,
        intelligence: false,
        wisdom: false,
        charisma: false
      },
      skills: {},
      equipment: [],
      spells: [],
      background: backgrounds[0],
      alignment: alignments[4], // Neutral Verdadero
      gold: 100,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveCharacter(character);
    setIsCreating(false);
    setNewCharacter({
      name: '',
      race: '',
      class: '',
      level: 1,
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      }
    });

    toast({
      title: "Personaje creado",
      description: `${character.name} ha sido creado exitosamente`,
    });
  };

  const deleteCharacter = (id: string) => {
    removeCharacter(id);
    
    // Remove from selected if it was selected
    const updatedSelected = selectedCharacters.filter(c => c.id !== id);
    onSelectCharacters(updatedSelected);

    toast({
      title: "Personaje eliminado",
      description: "El personaje ha sido eliminado"
    });
  };

  const toggleCharacterSelection = (character: Character) => {
    const isSelected = selectedCharacters.find(c => c.id === character.id);
    if (isSelected) {
      onSelectCharacters(selectedCharacters.filter(c => c.id !== character.id));
    } else {
      onSelectCharacters([...selectedCharacters, character]);
    }
  };

  const rollStats = () => {
    const rollStat = () => {
      const rolls = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    setNewCharacter(prev => ({
      ...prev,
      stats: {
        strength: rollStat(),
        dexterity: rollStat(),
        constitution: rollStat(),
        intelligence: rollStat(),
        wisdom: rollStat(),
        charisma: rollStat()
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-primary">
          <Users className="w-5 h-5 inline mr-2" />
          Personajes de la Campaña
        </h3>
        <div className="flex gap-2">
          <Badge variant="outline">
            {selectedCharacters.length} seleccionados
          </Badge>
          <EpicButton onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Personaje
          </EpicButton>
        </div>
      </div>

      {isCreating && (
        <Card className="p-6 bg-gradient-medieval border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-primary">Crear Nuevo Personaje</h4>
            <EpicButton variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
              <X className="w-4 h-4" />
            </EpicButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <Input
                value={newCharacter.name || ''}
                onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del personaje"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Raza</label>
              <Select value={newCharacter.race} onValueChange={(value) => setNewCharacter(prev => ({ ...prev, race: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar raza" />
                </SelectTrigger>
                <SelectContent>
                  {races.map(race => (
                    <SelectItem key={race.name} value={race.name}>{race.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Clase</label>
              <Select value={newCharacter.class} onValueChange={(value) => setNewCharacter(prev => ({ ...prev, class: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar clase" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nivel</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={newCharacter.level || 1}
                onChange={(e) => setNewCharacter(prev => ({ ...prev, level: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium">Estadísticas</h5>
              <EpicButton variant="outline" size="sm" onClick={rollStats}>
                Rodar Estadísticas
              </EpicButton>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(newCharacter.stats || {}).map(([stat, value]) => (
                <div key={stat}>
                  <label className="block text-sm font-medium mb-1 capitalize">{stat}</label>
                  <Input
                    type="number"
                    min="3"
                    max="20"
                    value={value}
                    onChange={(e) => setNewCharacter(prev => ({
                      ...prev,
                      stats: {
                        ...prev.stats!,
                        [stat]: parseInt(e.target.value)
                      }
                    }))}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Modificador: {getStatModifier(value) >= 0 ? '+' : ''}{getStatModifier(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <EpicButton onClick={createCharacter}>
              <Save className="w-4 h-4 mr-2" />
              Crear Personaje
            </EpicButton>
            <EpicButton variant="outline" onClick={() => setIsCreating(false)}>
              Cancelar
            </EpicButton>
          </div>
        </Card>
      )}

      {/* Characters List */}
      <Card className="p-6 bg-gradient-medieval border-primary/30">
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {characters.map(character => (
              <div
                key={character.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedCharacters.find(c => c.id === character.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-muted bg-muted/50 hover:bg-muted/80'
                }`}
                onClick={() => toggleCharacterSelection(character)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{character.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Nivel {character.level} {character.race} {character.class}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>CA {character.armorClass}</span>
                      <span>HP {character.hitPoints.current}/{character.hitPoints.maximum}</span>
                      <span>Oro {character.gold}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedCharacters.find(c => c.id === character.id) ? "default" : "outline"}>
                      {selectedCharacters.find(c => c.id === character.id) ? "Seleccionado" : "Disponible"}
                    </Badge>
                    <EpicButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCharacter(character.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </EpicButton>
                  </div>
                </div>
              </div>
            ))}

            {characters.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay personajes creados</p>
                <p className="text-sm">Crea personajes para tus jugadores</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};