import { EpicButton } from "@/components/ui/epic-button";
import { Card } from "@/components/ui/card";
import { Crown, Sword, Dice6, ShoppingCart, Users, FileDown, Bluetooth } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MainMenuProps {
  onModeSelect: (mode: 'narrator' | 'player' | 'dice' | 'shop' | 'characters' | 'combat' | 'bluetooth' | 'offline') => void;
}

export const MainMenu = ({ onModeSelect }: MainMenuProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Título épico */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-epic bg-clip-text text-transparent mb-4 animate-glow-pulse">
          {t('mainMenu.title')}
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          {t('mainMenu.subtitle')}
        </p>
        <div className="w-32 h-1 bg-gradient-epic mx-auto rounded-full"></div>
      </div>

      {/* Grid de opciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        
        {/* Modo Narrador */}
        <Card className="p-6 bg-gradient-medieval border-primary/30 hover:border-primary transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('narrator')} className="text-center">
            <Crown className="w-12 h-12 text-primary mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-primary mb-2">{t('mainMenu.narratorMode')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('mainMenu.narratorModeDescription')}
            </p>
            <EpicButton variant="medieval" className="w-full">
              {t('mainMenu.narratorModeButton')}
            </EpicButton>
          </div>
        </Card>

        {/* Modo Jugador */}
        <Card className="p-6 bg-gradient-medieval border-accent/30 hover:border-accent transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('player')} className="text-center">
            <Sword className="w-12 h-12 text-accent mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-accent mb-2">{t('mainMenu.playerMode')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('mainMenu.playerModeDescription')}
            </p>
            <EpicButton variant="blood" className="w-full">
              {t('mainMenu.playerModeButton')}
            </EpicButton>
          </div>
        </Card>

        {/* Dados Virtuales */}
        <Card className="p-6 bg-gradient-medieval border-primary/30 hover:border-primary transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('dice')} className="text-center">
            <Dice6 className="w-12 h-12 text-primary mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-primary mb-2">{t('mainMenu.diceMode')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('mainMenu.diceModeDescription')}
            </p>
            <EpicButton variant="default" className="w-full">
              {t('mainMenu.diceModeButton')}
            </EpicButton>
          </div>
        </Card>

        {/* Tienda */}
        <Card className="p-6 bg-gradient-medieval border-primary/30 hover:border-primary transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('shop')} className="text-center">
            <ShoppingCart className="w-12 h-12 text-primary mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-primary mb-2">{t('mainMenu.shopMode')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('mainMenu.shopModeDescription')}
            </p>
            <EpicButton variant="outline" className="w-full">
              {t('mainMenu.shopModeButton')}
            </EpicButton>
          </div>
        </Card>

        {/* Gestión de Personajes */}
        <Card className="p-6 bg-gradient-medieval border-accent/30 hover:border-accent transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('characters')} className="text-center">
            <Users className="w-12 h-12 text-accent mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-accent mb-2">{t('mainMenu.characters')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('mainMenu.charactersDescription')}
            </p>
            <EpicButton variant="ghost" className="w-full">
              {t('mainMenu.charactersButton')}
            </EpicButton>
          </div>
        </Card>

        {/* Sistema de Combate */}
        <Card className="p-6 bg-gradient-medieval border-destructive/30 hover:border-destructive transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('combat')} className="text-center">
            <FileDown className="w-12 h-12 text-destructive mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-destructive mb-2">{t('mainMenu.combatMode')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('mainMenu.combatModeDescription')}
            </p>
            <EpicButton variant="blood" className="w-full">
              {t('mainMenu.combatModeButton')}
            </EpicButton>
          </div>
        </Card>

        {/* Gestión Offline */}
        <Card className="p-6 bg-gradient-medieval border-blue-500/30 hover:border-blue-500 transition-epic group cursor-pointer">
          <div onClick={() => onModeSelect('offline')} className="text-center">
            <Bluetooth className="w-12 h-12 text-blue-500 mx-auto mb-4 group-hover:animate-epic-bounce" />
            <h3 className="text-xl font-bold text-blue-500 mb-2">{t('mainMenu.offlineMode')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('mainMenu.offlineModeDescription')}
            </p>
            <EpicButton variant="outline" className="w-full">
              {t('mainMenu.offlineModeButton')}
            </EpicButton>
          </div>
        </Card>

      </div>

      {/* Footer épico */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          {t('mainMenu.footer')}
        </p>
      </div>
    </div>
  );
};