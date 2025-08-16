import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Search, 
  Zap,
  Star,
  Clock,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  damage?: string;
  savingThrow?: string;
  prepared?: boolean;
}

interface SpellManagerProps {
  characterId: string;
  characterLevel: number;
  characterClass: string;
  knownSpells: string[];
  onUpdateSpells: (spells: string[]) => void;
}

const spellDatabase: Spell[] = [
  {
    id: "magic-missile",
    name: "Proyectil Mágico",
    level: 1,
    school: "Evocación",
    castingTime: "1 acción",
    range: "120 pies",
    components: "V, S",
    duration: "Instantáneo",
    description: "Creas tres dardos brillantes de fuerza mágica. Cada dardo impacta automáticamente a una criatura que puedas ver dentro del alcance.",
    damage: "1d4+1 por dardo"
  },
  {
    id: "cure-wounds",
    name: "Curar Heridas",
    level: 1,
    school: "Evocación",
    castingTime: "1 acción",
    range: "Toque",
    components: "V, S",
    duration: "Instantáneo",
    description: "Una criatura que toques recupera puntos de golpe igual a 1d8 + tu modificador de aptitud mágica.",
    damage: "1d8 + mod. aptitud (curación)"
  },
  {
    id: "shield",
    name: "Escudo",
    level: 1,
    school: "Abjuración",
    castingTime: "1 reacción",
    range: "Personal",
    components: "V, S",
    duration: "1 ronda",
    description: "Una barrera invisible de fuerza mágica aparece y te protege. Hasta el inicio de tu próximo turno, tienes un bonificador +5 a la CA."
  },
  {
    id: "fireball",
    name: "Bola de Fuego",
    level: 3,
    school: "Evocación",
    castingTime: "1 acción",
    range: "150 pies",
    components: "V, S, M",
    duration: "Instantáneo",
    description: "Una brillante raya se dispara desde tu dedo apuntando hacia un punto que elijas dentro del alcance y luego florece con un rugido bajo en una explosión de llama.",
    damage: "8d6 fuego",
    savingThrow: "Destreza CD 15"
  },
  {
    id: "healing-word",
    name: "Palabra de Curación",
    level: 1,
    school: "Evocación",
    castingTime: "1 acción adicional",
    range: "60 pies",
    components: "V",
    duration: "Instantáneo",
    description: "Una criatura de tu elección que puedas ver dentro del alcance recupera puntos de golpe igual a 1d4 + tu modificador de aptitud mágica.",
    damage: "1d4 + mod. aptitud (curación)"
  },
  {
    id: "mage-armor",
    name: "Armadura de Mago",
    level: 1,
    school: "Abjuración",
    castingTime: "1 acción",
    range: "Toque",
    components: "V, S, M",
    duration: "8 horas",
    description: "Tocas a una criatura voluntaria que no lleve armadura. Hasta que el hechizo termine, la CA base del objetivo se convierte en 13 + su modificador de Destreza."
  },
  {
    id: "detect-magic",
    name: "Detectar Magia",
    level: 1,
    school: "Adivinación",
    castingTime: "1 acción",
    range: "Personal",
    components: "V, S",
    duration: "Concentración, hasta 10 minutos",
    description: "Durante la duración, sientes la presencia de magia a 30 pies de ti."
  },
  {
    id: "sleep",
    name: "Sueño",
    level: 1,
    school: "Encantamiento",
    castingTime: "1 acción",
    range: "90 pies",
    components: "V, S, M",
    duration: "1 minuto",
    description: "Este hechizo envía a las criaturas a un sueño mágico. Tira 5d8; el total es cuántos puntos de golpe de criaturas afecta este hechizo.",
    savingThrow: "Sabiduría niega"
  }
];

