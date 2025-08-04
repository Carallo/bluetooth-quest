import { useState } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw } from "lucide-react";

interface DiceResult {
  die: number;
  result: number;
  timestamp: number;
}

interface DiceModeProps {
  onBack: () => void;
}

export const DiceMode = ({ onBack }: DiceModeProps) => {
  const [diceCount, setDiceCount] = useState<{ [key: number]: number }>({
    4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0
  });
  const [results, setResults] = useState<DiceResult[]>([]);
  const [total, setTotal] = useState(0);

  const rollDice = () => {
    const newResults: DiceResult[] = [];
    let newTotal = 0;

    Object.entries(diceCount).forEach(([die, count]) => {
      for (let i = 0; i < count; i++) {
        const result = Math.floor(Math.random() * parseInt(die)) + 1;
        newResults.push({
          die: parseInt(die),
          result,
          timestamp: Date.now() + i
        });
        newTotal += result;
      }
    });

    setResults(newResults);
    setTotal(newTotal);
  };

  const adjustDice = (die: number, increment: boolean) => {
    setDiceCount(prev => ({
      ...prev,
      [die]: Math.max(0, prev[die] + (increment ? 1 : -1))
    }));
  };

  const resetDice = () => {
    setDiceCount({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0 });
    setResults([]);
    setTotal(0);
  };

  const getDiceIcon = (sides: number) => {
    switch (sides) {
      case 4: return Dice1;
      case 6: return Dice6;
      case 8: return Dice2;
      case 10: return Dice3;
      case 12: return Dice4;
      case 20: return Dice5;
      default: return Dice6;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <EpicButton variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
            Volver
          </EpicButton>
          <h1 className="text-3xl font-bold text-primary">Dados Virtuales</h1>
        </div>
        <EpicButton variant="outline" onClick={resetDice}>
          <RotateCcw className="w-5 h-5" />
          Reiniciar
        </EpicButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selector de dados */}
        <Card className="p-6 bg-gradient-medieval border-primary/30">
          <h3 className="text-xl font-bold text-primary mb-4">Seleccionar Dados</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[4, 6, 8, 10, 12, 20].map((sides) => {
              const DiceIcon = getDiceIcon(sides);
              return (
                <div key={sides} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DiceIcon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">d{sides}</p>
                  <div className="flex items-center justify-center gap-2">
                    <EpicButton 
                      variant="outline" 
                      size="sm"
                      onClick={() => adjustDice(sides, false)}
                      disabled={diceCount[sides] === 0}
                    >
                      -
                    </EpicButton>
                    <span className="text-xl font-bold text-primary min-w-[2rem] text-center">
                      {diceCount[sides]}
                    </span>
                    <EpicButton 
                      variant="outline" 
                      size="sm"
                      onClick={() => adjustDice(sides, true)}
                    >
                      +
                    </EpicButton>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón de lanzar */}
          <div className="mt-6">
            <EpicButton 
              variant="default" 
              className="w-full text-lg py-3"
              onClick={rollDice}
              disabled={Object.values(diceCount).every(count => count === 0)}
            >
              🎲 Lanzar Dados
            </EpicButton>
          </div>
        </Card>

        {/* Resultados */}
        <Card className="p-6 bg-gradient-medieval border-accent/30">
          <h3 className="text-xl font-bold text-accent mb-4">Resultados</h3>
          
          {results.length > 0 ? (
            <>
              {/* Total */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary bg-gradient-epic bg-clip-text text-transparent">
                  {total}
                </div>
                <p className="text-muted-foreground">Total</p>
              </div>

              {/* Resultados individuales */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((result, index) => (
                  <div 
                    key={result.timestamp} 
                    className="flex items-center justify-between p-3 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          d{result.die}
                        </span>
                      </div>
                      <span className="text-foreground">
                        Dado {index + 1}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-accent">
                      {result.result}
                    </span>
                  </div>
                ))}
              </div>

              {/* Resumen de la tirada */}
              <div className="mt-4 p-3 bg-primary/10 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Tirada: {Object.entries(diceCount)
                    .filter(([_, count]) => count > 0)
                    .map(([die, count]) => `${count}d${die}`)
                    .join(' + ')}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Dice6 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Selecciona dados y haz clic en "Lanzar Dados"
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Historial de tiradas recientes */}
      <Card className="mt-6 p-6 bg-gradient-medieval border-primary/30">
        <h3 className="text-lg font-bold text-primary mb-4">Tiradas Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Ataque", formula: "1d20" },
            { label: "Daño (Espada)", formula: "1d8" },
            { label: "Atributos", formula: "4d6" },
            { label: "Iniciativa", formula: "1d20" },
          ].map((quick, index) => (
            <EpicButton
              key={index}
              variant="outline"
              className="flex flex-col gap-1 h-auto py-3"
              onClick={() => {
                // Parsear y aplicar fórmula rápida
                const [count, die] = quick.formula.split('d').map(Number);
                const newCount = { ...diceCount };
                Object.keys(newCount).forEach(k => newCount[parseInt(k)] = 0);
                newCount[die] = count;
                setDiceCount(newCount);
              }}
            >
              <span className="text-xs text-muted-foreground">{quick.label}</span>
              <span className="font-bold">{quick.formula}</span>
            </EpicButton>
          ))}
        </div>
      </Card>
    </div>
  );
};