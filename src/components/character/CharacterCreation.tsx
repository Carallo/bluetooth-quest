import { useState } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dice6, Plus, Minus, Save, X } from "lucide-react";
import { type Character, races, classes, skills, backgrounds, alignments, getStatModifier, getProficiencyBonus } from "@/data/characters";
import { useToast } from "@/hooks/use-toast";

interface CharacterCreationProps {
  onSave: (character: Character) => void;
  onCancel: () => void;
  editingCharacter?: Character;
}

export const CharacterCreation = ({ onSave, onCancel, editingCharacter }: CharacterCreationProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: editingCharacter?.name || "",
    race: editingCharacter?.race || "",
    class: editingCharacter?.class || "",
    level: editingCharacter?.level || 1,
    background: editingCharacter?.background || "",
    alignment: editingCharacter?.alignment || "",
    stats: editingCharacter?.stats || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    hitPoints: editingCharacter?.hitPoints || { current: 8, maximum: 8, temporary: 0 },
    armorClass: editingCharacter?.armorClass || 10,
    speed: editingCharacter?.speed || 30,
    selectedSkills: editingCharacter?.skills || {},
    savingThrows: editingCharacter?.savingThrows || {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false
    },
    gold: editingCharacter?.gold || 150,
    notes: editingCharacter?.notes || ""
  });

  const rollStat = () => {
    // Roll 4d6, drop lowest
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
  };

  const rollAllStats = () => {
    setFormData(prev => ({
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
    toast({
      title: "Estadísticas generadas",
      description: "Se han generado nuevas estadísticas aleatorias"
    });
  };

  const adjustStat = (stat: keyof typeof formData.stats, change: number) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: Math.max(3, Math.min(18, prev.stats[stat] + change))
      }
    }));
  };

  const selectedClass = classes.find(c => c.name === formData.class);
  const selectedRace = races.find(r => r.name === formData.race);

  const calculateHitPoints = () => {
    const baseHp = selectedClass?.hitDie || 8;
    const conModifier = getStatModifier(formData.stats.constitution);
    return Math.max(1, baseHp + conModifier);
  };

  const calculateArmorClass = () => {
    const dexModifier = getStatModifier(formData.stats.dexterity);
    return 10 + dexModifier;
  };

  // Auto-calculate derived stats when stats change
  useState(() => {
    if (selectedClass && !editingCharacter) {
      const hp = calculateHitPoints();
      const ac = calculateArmorClass();
      setFormData(prev => ({
        ...prev,
        hitPoints: { current: hp, maximum: hp, temporary: 0 },
        armorClass: ac
      }));
    }
  });

  const handleSave = () => {
    if (!formData.name || !formData.race || !formData.class) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const character: Character = {
      id: editingCharacter?.id || Date.now().toString(),
      name: formData.name,
      race: formData.race,
      class: formData.class,
      level: formData.level,
      experience: editingCharacter?.experience || 0,
      hitPoints: formData.hitPoints,
      armorClass: formData.armorClass,
      proficiencyBonus: getProficiencyBonus(formData.level),
      speed: formData.speed,
      stats: formData.stats,
      savingThrows: formData.savingThrows,
      skills: formData.selectedSkills,
      equipment: editingCharacter?.equipment || [],
      spells: editingCharacter?.spells || [],
      background: formData.background,
      alignment: formData.alignment,
      gold: formData.gold,
      notes: formData.notes,
      createdAt: editingCharacter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Apply racial bonuses to final stats
    if (selectedRace) {
      Object.entries(selectedRace.bonuses).forEach(([stat, bonus]) => {
        character.stats[stat as keyof typeof character.stats] += bonus;
      });
    }

    onSave(character);
    toast({
      title: editingCharacter ? "Personaje actualizado" : "Personaje creado",
      description: `${character.name} ha sido ${editingCharacter ? 'actualizado' : 'creado'} exitosamente`
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-primary">
          {editingCharacter ? 'Editar Personaje' : 'Crear Personaje'}
        </h2>
        <div className="flex gap-2">
          <EpicButton variant="ghost" onClick={onCancel}>
            Cancelar
          </EpicButton>
          <EpicButton onClick={handleSave}>
            {editingCharacter ? 'Actualizar' : 'Crear'}
          </EpicButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Personaje *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de tu personaje"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="race">Raza *</Label>
                <Select value={formData.race} onValueChange={(value) => setFormData(prev => ({ ...prev, race: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona raza" />
                  </SelectTrigger>
                  <SelectContent>
                    {races.map(race => (
                      <SelectItem key={race.name} value={race.name}>{race.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="class">Clase *</Label>
                <Select value={formData.class} onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona clase" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="background">Trasfondo</Label>
                <Select value={formData.background} onValueChange={(value) => setFormData(prev => ({ ...prev, background: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona trasfondo" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgrounds.map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="alignment">Alineamiento</Label>
                <Select value={formData.alignment} onValueChange={(value) => setFormData(prev => ({ ...prev, alignment: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona alineamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {alignments.map(align => (
                      <SelectItem key={align} value={align}>{align}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="level">Nivel</Label>
              <Input
                id="level"
                type="number"
                min="1"
                max="20"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Estadísticas
              <EpicButton variant="outline" size="sm" onClick={rollAllStats}>
                <Dice6 className="w-4 h-4 mr-2" />
                Tirar Todo
              </EpicButton>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(formData.stats).map(([stat, value]) => (
              <div key={stat} className="flex items-center justify-between">
                <Label className="capitalize font-medium min-w-[100px]">
                  {stat === 'strength' ? 'Fuerza' :
                   stat === 'dexterity' ? 'Destreza' :
                   stat === 'constitution' ? 'Constitución' :
                   stat === 'intelligence' ? 'Inteligencia' :
                   stat === 'wisdom' ? 'Sabiduría' : 'Carisma'}
                </Label>
                <div className="flex items-center gap-2">
                  <EpicButton 
                    variant="outline" 
                    size="icon" 
                    onClick={() => adjustStat(stat as keyof typeof formData.stats, -1)}
                    className="h-8 w-8"
                  >
                    <Minus className="w-3 h-3" />
                  </EpicButton>
                  <div className="w-12 text-center font-mono">{value}</div>
                  <EpicButton 
                    variant="outline" 
                    size="icon" 
                    onClick={() => adjustStat(stat as keyof typeof formData.stats, 1)}
                    className="h-8 w-8"
                  >
                    <Plus className="w-3 h-3" />
                  </EpicButton>
                  <Badge variant="outline" className="min-w-[40px] text-center">
                    {getStatModifier(value) >= 0 ? '+' : ''}{getStatModifier(value)}
                  </Badge>
                </div>
              </div>
            ))}
            
            {selectedRace && (
              <div className="text-sm text-muted-foreground mt-4">
                <strong>Bonos raciales:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(selectedRace.bonuses).map(([stat, bonus]) => (
                    <Badge key={stat} variant="secondary" className="text-xs">
                      {stat === 'strength' ? 'FUE' :
                       stat === 'dexterity' ? 'DES' :
                       stat === 'constitution' ? 'CON' :
                       stat === 'intelligence' ? 'INT' :
                       stat === 'wisdom' ? 'SAB' : 'CAR'} +{bonus}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Habilidades */}
        {selectedClass && (
          <Card>
            <CardHeader>
              <CardTitle>Habilidades de Clase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Habilidades disponibles para {selectedClass.name}:</Label>
                <div className="grid grid-cols-1 gap-2">
                  {selectedClass.skillChoices.map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={formData.selectedSkills[skill] || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          selectedSkills: { ...prev.selectedSkills, [skill]: checked as boolean }
                        }))}
                      />
                      <Label htmlFor={skill} className="text-sm">{skill}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Características adicionales */}
        <Card>
          <CardHeader>
            <CardTitle>Características</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hp">Puntos de Vida</Label>
                <Input
                  id="hp"
                  type="number"
                  value={formData.hitPoints.maximum || calculateHitPoints()}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    hitPoints: { 
                      ...prev.hitPoints, 
                      maximum: parseInt(e.target.value) || 0,
                      current: parseInt(e.target.value) || 0
                    }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="ac">Clase de Armadura</Label>
                <Input
                  id="ac"
                  type="number"
                  value={formData.armorClass || calculateArmorClass()}
                  onChange={(e) => setFormData(prev => ({ ...prev, armorClass: parseInt(e.target.value) || 10 }))}
                />
              </div>
              <div>
                <Label htmlFor="speed">Velocidad</Label>
                <Input
                  id="speed"
                  type="number"
                  value={formData.speed}
                  onChange={(e) => setFormData(prev => ({ ...prev, speed: parseInt(e.target.value) || 30 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gold">Oro Inicial</Label>
              <Input
                id="gold"
                type="number"
                value={formData.gold}
                onChange={(e) => setFormData(prev => ({ ...prev, gold: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas del Personaje</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Historia, personalidad, objetivos..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumen del personaje */}
        {formData.name && formData.race && formData.class && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resumen del Personaje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary">{formData.name}</h3>
                  <p className="text-lg text-muted-foreground">
                    {formData.race} {formData.class} - Nivel {formData.level}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-xl font-bold text-destructive">{formData.hitPoints.maximum}</div>
                    <div className="text-sm text-muted-foreground">Puntos de Vida</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-xl font-bold text-accent">{formData.armorClass}</div>
                    <div className="text-sm text-muted-foreground">Clase de Armadura</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-xl font-bold text-primary">+{getProficiencyBonus(formData.level)}</div>
                    <div className="text-sm text-muted-foreground">Bono de Competencia</div>
                  </div>
                </div>

                {selectedRace && (
                  <div>
                    <h4 className="font-medium mb-2">Rasgos Raciales:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedRace.bonuses).map(([stat, bonus]) => (
                        <Badge key={stat} variant="secondary">
                          {stat === 'strength' ? 'Fuerza' :
                           stat === 'dexterity' ? 'Destreza' :
                           stat === 'constitution' ? 'Constitución' :
                           stat === 'intelligence' ? 'Inteligencia' :
                           stat === 'wisdom' ? 'Sabiduría' : 'Carisma'} +{bonus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedClass && (
                  <div>
                    <h4 className="font-medium mb-2">Habilidades de Clase Disponibles:</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedClass.skillChoices.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};