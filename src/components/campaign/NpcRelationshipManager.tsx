import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

interface NPC {
  id: string;
  name: string;
  // other properties
}

interface Relationship {
  source: string;
  target: string;
  type: 'ally' | 'enemy' | 'neutral' | 'family' | 'rival';
}

interface NpcRelationshipManagerProps {
  npcs: NPC[];
  relationships: Relationship[];
  onUpdateRelationships: (relationships: Relationship[]) => void;
}

export const NpcRelationshipManager = ({ npcs, relationships, onUpdateRelationships }: NpcRelationshipManagerProps) => {
  const [sourceNpc, setSourceNpc] = useState<string | null>(null);
  const [targetNpc, setTargetNpc] = useState<string | null>(null);
  const [relationshipType, setRelationshipType] = useState<'ally' | 'enemy' | 'neutral' | 'family' | 'rival'>('neutral');

  const addRelationship = () => {
    if (sourceNpc && targetNpc && sourceNpc !== targetNpc) {
      const newRelationship: Relationship = {
        source: sourceNpc,
        target: targetNpc,
        type: relationshipType,
      };
      onUpdateRelationships([...relationships, newRelationship]);
    }
  };

  const getRelationshipColor = (type: Relationship['type']) => {
    switch (type) {
      case 'ally': return 'stroke-green-500';
      case 'enemy': return 'stroke-red-500';
      case 'rival': return 'stroke-yellow-500';
      case 'family': return 'stroke-blue-500';
      default: return 'stroke-gray-400';
    }
  };

  // Basic layout logic
  const positions = npcs.reduce((acc, npc, index) => {
    const angle = (index / npcs.length) * 2 * Math.PI;
    acc[npc.id] = {
      x: 250 + 200 * Math.cos(angle),
      y: 150 + 100 * Math.sin(angle),
    };
    return acc;
  }, {} as { [key: string]: { x: number; y: number } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestor de Relaciones de NPCs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg">
          <Select onValueChange={setSourceNpc}>
            <SelectTrigger><SelectValue placeholder="Seleccionar PNJ Origen" /></SelectTrigger>
            <SelectContent>{npcs.map(npc => <SelectItem key={npc.id} value={npc.id}>{npc.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={setTargetNpc}>
            <SelectTrigger><SelectValue placeholder="Seleccionar PNJ Destino" /></SelectTrigger>
            <SelectContent>{npcs.map(npc => <SelectItem key={npc.id} value={npc.id}>{npc.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={(v: Relationship['type']) => setRelationshipType(v)} defaultValue="neutral">
            <SelectTrigger><SelectValue placeholder="Tipo de Relación" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ally">Aliado</SelectItem>
              <SelectItem value="enemy">Enemigo</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="family">Familia</SelectItem>
              <SelectItem value="rival">Rival</SelectItem>
            </SelectContent>
          </Select>
          <div className="md:col-span-3">
            <Button onClick={addRelationship} className="w-full">Añadir Relación</Button>
          </div>
        </div>

        <div className="relative w-full h-96">
          <svg width="100%" height="100%" viewBox="0 0 500 300">
            {relationships.map((rel, i) => {
              const sourcePos = positions[rel.source];
              const targetPos = positions[rel.target];
              if (!sourcePos || !targetPos) return null;
              return (
                <line
                  key={i}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  className={`${getRelationshipColor(rel.type)} stroke-2`}
                  markerEnd="url(#arrow)"
                />
              );
            })}
             <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#888" />
                </marker>
            </defs>
          </svg>
          {npcs.map(npc => {
            const pos = positions[npc.id];
            if (!pos) return null;
            return (
              <div
                key={npc.id}
                className="absolute p-2 bg-primary text-primary-foreground rounded-md shadow-lg"
                style={{ left: `${pos.x - 20}px`, top: `${pos.y - 15}px`, minWidth: '60px', textAlign: 'center' }}
              >
                {npc.name}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
