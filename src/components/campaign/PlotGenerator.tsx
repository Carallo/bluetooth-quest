import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Character } from '@/data/characters';
import { Item } from '@/data/items';
import { Creature } from '@/data/bestiary';

interface PlotGeneratorProps {
  npcs: Character[];
  items: Item[];
  creatures: Creature[];
}

const plotTemplates = [
  "Un artefacto antiguo, {item}, ha sido descubierto en {location}. {villain} también lo busca para {villain_goal}.",
  "Un PNJ importante, {npc}, ha sido secuestrado por {villain_faction}. Piden un rescate de {reward}, pero sus verdaderas intenciones son {villain_goal}.",
  "Una extraña plaga mágica está afectando a {location}. Los héroes deben encontrar la fuente, que es {source_of_problem}, y detenerla antes de que sea tarde.",
  "Los héroes son contratados para proteger a {npc} durante su viaje a {location}. Sin embargo, {complication} complica la misión.",
  "Una profecía predice que {event} ocurrirá en {location}, liberando a {villain}. Los héroes deben intervenir para {goal}.",
  "El líder de {friendly_faction}, {npc}, ha sido asesinado. Los héroes deben encontrar al culpable, que en realidad es {culprit}, antes de que estalle una guerra con {villain_faction}.",
  "{npc} te ha contratado porque {npc2} le ha robado {item}.",
  "La gente de {location} está aterrorizada por los ataques de {villain}. Ofrecen {reward} a quienes puedan detenerlo."
];

const genericPlotData = {
  location: ["la antigua ruina de Xylos", "la bulliciosa ciudad de Portsmith", "el Bosque Susurrante", "las Montañas Espinazo de Dragón", "una academia de magia flotante"],
  villain_goal: ["dominar el mundo", "alcanzar la inmortalidad", "vengar una antigua ofensa", "desatar una calamidad sobre el reino"],
  villain_faction: ["el Gremio de Ladrones de las Sombras", "los Caballeros del Crepúsculo", "un clan de orcos salvajes", "una sociedad secreta de nobles corruptos"],
  reward: ["10,000 piezas de oro", "un artefacto mágico de gran poder", "un título nobiliario y tierras", "el favor del rey"],
  source_of_problem: ["un experimento mágico que salió mal", "una maldición lanzada por una bruja", "un portal a otro plano que se ha abierto", "un artefacto corrompido"],
  complication: ["el PNJ tiene su propia agenda secreta", "una facción rival intenta sabotear la misión", "el clima se vuelve extremadamente hostil", "los héroes son acusados de un crimen que no cometieron"],
  event: ["el despertar de una antigua bestia", "la alineación de los planetas que amplifica la magia", "una guerra civil inminente", "la llegada de un ser de otro mundo"],
  goal: ["asegurar que la profecía se cumpla", "evitar que la profecía se cumpla", "controlar el resultado para su propio beneficio"],
  friendly_faction: ["el Consejo de Magos", "la Guardia Real", "la Orden de los Paladines de la Llama", "una red de espías que trabajan para el bien"],
  culprit: ["el segundo al mando del líder", "un espía de la facción rival", "un pariente celoso", "un demonio que ha poseído a alguien cercano"]
};

type PlotKey = keyof typeof genericPlotData | 'npc' | 'npc2' | 'item' | 'villain';

export const PlotGenerator = ({ npcs, items, creatures }: PlotGeneratorProps) => {
  const [generatedPlot, setGeneratedPlot] = useState('');

  const dynamicPlotData = useMemo(() => {
    const magicItems = items.filter(i => i.rarity !== 'common' && i.rarity !== 'uncommon');
    const villains = creatures.filter(c => parseFloat(c.challengeRating) >= 3);

    return {
      npc: npcs.length > 0 ? npcs.map(n => n.name) : ["un misterioso extraño"],
      npc2: npcs.length > 1 ? npcs.map(n => n.name) : ["un viejo rival"],
      item: magicItems.length > 0 ? magicItems.map(i => i.name) : ["un artefacto perdido"],
      villain: villains.length > 0 ? villains.map(c => c.name) : ["un terrible mal"],
    };
  }, [npcs, items, creatures]);

  const generatePlot = () => {
    let template = plotTemplates[Math.floor(Math.random() * plotTemplates.length)];
    let newPlot = template;

    const placeholders = [...new Set(template.match(/{[a-z_0-9]+}/g) || [])];

    let usedNpcs: string[] = [];

    const getValue = (key: PlotKey) => {
        let list: string[] = [];
        if (key in dynamicPlotData) {
            list = dynamicPlotData[key as keyof typeof dynamicPlotData];
        } else if (key in genericPlotData) {
            list = genericPlotData[key as keyof typeof genericPlotData];
        }

        if (list.length === 0) return `[${key}]`;

        if (key === 'npc2') { // Ensure npc2 is different from npc1
            const npc1 = usedNpcs[0];
            const filteredList = list.filter(n => n !== npc1);
            if (filteredList.length > 0) list = filteredList;
        }

        const value = list[Math.floor(Math.random() * list.length)];
        if (key === 'npc' || key === 'npc2') usedNpcs.push(value);
        return value;
    }

    placeholders.forEach(placeholder => {
      const key = placeholder.substring(1, placeholder.length - 1) as PlotKey;
      const value = getValue(key);
      newPlot = newPlot.replace(new RegExp(placeholder, 'g'), value);
    });

    setGeneratedPlot(newPlot);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generador de Tramas</CardTitle>
                <CardDescription>Crea ganchos de aventura personalizados para tu campaña.</CardDescription>
            </div>
            <Button onClick={generatePlot} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Nueva Trama
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {generatedPlot ? (
          <p className="text-lg leading-relaxed">{generatedPlot}</p>
        ) : (
          <p className="text-muted-foreground">Haz clic en "Nueva Trama" para generar una idea para tu aventura.</p>
        )}
      </CardContent>
    </Card>
  );
};
