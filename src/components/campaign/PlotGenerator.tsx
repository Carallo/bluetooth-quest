import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const plotTemplates = [
  "Un artefacto antiguo con un poder inmenso ha sido descubierto en {location}. {villain} también lo busca para {villain_goal}.",
  "Un PNJ importante, {npc}, ha sido secuestrado por {villain_faction}. Piden un rescate de {reward}, pero sus verdaderas intenciones son {villain_goal}.",
  "Una extraña plaga mágica está afectando a {location}. Los héroes deben encontrar la fuente, que es {source_of_problem}, y detenerla antes de que sea tarde.",
  "Los héroes son contratados para proteger a {npc} durante su viaje a {location}. Sin embargo, {complication} complica la misión.",
  "Una profecía predice que {event} ocurrirá en {location}. Los héroes deben intervenir para {goal}.",
  "El líder de {friendly_faction}, {npc}, ha sido asesinado. Los héroes deben encontrar al culpable, que en realidad es {culprit}, antes de que estalle una guerra con {villain_faction}."
];

const plotData = {
  location: ["la antigua ruina de Xylos", "la bulliciosa ciudad de Portsmith", "el Bosque Susurrante", "las Montañas Espinazo de Dragón", "una academia de magia flotante"],
  villain: ["el lich Zalthor", "la baronesa sangrienta Isabella", "un dragón rojo llamado Ignis", "un culto que adora a un dios olvidado"],
  villain_goal: ["dominar el mundo", "alcanzar la inmortalidad", "vengar una antigua ofensa", "desatar una calamidad sobre el reino"],
  npc: ["un sabio erudito", "un noble rico pero cobarde", "una joven con poderes misteriosos", "un veterano de guerra endurecido"],
  villain_faction: ["el Gremio de Ladrones de las Sombras", "los Caballeros del Crepúsculo", "un clan de orcos salvajes", "una sociedad secreta de nobles corruptos"],
  reward: ["10,000 piezas de oro", "un artefacto mágico de gran poder", "un título nobiliario y tierras", "el favor del rey"],
  source_of_problem: ["un experimento mágico que salió mal", "una maldición lanzada por una bruja", "un portal a otro plano que se ha abierto", "un artefacto corrompido"],
  complication: ["el PNJ tiene su propia agenda secreta", "una facción rival intenta sabotear la misión", "el clima se vuelve extremadamente hostil", "los héroes son acusados de un crimen que no cometieron"],
  event: ["el despertar de una antigua bestia", "la alineación de los planetas que amplifica la magia", "una guerra civil inminente", "la llegada de un ser de otro mundo"],
  goal: ["asegurar que la profecía se cumpla", "evitar que la profecía se cumpla", "controlar el resultado para su propio beneficio"],
  friendly_faction: ["el Consejo de Magos", "la Guardia Real", "la Orden de los Paladines de la Llama", "una red de espías que trabajan para el bien"],
  culprit: ["el segundo al mando del líder", "un espía de la facción rival", "un pariente celoso", "un demonio que ha poseído a alguien cercano"]
};

type PlotKey = keyof typeof plotData;

export const PlotGenerator = () => {
  const [generatedPlot, setGeneratedPlot] = useState('');

  const generatePlot = () => {
    let template = plotTemplates[Math.floor(Math.random() * plotTemplates.length)];
    let newPlot = template;

    const placeholders = template.match(/{[a-z_]+}/g) || [];

    placeholders.forEach(placeholder => {
      const key = placeholder.substring(1, placeholder.length - 1) as PlotKey;
      if (plotData[key]) {
        const value = plotData[key][Math.floor(Math.random() * plotData[key].length)];
        newPlot = newPlot.replace(placeholder, value);
      }
    });

    setGeneratedPlot(newPlot);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generador de Tramas</CardTitle>
        <Button onClick={generatePlot} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Nueva Trama
        </Button>
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
