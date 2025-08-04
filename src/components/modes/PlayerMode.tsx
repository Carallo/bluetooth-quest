import { useState } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, User, Sword, Heart, Shield } from "lucide-react";

interface PlayerModeProps {
  onBack: () => void;
}

export const PlayerMode = ({ onBack }: PlayerModeProps) => {
  const [characters, setCharacters] = useState([
    { id: 1, name: "Thorin Forjaferro", class: "Guerrero", level: 5, hp: 45, maxHp: 50 },
    { id: 2, name: "Luna Ventoluna", class: "Mago", level: 4, hp: 22, maxHp: 28 },
  ]);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <EpicButton variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
            Volver
          </EpicButton>
          <h1 className="text-3xl font-bold text-accent">Modo Jugador</h1>
        </div>
        <EpicButton variant="blood">
          <Plus className="w-5 h-5" />
          Crear Personaje
        </EpicButton>
      </div>

      {/* Grid de personajes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {characters.map((character) => (
          <Card key={character.id} className="p-6 bg-gradient-medieval border-accent/30 hover:border-accent transition-epic group cursor-pointer">
            <div className="text-center">
              <User className="w-12 h-12 text-accent mx-auto mb-4 group-hover:animate-epic-bounce" />
              <h3 className="text-xl font-bold text-accent mb-2">{character.name}</h3>
              <p className="text-muted-foreground mb-4">
                {character.class} - Nivel {character.level}
              </p>
              
              {/* Barra de vida */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Puntos de Vida</span>
                  <span className="text-foreground">{character.hp}/{character.maxHp}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-blood h-2 rounded-full transition-all"
                    style={{ width: `${(character.hp / character.maxHp) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <EpicButton variant="outline" size="sm">
                  <Sword className="w-4 h-4" />
                  Combatir
                </EpicButton>
                <EpicButton variant="ghost" size="sm">
                  Editar
                </EpicButton>
              </div>
            </div>
          </Card>
        ))}

        {/* Card para crear nuevo personaje */}
        <Card className="p-6 bg-gradient-medieval border-primary/30 hover:border-primary transition-epic group cursor-pointer border-dashed">
          <div className="text-center">
            <Plus className="w-12 h-12 text-primary mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-primary mb-2">Nuevo Héroe</h3>
            <p className="text-muted-foreground mb-4">
              Crea un nuevo personaje épico
            </p>
            <EpicButton variant="default" className="w-full">
              Crear Personaje
            </EpicButton>
          </div>
        </Card>
      </div>

      {/* Formulario de creación de personaje */}
      <Card className="p-6 bg-gradient-medieval border-primary/30">
        <h3 className="text-xl font-bold text-primary mb-4">Crear Nuevo Personaje</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre del Personaje
              </label>
              <input 
                type="text" 
                className="w-full p-3 bg-input border border-border rounded-md text-foreground"
                placeholder="Ej: Aragorn el Valiente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Clase
              </label>
              <select className="w-full p-3 bg-input border border-border rounded-md text-foreground">
                <option>Guerrero</option>
                <option>Mago</option>
                <option>Pícaro</option>
                <option>Clérigo</option>
                <option>Bárbaro</option>
                <option>Paladín</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nivel
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-input border border-border rounded-md text-foreground"
                  placeholder="1"
                  min="1"
                  max="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Puntos de Vida
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-input border border-border rounded-md text-foreground"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Atributos (D&D 5e)</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Fuerza", abbr: "FUE" },
                { name: "Destreza", abbr: "DES" },
                { name: "Constitución", abbr: "CON" },
                { name: "Inteligencia", abbr: "INT" },
                { name: "Sabiduría", abbr: "SAB" },
                { name: "Carisma", abbr: "CAR" },
              ].map((attr, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {attr.name} ({attr.abbr})
                  </label>
                  <input 
                    type="number" 
                    className="w-full p-2 bg-input border border-border rounded text-foreground"
                    placeholder="10"
                    min="3"
                    max="20"
                  />
                </div>
              ))}
            </div>
            <EpicButton variant="blood" className="w-full">
              <Shield className="w-5 h-5" />
              Crear Héroe
            </EpicButton>
          </div>
        </div>
      </Card>
    </div>
  );
};