import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Shield, 
  Zap, 
  TrendingUp, 
  Target,
  Eye,
  Ear,
  Brain
} from "lucide-react";
import { type Character, getStatModifier, getExperienceForLevel } from "@/data/characters";

interface CharacterStatsProps {
  character: Character;
}

export const CharacterStats = ({ character }: CharacterStatsProps) => {
  const getStatModifierText = (stat: number) => {
    const mod = getStatModifier(stat);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const getSkillModifier = (skill: string, stat: keyof typeof character.stats) => {
    const statMod = getStatModifier(character.stats[stat]);
    const proficient = character.skills[skill] || false;
    const profBonus = proficient ? character.proficiencyBonus : 0;
    return statMod + profBonus;
  };

  const skillToStat: { [key: string]: keyof typeof character.stats } = {
    "Acrobacias": "dexterity",
    "Trato con Animales": "wisdom",
    "Arcanos": "intelligence",
    "Atletismo": "strength",
    "Engaño": "charisma",
    "Historia": "intelligence",
    "Perspicacia": "wisdom",
    "Intimidación": "charisma",
    "Investigación": "intelligence",
    "Medicina": "wisdom",
    "Naturaleza": "intelligence",
    "Percepción": "wisdom",
    "Actuación": "charisma",
    "Persuasión": "charisma",
    "Religión": "intelligence",
    "Juego de Manos": "dexterity",
    "Sigilo": "dexterity",
    "Supervivencia": "wisdom"
  };

  const experienceToNext = character.level < 20 ? getExperienceForLevel(character.level + 1) : 0;
  const experienceProgress = character.level < 20 ? 
    ((character.experience - getExperienceForLevel(character.level)) / 
     (experienceToNext - getExperienceForLevel(character.level))) * 100 : 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Atributos principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Atributos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(character.stats).map(([stat, value]) => (
            <div key={stat} className="flex items-center justify-between">
              <Label className="font-medium">
                {stat === 'strength' ? 'Fuerza' :
                 stat === 'dexterity' ? 'Destreza' :
                 stat === 'constitution' ? 'Constitución' :
                 stat === 'intelligence' ? 'Inteligencia' :
                 stat === 'wisdom' ? 'Sabiduría' : 'Carisma'}
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="min-w-[50px] text-center">
                  {value}
                </Badge>
                <Badge className="min-w-[50px] text-center">
                  {getStatModifierText(value)}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Habilidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Habilidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(skillToStat).map(([skill, stat]) => {
              const modifier = getSkillModifier(skill, stat);
              const isProficient = character.skills[skill] || false;
              
              return (
                <div key={skill} className="flex items-center justify-between">
                  <span className={`text-sm ${isProficient ? 'font-medium' : ''}`}>
                    {skill} {isProficient && '●'}
                  </span>
                  <Badge variant={isProficient ? "default" : "outline"}>
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Combate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Estadísticas de Combate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-md">
              <Heart className="w-6 h-6 mx-auto mb-1 text-red-500" />
              <div className="text-lg font-bold">{character.hitPoints.current}/{character.hitPoints.maximum}</div>
              <div className="text-xs text-muted-foreground">Puntos de Vida</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-md">
              <Shield className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <div className="text-lg font-bold">{character.armorClass}</div>
              <div className="text-xs text-muted-foreground">Clase de Armadura</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Velocidad:</span>
              <span className="text-sm font-medium">{character.speed} pies</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Bono de Competencia:</span>
              <span className="text-sm font-medium">+{character.proficiencyBonus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Iniciativa:</span>
              <span className="text-sm font-medium">
                {getStatModifierText(character.stats.dexterity)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progreso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progreso del Personaje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Experiencia</span>
              <span>{character.experience} / {experienceToNext > 0 ? experienceToNext : 'Máximo'} XP</span>
            </div>
            <Progress value={experienceProgress} className="h-3" />
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Nivel actual:</span>
              <Badge variant="outline">Nivel {character.level}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Creado:</span>
              <span>{new Date(character.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Última actualización:</span>
              <span>{new Date(character.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};