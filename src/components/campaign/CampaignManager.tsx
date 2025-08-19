import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Users, 
  MapPin, 
  Calendar, 
  Crown, 
  Sword, 
  Coins,
  Plus,
  Edit,
  Trash2,
  Save,
  Wand2,
  Store
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlotGenerator } from './PlotGenerator';
import { NpcRelationshipManager } from './NpcRelationshipManager';
import { ShopInterface } from '../shop/ShopInterface';
import { Character, characters as allCharacters } from '@/data/characters';
import { items } from '@/data/items';
import { bestiary } from '@/data/bestiary';
import { InventoryItem } from "../character/InventoryManager";

interface Relationship {
  id: string;
  source: string;
  target: string;
  type: 'ally' | 'enemy' | 'neutral' | 'family' | 'rival';
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  setting: string;
  level: number;
  status: 'planning' | 'active' | 'completed' | 'paused';
  createdAt: string;
  lastSession: string;
  nextSession: string;
  playerCharacters: (Character & { inventory: InventoryItem[] })[];
  sessions: CampaignSession[];
  notes: CampaignNote[];
  npcs: (CampaignNPC & { inventory: InventoryItem[], gold: number });
  locations: CampaignLocation[];
  relationships: Relationship[];
}

interface CampaignSession {
  id: string;
  title: string;
  date: string;
  duration: number;
  summary: string;
  experience: number;
  treasure: string[];
}

interface CampaignNote {
  id: string;
  title: string;
  content: string;
  category: 'plot' | 'npc' | 'location' | 'rule' | 'general';
  createdAt: string;
}

interface CampaignNPC {
  id: string;
  name: string;
  description: string;
  role: string;
  location: string;
  relationship: 'ally' | 'neutral' | 'enemy' | 'unknown';
  notes: string;
}

interface CampaignLocation {
  id: string;
  name: string;
  description: string;
  type: 'city' | 'dungeon' | 'wilderness' | 'plane' | 'other';
  connections: string[];
  secrets: string;
}

interface CampaignManagerProps {
  onBack: () => void;
}

import { useOfflineData } from "@/hooks/useOfflineData";

