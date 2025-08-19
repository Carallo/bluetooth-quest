import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Trash2, List, Share2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

// Assuming a global list of NPCs might be available, for now using a prop
interface NPC {
  id: string;
  name: string;
}

interface Relationship {
  id: string;
  source: string;
  target: string;
  type: 'ally' | 'enemy' | 'neutral' | 'family' | 'rival';
}

interface NpcRelationshipManagerProps {
  npcs: NPC[]; // Let's assume the campaign manager passes the list of NPCs
  campaignId: string; // To create a unique storage key for relationships
}

export const NpcRelationshipManager = ({ npcs, campaignId }: NpcRelationshipManagerProps) => {
  const storageKey = `npc-relationships-${campaignId}`;
  const [relationships, setRelationships] = useLocalStorage<Relationship[]>(storageKey, []);

  const [sourceNpc, setSourceNpc] = useState<string>('');
  const [targetNpc, setTargetNpc] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<Relationship['type']>('neutral');
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  const addRelationship = () => {
    if (!sourceNpc || !targetNpc) {
      toast({ variant: 'destructive', title: 'Selección incompleta', description: 'Debes seleccionar un PNJ de origen y uno de destino.' });
      return;
    }
    if (sourceNpc === targetNpc) {
      toast({ variant: 'destructive', title: 'Selección inválida', description: 'Un PNJ no puede tener una relación consigo mismo.' });
      return;
    }
    const existingRelationship = relationships.find(r => (r.source === sourceNpc && r.target === targetNpc));
    if (existingRelationship) {
        toast({ variant: 'destructive', title: 'Relación ya existe', description: 'Ya existe una relación directa entre estos dos PNJ. Bórrala para añadir una nueva.' });
        return;
    }

    const newRelationship: Relationship = {
      id: `${sourceNpc}-${targetNpc}-${Date.now()}`,
      source: sourceNpc,
      target: targetNpc,
      type: relationshipType,
    };
    setRelationships([...relationships, newRelationship]);
    toast({ title: 'Relación añadida', description: `Se ha creado una relación de ${relationshipType} entre los PNJ.` });
  };

  const removeRelationship = (id: string) => {
    setRelationships(relationships.filter(r => r.id !== id));
    toast({ title: 'Relación eliminada' });
  };

  const getRelationshipStyles = (type: Relationship['type']) => {
    switch (type) {
      case 'ally': return { line: 'stroke-green-500', marker: 'fill-green-500', badge: 'bg-green-500/20 text-green-700' };
      case 'enemy': return { line: 'stroke-red-500', marker: 'fill-red-500', badge: 'bg-red-500/20 text-red-700' };
      case 'rival': return { line: 'stroke-yellow-500', marker: 'fill-yellow-500', badge: 'bg-yellow-500/20 text-yellow-700' };
      case 'family': return { line: 'stroke-blue-500', marker: 'fill-blue-500', badge: 'bg-blue-500/20 text-blue-700' };
      default: return { line: 'stroke-gray-400', marker: 'fill-gray-400', badge: 'bg-gray-500/20 text-gray-700' };
    }
  };

  const positions = useMemo(() => {
    if (npcs.length === 0) return {};
    return npcs.reduce((acc, npc, index) => {
        const angle = (index / npcs.length) * 2 * Math.PI;
        acc[npc.id] = {
        x: 250 + 200 * Math.cos(angle),
        y: 150 + 100 * Math.sin(angle),
        };
        return acc;
    }, {} as { [key: string]: { x: number; y: number } });
  }, [npcs]);

  const npcMap = useMemo(() => new Map(npcs.map(npc => [npc.id, npc.name])), [npcs]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Gestor de Relaciones de NPCs</CardTitle>
                <CardDescription>Visualiza y gestiona la red de alianzas y enemistades.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'graph' ? 'list' : 'graph')}>
                {viewMode === 'graph' ? <List className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                {viewMode === 'graph' ? 'Ver Lista' : 'Ver Gráfico'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg">
          <Select onValueChange={setSourceNpc} value={sourceNpc}><SelectTrigger><SelectValue placeholder="PNJ Origen" /></SelectTrigger><SelectContent>{npcs.map(npc => <SelectItem key={npc.id} value={npc.id}>{npc.name}</SelectItem>)}</SelectContent></Select>
          <Select onValueChange={setTargetNpc} value={targetNpc}><SelectTrigger><SelectValue placeholder="PNJ Destino" /></SelectTrigger><SelectContent>{npcs.map(npc => <SelectItem key={npc.id} value={npc.id}>{npc.name}</SelectItem>)}</SelectContent></Select>
          <Select onValueChange={(v: Relationship['type']) => setRelationshipType(v)} defaultValue="neutral"><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="ally">Aliado</SelectItem><SelectItem value="enemy">Enemigo</SelectItem><SelectItem value="neutral">Neutral</SelectItem><SelectItem value="family">Familia</SelectItem><SelectItem value="rival">Rival</SelectItem></SelectContent></Select>
          <div className="md:col-span-3"><Button onClick={addRelationship} className="w-full">Añadir Relación</Button></div>
        </div>

        {viewMode === 'graph' ? (
          <div className="relative w-full h-96 bg-muted/20 rounded-lg overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 500 300">
              <defs>
                {Object.keys(getRelationshipStyles('ally')).map(type =>
                    <marker key={type} id={`arrow-${type}`} viewBox="0 -5 10 10" refX="8" refY="0" markerWidth="5" markerHeight="5" orient="auto">
                        <path d="M0,-5L10,0L0,5" className={getRelationshipStyles(type as Relationship['type']).marker} />
                    </marker>
                )}
              </defs>
              {relationships.map((rel) => {
                const sourcePos = positions[rel.source];
                const targetPos = positions[rel.target];
                if (!sourcePos || !targetPos) return null;
                const { line, marker } = getRelationshipStyles(rel.type);
                return ( <line key={rel.id} x1={sourcePos.x} y1={sourcePos.y} x2={targetPos.x} y2={targetPos.y} className={`${line} stroke-2 opacity-70`} markerEnd={`url(#arrow-${rel.type})`} /> );
              })}
            </svg>
            {npcs.map(npc => {
              const pos = positions[npc.id];
              if (!pos) return null;
              return ( <div key={npc.id} className="absolute p-2 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center w-24" style={{ left: `${pos.x - 48}px`, top: `${pos.y - 18}px` }}> {npc.name} </div> );
            })}
          </div>
        ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {relationships.map(rel => (
                    <Card key={rel.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                           <span className="font-semibold">{npcMap.get(rel.source) || 'Desconocido'}</span>
                           <ArrowRight className="w-4 h-4 text-muted-foreground" />
                           <span className="font-semibold">{npcMap.get(rel.target) || 'Desconocido'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <Badge className={getRelationshipStyles(rel.type).badge}>{rel.type.charAt(0).toUpperCase() + rel.type.slice(1)}</Badge>
                           <Button variant="ghost" size="icon" onClick={() => removeRelationship(rel.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                    </Card>
                ))}
                {relationships.length === 0 && <p className="text-center text-muted-foreground">No hay relaciones definidas.</p>}
            </div>
        )}
      </CardContent>
    </Card>
  );
};