export const SpellManager = ({ 
  characterId, 
  characterLevel, 
  characterClass, 
  knownSpells, 
  onUpdateSpells 
}: SpellManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const { toast } = useToast();

  const canCastSpells = ['Bardo', 'Clérigo', 'Druida', 'Hechicero', 'Brujo', 'Mago', 'Paladín', 'Explorador'].includes(characterClass);

  const getMaxSpellLevel = () => {
    if (!canCastSpells) return 0;
    if (characterLevel >= 17) return 9;
    if (characterLevel >= 15) return 8;
    if (characterLevel >= 13) return 7;
    if (characterLevel >= 11) return 6;
    if (characterLevel >= 9) return 5;
    if (characterLevel >= 7) return 4;
    if (characterLevel >= 5) return 3;
    if (characterLevel >= 3) return 2;
    if (characterLevel >= 1) return 1;
    return 0;
  };

  const filteredSpells = spellDatabase.filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spell.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || spell.level.toString() === selectedLevel;
    const matchesSchool = selectedSchool === "all" || spell.school === selectedSchool;
    const canLearn = spell.level <= getMaxSpellLevel();
    
    return matchesSearch && matchesLevel && matchesSchool && canLearn;
  });

  const learnSpell = (spell: Spell) => {
    if (knownSpells.includes(spell.id)) {
      toast({
        title: "Hechizo ya conocido",
        description: `Ya conoces ${spell.name}`,
        variant: "destructive"
      });
      return;
    }

    const updatedSpells = [...knownSpells, spell.id];
    onUpdateSpells(updatedSpells);

    toast({
      title: "Hechizo aprendido",
      description: `Has aprendido ${spell.name}`
    });
  };

  const forgetSpell = (spellId: string) => {
    const updatedSpells = knownSpells.filter(id => id !== spellId);
    onUpdateSpells(updatedSpells);

    const spell = spellDatabase.find(s => s.id === spellId);
    toast({
      title: "Hechizo olvidado",
      description: `Has olvidado ${spell?.name}`
    });
  };

  const getKnownSpellsData = () => {
    return spellDatabase.filter(spell => knownSpells.includes(spell.id));
  };

  const getSchoolColor = (school: string) => {
    switch (school) {
      case 'Evocación': return 'text-red-400';
      case 'Abjuración': return 'text-blue-400';
      case 'Conjuración': return 'text-green-400';
      case 'Adivinación': return 'text-purple-400';
      case 'Encantamiento': return 'text-pink-400';
      case 'Ilusión': return 'text-indigo-400';
      case 'Necromancia': return 'text-gray-400';
      case 'Transmutación': return 'text-yellow-400';
      default: return 'text-muted-foreground';
    }
  };

  if (!canCastSpells) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Sin Magia</h3>
          <p className="text-muted-foreground">
            La clase {characterClass} no puede lanzar hechizos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información de lanzamiento */}
      <Card>
        <CardHeader>
          <CardTitle>Capacidad Mágica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{getKnownSpellsData().length}</div>
              <p className="text-sm text-muted-foreground">Hechizos Conocidos</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{getMaxSpellLevel()}</div>
              <p className="text-sm text-muted-foreground">Nivel Máximo</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{characterClass}</div>
              <p className="text-sm text-muted-foreground">Clase Mágica</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="known">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="known">Hechizos Conocidos</TabsTrigger>
          <TabsTrigger value="learn">Aprender Hechizos</TabsTrigger>
        </TabsList>

        <TabsContent value="known" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {getKnownSpellsData().map(spell => (
                <Card key={spell.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold">{spell.name}</h4>
                        <Badge variant="outline">Nivel {spell.level}</Badge>
                        <Badge variant="secondary" className={getSchoolColor(spell.school)}>
                          {spell.school}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{spell.castingTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{spell.range}</span>
                        </div>
                        <div>
                          <strong>Componentes:</strong> {spell.components}
                        </div>
                        <div>
                          <strong>Duración:</strong> {spell.duration}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">{spell.description}</p>

                      {(spell.damage || spell.savingThrow) && (
                        <div className="flex gap-4 text-sm">
                          {spell.damage && (
                            <span className="text-destructive">
                              <strong>Daño:</strong> {spell.damage}
                            </span>
                          )}
                          {spell.savingThrow && (
                            <span className="text-accent">
                              <strong>Salvación:</strong> {spell.savingThrow}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <EpicButton
                      variant="outline"
                      size="sm"
                      onClick={() => forgetSpell(spell.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </EpicButton>
                  </div>
                </Card>
              ))}

              {getKnownSpellsData().length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No conoces ningún hechizo</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="learn" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar hechizos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Todos los niveles</option>
              {Array.from({ length: getMaxSpellLevel() }, (_, i) => (
                <option key={i + 1} value={i + 1}>Nivel {i + 1}</option>
              ))}
            </select>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Todas las escuelas</option>
              <option value="Evocación">Evocación</option>
              <option value="Abjuración">Abjuración</option>
              <option value="Conjuración">Conjuración</option>
              <option value="Adivinación">Adivinación</option>
              <option value="Encantamiento">Encantamiento</option>
              <option value="Ilusión">Ilusión</option>
              <option value="Necromancia">Necromancia</option>
              <option value="Transmutación">Transmutación</option>
            </select>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredSpells.map(spell => (
                <Card key={spell.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold">{spell.name}</h4>
                        <Badge variant="outline">Nivel {spell.level}</Badge>
                        <Badge variant="secondary" className={getSchoolColor(spell.school)}>
                          {spell.school}
                        </Badge>
                        {knownSpells.includes(spell.id) && (
                          <Badge variant="default">Conocido</Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">{spell.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <span><strong>Tiempo:</strong> {spell.castingTime}</span>
                        <span><strong>Alcance:</strong> {spell.range}</span>
                        <span><strong>Componentes:</strong> {spell.components}</span>
                        <span><strong>Duración:</strong> {spell.duration}</span>
                      </div>
                    </div>

                    <EpicButton
                      variant={knownSpells.includes(spell.id) ? "outline" : "default"}
                      size="sm"
                      onClick={() => knownSpells.includes(spell.id) ? forgetSpell(spell.id) : learnSpell(spell)}
                      disabled={knownSpells.includes(spell.id)}
                    >
                      {knownSpells.includes(spell.id) ? (
                        "Conocido"
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Aprender
                        </>
                      )}
                    </EpicButton>
                  </div>
                </Card>
              ))}

              {filteredSpells.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No hay hechizos disponibles</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};