export const CampaignManager = ({ onBack }: CampaignManagerProps) => {
  const { data, saveCampaign, addCharacter, updateCharacter } = useOfflineData();
  const { campaigns } = data;
  
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(campaigns.length > 0 ? campaigns[0] : null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const { startServer, stopServer } = useBluetooth();
  const [isHosting, setIsHosting] = useState(false);

  const handleUpdateCharacter = (updatedCharacter: Character & { inventory: InventoryItem[] }) => {
    if (selectedCampaign) {
      const isPlayerCharacter = selectedCampaign.playerCharacters.some(pc => pc.id === updatedCharacter.id);

      let updatedCampaign: Campaign;

      if (isPlayerCharacter) {
        updatedCampaign = { ...selectedCampaign, playerCharacters: selectedCampaign.playerCharacters.map(pc => pc.id === updatedCharacter.id ? updatedCharacter : pc) };
      } else {
        const updatedNpcs = selectedCampaign.npcs.map(npc => npc.id === updatedCharacter.id ? updatedCharacter as any : npc);
        updatedCampaign = { ...selectedCampaign, npcs: updatedNpcs };
      }

      saveCampaign(updatedCampaign);
      setSelectedCampaign(updatedCampaign);
    }
  };

  const handleHostSession = async () => {
    if (!selectedCampaign) return;

    const onCharacterReceived = (charData: string) => {
      try {
        const newPC = JSON.parse(charData) as Character;
        addCharacter(newPC); // Add to global characters list

        const campaignPC = { ...newPC, inventory: [] };
        const updatedCampaign = {
          ...selectedCampaign,
          playerCharacters: [...selectedCampaign.playerCharacters, campaignPC]
        };
        saveCampaign(updatedCampaign);
        setSelectedCampaign(updatedCampaign);

        toast({ title: '¡Jugador Unido!', description: `${newPC.name} se ha unido a la campaña.` });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron recibir los datos del personaje.' });
      }
    };

    try {
      await startServer(onCharacterReceived);
      setIsHosting(true);
      toast({ title: 'Sesión Iniciada', description: 'Esperando que los jugadores se conecten por Bluetooth...' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error de Bluetooth', description: (error as Error).message });
    }
  };

  const handleStopHosting = async () => {
    await stopServer();
    setIsHosting(false);
    toast({ title: 'Sesión Detenida', description: 'Se ha cerrado la conexión Bluetooth.' });
  };

  const createCampaign = () => {
    if (!newCampaign.name) {
      toast({
        title: "Error",
        description: "El nombre de la campaña es requerido",
        variant: "destructive"
      });
      return;
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name || '',
      description: newCampaign.description || '',
      setting: newCampaign.setting || '',
      level: 1,
      status: 'planning',
      createdAt: new Date().toISOString().split('T')[0],
      lastSession: '',
      nextSession: '',
      playerCharacters: [],
      sessions: [],
      notes: [],
      npcs: [],
      locations: [],
      relationships: []
    };

    saveCampaign(campaign);
    setSelectedCampaign(campaign);
    setIsCreating(false);
    setNewCampaign({});
    
    toast({
      title: "Campaña creada",
      description: `"${campaign.name}" ha sido creada exitosamente`,
    });
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'planning': return 'Planificando';
      case 'paused': return 'Pausada';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <EpicButton variant="ghost" onClick={onBack}>
            ← Volver
          </EpicButton>
          <h1 className="text-3xl font-bold text-primary">
            <Crown className="w-8 h-8 inline mr-2" />
            Gestor de Campañas
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isHosting ? (
            <EpicButton onClick={handleStopHosting} variant="destructive" className="animate-pulse">
              <BluetoothConnected className="w-4 h-4 mr-2" />
              Detener Sesión
            </EpicButton>
          ) : (
            <EpicButton onClick={handleHostSession} disabled={!selectedCampaign}>
              <UserPlus className="w-4 h-4 mr-2" />
              Iniciar Sesión de Jugadores
            </EpicButton>
          )}
          <EpicButton onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Campaña
          </EpicButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de campañas */}
        <Card className="lg:col-span-1 p-4 bg-gradient-medieval border-primary/30">
          <h3 className="text-lg font-bold text-primary mb-4">Mis Campañas</h3>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className={`p-3 rounded-md cursor-pointer transition-all ${
                    selectedCampaign?.id === campaign.id 
                      ? 'bg-primary/20 border border-primary' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{campaign.name}</h4>
                    <Badge className={`text-xs ${getStatusColor(campaign.status)} text-white`}>
                      {getStatusText(campaign.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Nivel {campaign.level} • {campaign.playerCount} jugadores
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.setting}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Detalles de la campaña */}
        <div className="lg:col-span-3">
          {isCreating ? (
            /* Crear nueva campaña */
            <Card className="p-6 bg-gradient-medieval border-primary/30">
              <h3 className="text-xl font-bold text-primary mb-4">Nueva Campaña</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre de la Campaña</label>
                  <Input
                    value={newCampaign.name || ''}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Los Héroes de Faerun"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <Textarea
                    value={newCampaign.description || ''}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe la premisa de tu campaña..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ambientación</label>
                  <Input
                    value={newCampaign.setting || ''}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, setting: e.target.value }))}
                    placeholder="Ej: Forgotten Realms, Homebrew, etc."
                  />
                </div>
                <div className="flex gap-3">
                  <EpicButton onClick={createCampaign}>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Campaña
                  </EpicButton>
                  <EpicButton variant="outline" onClick={() => setIsCreating(false)}>
                    Cancelar
                  </EpicButton>
                </div>
              </div>
            </Card>
          ) : selectedCampaign && (
            /* Detalles de campaña seleccionada */
            <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="sessions">Sesiones</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
                <TabsTrigger value="npcs">PNJs</TabsTrigger>
                <TabsTrigger value="pcs">PJs</TabsTrigger>
                <TabsTrigger value="locations">Lugares</TabsTrigger>
                <TabsTrigger value="relationships">Relaciones</TabsTrigger>
                <TabsTrigger value="plot-generator">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Ideas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="p-6 bg-gradient-medieval border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-primary">{selectedCampaign.name}</h2>
                    <Badge className={`${getStatusColor(selectedCampaign.status)} text-white`}>
                      {getStatusText(selectedCampaign.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">{selectedCampaign.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted rounded-md">
                      <div className="text-2xl font-bold text-primary">{selectedCampaign.level}</div>
                      <div className="text-sm text-muted-foreground">Nivel Promedio</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-md">
                      <div className="text-2xl font-bold text-primary">{selectedCampaign.playerCharacters.length}</div>
                      <div className="text-sm text-muted-foreground">Jugadores</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-md">
                      <div className="text-2xl font-bold text-primary">{selectedCampaign.sessions.length}</div>
                      <div className="text-sm text-muted-foreground">Sesiones</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-md">
                      <div className="text-2xl font-bold text-primary">{selectedCampaign.notes.length}</div>
                      <div className="text-sm text-muted-foreground">Notas</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Ambientación
                      </h4>
                      <p className="text-muted-foreground">{selectedCampaign.setting}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Próxima Sesión
                      </h4>
                      <p className="text-muted-foreground">
                        {selectedCampaign.nextSession || 'No programada'}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="sessions">
                <Card className="p-6 bg-gradient-medieval border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-primary">Sesiones</h3>
                    <EpicButton size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Sesión
                    </EpicButton>
                  </div>
                  <div className="space-y-4">
                    {selectedCampaign.sessions.map(session => (
                      <div key={session.id} className="p-4 bg-muted rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{session.title}</h4>
                          <Badge variant="outline">{session.date}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{session.summary}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>⏱️ {session.duration} min</span>
                          <span>⭐ {session.experience} XP</span>
                          <span>💰 {session.treasure.length} objetos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card className="p-6 bg-gradient-medieval border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-primary">Notas de Campaña</h3>
                    <EpicButton size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Nota
                    </EpicButton>
                  </div>
                  <div className="space-y-3">
                    {selectedCampaign.notes.map(note => (
                      <div key={note.id} className="p-4 bg-muted rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{note.title}</h4>
                          <Badge variant="outline">{note.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="npcs">
                <Card className="p-6 bg-gradient-medieval border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-primary">NPCs</h3>
                    <EpicButton size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo NPC
                    </EpicButton>
                  </div>
                  <div className="space-y-3">
                    {selectedCampaign.npcs.map(npc => (
                      <div key={npc.id} className="p-4 bg-muted rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{npc.name}</h4>
                          <Badge 
                            variant="outline"
                            className={
                              npc.relationship === 'ally' ? 'border-green-500 text-green-600' :
                              npc.relationship === 'enemy' ? 'border-red-500 text-red-600' :
                              'border-yellow-500 text-yellow-600'
                            }
                          >
                            {npc.relationship}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{npc.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span><span className="font-medium">Rol:</span> {npc.role}</span>
                          <span><span className="font-medium">Ubicación:</span> {npc.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="locations">
                <Card className="p-6 bg-gradient-medieval border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-primary">Lugares</h3>
                    <EpicButton size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Lugar
                    </EpicButton>
                  </div>
                  <div className="space-y-3">
                    {selectedCampaign.locations.map(location => (
                      <div key={location.id} className="p-4 bg-muted rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{location.name}</h4>
                          <Badge variant="outline">{location.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{location.description}</p>
                        {location.connections.length > 0 && (
                          <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <span className="font-medium">Conectado a:</span>
                            <span>{location.connections.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="plot-generator">
                <PlotGenerator
                  npcs={selectedCampaign.npcs}
                  items={items}
                  creatures={bestiary}
                />
              </TabsContent>
              <TabsContent value="relationships">
                <NpcRelationshipManager
                  npcs={selectedCampaign.npcs}
                  campaignId={selectedCampaign.id}
                />
              </TabsContent>
               <TabsContent value="shop">
                 <ShopInterface
                    characters={[...selectedCampaign.playerCharacters, ...selectedCampaign.npcs]}
                    onUpdateCharacter={handleUpdateCharacter}
                 />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};