import { EpicButton } from "@/components/ui/epic-button";
import { Card } from "@/components/ui/card";
import { Crown, Sword, Dice6, ShoppingCart, Users, FileDown } from "lucide-react";

interface MainMenuProps {
  onModeSelect: (mode: 'narrator' | 'player' | 'dice' | 'shop' | 'characters' | 'combat') => void;
}

export const MainMenu = ({ onModeSelect }: MainMenuProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Título épico */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-epic bg-clip-text text-transparent mb-4 animate-glow-pulse">
          Reino de Dragones
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Aventuras Épicas en D&D 5e
        </p>
        <div className="w-32 h-1 bg-gradient-epic mx-auto rounded-full"></div>
      </div>

      {/* Grid de opciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        
        {/* Modo Narrador */}
        <Card className="p-6 bg-gradient-medieval border-primary/30 hover:border-primary transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('narrator')} className="text-center">
            <Crown className="w-12 h-12 text-primary mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-primary mb-2">Modo Narrador</h3>
            <p className="text-muted-foreground mb-4">
              Crea NPCs, gestiona combates y recompensas
            </p>
            <EpicButton variant="medieval" className="w-full">
              Comenzar Historia
            </EpicButton>
          </div>
        </Card>

        {/* Modo Jugador */}
        <Card className="p-6 bg-gradient-medieval border-accent/30 hover:border-accent transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('player')} className="text-center">
            <Sword className="w-12 h-12 text-accent mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-accent mb-2">Modo Jugador</h3>
            <p className="text-muted-foreground mb-4">
              Crea personajes y embárcate en aventuras
            </p>
            <EpicButton variant="blood" className="w-full">
              Crear Héroe
            </EpicButton>
          </div>
        </Card>

        {/* Dados Virtuales */}
        <Card className="p-6 bg-gradient-medieval border-primary/30 hover:border-primary transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('dice')} className="text-center">
            <Dice6 className="w-12 h-12 text-primary mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-primary mb-2">Dados Virtuales</h3>
            <p className="text-muted-foreground mb-4">
              Lanza dados para tus tiradas épicas
            </p>
            <EpicButton variant="default" className="w-full">
              Lanzar Dados
            </EpicButton>
          </div>
        </Card>

        {/* Tienda */}
        <Card className="p-6 bg-gradient-medieval border-primary/30 hover:border-primary transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('shop')} className="text-center">
            <ShoppingCart className="w-12 h-12 text-primary mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-primary mb-2">Tienda</h3>
            <p className="text-muted-foreground mb-4">
              Adquiere armas, armaduras y objetos mágicos
            </p>
            <EpicButton variant="outline" className="w-full">
              Explorar Tienda
            </EpicButton>
          </div>
        </Card>

        {/* Gestión de Personajes */}
        <Card className="p-6 bg-gradient-medieval border-accent/30 hover:border-accent transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('characters')} className="text-center">
            <Users className="w-12 h-12 text-accent mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-accent mb-2">Personajes</h3>
            <p className="text-muted-foreground mb-4">
              Gestiona tus héroes y NPCs
            </p>
            <EpicButton variant="ghost" className="w-full">
              Ver Personajes
            </EpicButton>
          </div>
        </Card>

        {/* Sistema de Combate */}
        <Card className="p-6 bg-gradient-medieval border-destructive/30 hover:border-destructive transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('combat')} className="text-center">
            <FileDown className="w-12 h-12 text-destructive mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-destructive mb-2">Cargar Combate</h3>
            <p className="text-muted-foreground mb-4">
              Carga un archivo de combate compartido
            </p>
            <EpicButton variant="blood" className="w-full">
              Cargar Archivo
            </EpicButton>
          </div>
        </Card>

      </div>

      {/* Footer épico */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Basado en las reglas abiertas de D&D 5e SRD/OGL
        </p>
      </div>
    </div>
  );
};