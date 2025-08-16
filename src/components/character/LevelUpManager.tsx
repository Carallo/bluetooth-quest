import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Heart, 
  Zap, 
  BookOpen, 
  Award,
  Dice6
} from "lucide-react";
import { type Character, classes, getExperienceForLevel, getProficiencyBonus } from "@/data/characters";
import { useToast } from "@/hooks/use-toast";

interface LevelUpManagerProps {
  character: Character;
  onLevelUp: (updatedCharacter: Character) => void;
  onClose: () => void;
}

export const LevelUpManager = ({ character, onLevelUp, onClose }: LevelUpManagerProps) => {
  const { toast } = useToast();
  const [selectedBenefits, setSelectedBenefits] = useState<{
    hitPoints: number;
    newSpells: string[];
    abilityScoreImprovement: boolean;
  }>({
    hitPoints: 0,
    newSpells: [],
    abilityScoreImprovement: false
  });

  const currentLevel = character.level;
  const nextLevel = currentLevel + 1;
  const currentXP = character.experience;
  const requiredXP = getExperienceForLevel(nextLevel);
  const canLevelUp = currentXP >= requiredXP && nextLevel <= 20;

  const selectedClass = classes.find(c => c.name === character.class);
  const hitDie = selectedClass?.hitDie || 8;

  const rollHitPoints = () => {
    const roll = Math.floor(Math.random() * hitDie) + 1;
    const conModifier = Math.floor((character.stats.constitution - 10) / 2);
    const totalHp = Math.max(1, roll + conModifier);
    
    setSelectedBenefits(prev => ({ ...prev, hitPoints: totalHp }));
    
    toast({
      title: "Puntos de vida rodados",
      description: `Rodaste ${roll} + ${conModifier} (CON) = ${totalHp} PV`
    });
  };

  const takeAverageHitPoints = () => {
    const average = Math.floor(hitDie / 2) + 1;
    const conModifier = Math.floor((character.stats.constitution - 10) / 2);
    const totalHp = Math.max(1, average + conModifier);
    
    setSelectedBenefits(prev => ({ ...prev, hitPoints: totalHp }));
    
    toast({
      title: "Puntos de vida promedio",
      description: `Tomaste ${average} + ${conModifier} (CON) = ${totalHp} PV`
    });
  };

  const confirmLevelUp = () => {
    if (selectedBenefits.hitPoints === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar los puntos de vida para subir de nivel",
        variant: "destructive"
      });
      return;
    }

    const updatedCharacter: Character = {
      ...character,
      level: nextLevel,
      hitPoints: {
        ...character.hitPoints,
        maximum: character.hitPoints.maximum + selectedBenefits.hitPoints,
        current: character.hitPoints.current + selectedBenefits.hitPoints
      },
      proficiencyBonus: getProficiencyBonus(nextLevel),
      spells: [...character.spells, ...selectedBenefits.newSpells],
      updatedAt: new Date().toISOString()
    };

    onLevelUp(updatedCharacter);
    
    toast({
      title: "¡Subida de nivel!",
      description: `${character.name} ha alcanzado el nivel ${nextLevel}`,
    });
  };

  const getLevelBenefits = () => {
    const benefits = [];
    
    // Puntos de vida siempre
    benefits.push("Aumento de puntos de vida");
    
    // Bono de competencia cada 4 niveles
    if ([5, 9, 13, 17].includes(nextLevel)) {
      benefits.push("Aumento del bono de competencia");
    }
    
    // Mejora de puntuación de habilidad en niveles específicos
    if ([4, 8, 12, 16, 19].includes(nextLevel)) {
      benefits.push("Mejora de puntuación de habilidad");
    }
    
    // Beneficios específicos de clase (simplificado)
    switch (character.class) {
      case 'Mago':
        if (nextLevel % 2 === 1) benefits.push("Nuevos hechizos disponibles");
        break;
      case 'Clérigo':
      case 'Druida':
        benefits.push("Acceso a hechizos de nivel superior");
        break;
      case 'Guerrero':
        if ([3, 7, 10, 15, 18].includes(nextLevel)) {
          benefits.push("Nuevo rasgo de clase");
        }
        break;
    }
    
    return benefits;
  };

  if (!canLevelUp) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No se puede subir de nivel</h3>
          <p className="text-muted-foreground mb-4">
            {nextLevel > 20 
              ? "Has alcanzado el nivel máximo (20)"
              : `Necesitas ${requiredXP - currentXP} XP más para subir al nivel ${nextLevel}`
            }
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP Actual: {currentXP}</span>
              <span>XP Requerida: {requiredXP}</span>
            </div>
            <Progress value={(currentXP / requiredXP) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-epic border-primary">
        <CardHeader>
          <CardTitle className="text-center">
            <TrendingUp className="w-6 h-6 inline mr-2" />
            ¡Subida de Nivel Disponible!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-3xl font-bold mb-2">
            Nivel {currentLevel} → Nivel {nextLevel}
          </div>
          <p className="text-muted-foreground">
            {character.name} está listo para subir de nivel
          </p>
        </CardContent>
      </Card>

      {/* Beneficios del nivel */}
      <Card>
        <CardHeader>
          <CardTitle>Beneficios del Nivel {nextLevel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getLevelBenefits().map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selección de puntos de vida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Puntos de Vida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Elige cómo determinar tus nuevos puntos de vida:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
              <div className="text-center" onClick={rollHitPoints}>
                <Dice6 className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium mb-1">Rodar Dado</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  1d{hitDie} + modificador CON
                </p>
                <EpicButton variant="outline" className="w-full">
                  Rodar 1d{hitDie}
                </EpicButton>
              </div>
            </Card>

            <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
              <div className="text-center" onClick={takeAverageHitPoints}>
                <Heart className="w-8 h-8 mx-auto mb-2 text-accent" />
                <h4 className="font-medium mb-1">Tomar Promedio</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {Math.floor(hitDie / 2) + 1} + modificador CON
                </p>
                <EpicButton variant="outline" className="w-full">
                  Tomar Promedio
                </EpicButton>
              </div>
            </Card>
          </div>

          {selectedBenefits.hitPoints > 0 && (
            <div className="text-center p-4 bg-primary/10 rounded-md">
              <p className="text-lg font-bold text-primary">
                +{selectedBenefits.hitPoints} Puntos de Vida
              </p>
              <p className="text-sm text-muted-foreground">
                Nuevo total: {character.hitPoints.maximum + selectedBenefits.hitPoints} PV
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-4 justify-center">
        <EpicButton variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </EpicButton>
        <EpicButton 
          onClick={confirmLevelUp}
          disabled={selectedBenefits.hitPoints === 0}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Confirmar Subida de Nivel
        </EpicButton>
      </div>
    </div>
  );
};