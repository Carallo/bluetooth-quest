import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Coins, Sword, BookOpen, Plus, Save, Play, Pause, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface GameSession {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: 'planning' | 'active' | 'completed';
  participants: string[];
  events: SessionEvent[];
  notes: string;
  experience: number;
  treasure: string[];
  createdAt: string;
}

interface SessionEvent {
  id: string;
  timestamp: string;
  type: 'combat' | 'roleplay' | 'exploration' | 'rest' | 'treasure' | 'experience';
  description: string;
  details?: any;
}

export const SessionManager = () => {
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSession, setNewSession] = useState<Partial<GameSession>>({
    title: '',
    participants: [],
    notes: ''
  });
  const [sessionTimer, setSessionTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const [sessions, setSessions] = useLocalStorage<GameSession[]>('game-sessions', []);
  const { toast } = useToast();

  const createSession = () => {
    if (!newSession.title) {
      toast({
        title: "Error",
        description: "El título de la sesión es requerido",
        variant: "destructive"
      });
      return;
    }

    const session: GameSession = {
      id: Date.now().toString(),
      title: newSession.title!,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      duration: 0,
      status: 'planning',
      participants: newSession.participants || [],
      events: [],
      notes: newSession.notes || '',
      experience: 0,
      treasure: [],
      createdAt: new Date().toISOString()
    };

    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);
    setActiveSession(session);
    setIsCreating(false);
    setNewSession({ title: '', participants: [], notes: '' });

    toast({
      title: "Sesión creada",
      description: `"${session.title}" ha sido creada exitosamente`,
    });
  };

  const startSession = (session: GameSession) => {
    if (activeSession && activeSession.status === 'active') {
      toast({
        title: "Error",
        description: "Ya hay una sesión activa",
        variant: "destructive"
      });
      return;
    }

    const updatedSession = {
      ...session,
      status: 'active' as const,
      startTime: new Date().toISOString()
    };

    const updatedSessions = sessions.map(s => 
      s.id === session.id ? updatedSession : s
    );
    
    setSessions(updatedSessions);
    setActiveSession(updatedSession);
    setSessionTimer(0);

    // Start timer
    const interval = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);

    toast({
      title: "Sesión iniciada",
      description: `"${session.title}" está ahora activa`,
    });
  };

  const pauseSession = () => {
    if (activeSession) {
      const updatedSession = {
        ...activeSession,
        status: 'planning' as const,
        duration: activeSession.duration + sessionTimer
      };

      const updatedSessions = sessions.map(s => 
        s.id === activeSession.id ? updatedSession : s
      );
      
      setSessions(updatedSessions);
      setActiveSession(updatedSession);

      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      toast({
        title: "Sesión pausada",
        description: "La sesión ha sido pausada",
      });
    }
  };

  const endSession = () => {
    if (activeSession) {
      const updatedSession = {
        ...activeSession,
        status: 'completed' as const,
        endTime: new Date().toISOString(),
        duration: activeSession.duration + sessionTimer
      };

      const updatedSessions = sessions.map(s => 
        s.id === activeSession.id ? updatedSession : s
      );
      
      setSessions(updatedSessions);
      setActiveSession(null);
      setSessionTimer(0);

      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      toast({
        title: "Sesión completada",
        description: `"${activeSession.title}" ha terminado`,
      });
    }
  };

  const addSessionEvent = (type: SessionEvent['type'], description: string, details?: any) => {
    if (!activeSession) return;

    const event: SessionEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      description,
      details
    };

    const updatedSession = {
      ...activeSession,
      events: [...activeSession.events, event]
    };

    const updatedSessions = sessions.map(s => 
      s.id === activeSession.id ? updatedSession : s
    );
    
    setSessions(updatedSessions);
    setActiveSession(updatedSession);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: GameSession['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: GameSession['status']) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'planning': return 'Planificando';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Active Session Info */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-primary">
          <Clock className="w-5 h-5 inline mr-2" />
          Gestor de Sesiones
        </h3>
        <div className="flex items-center gap-4">
          {activeSession && (
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(activeSession.status)} text-white`}>
                {getStatusText(activeSession.status)}
              </Badge>
              <span className="text-lg font-mono">
                {formatDuration(sessionTimer + activeSession.duration)}
              </span>
            </div>
          )}
          <EpicButton onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Sesión
          </EpicButton>
        </div>
      </div>

      {/* Active Session Controls */}
      {activeSession && (
        <Card className="p-6 bg-gradient-epic border-primary">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold">{activeSession.title}</h4>
              <p className="text-sm text-muted-foreground">
                {activeSession.participants.length} participantes • {activeSession.events.length} eventos
              </p>
            </div>
            <div className="flex gap-2">
              {activeSession.status === 'active' ? (
                <>
                  <EpicButton variant="outline" onClick={pauseSession}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </EpicButton>
                  <EpicButton variant="outline" onClick={endSession}>
                    <Square className="w-4 h-4 mr-2" />
                    Terminar
                  </EpicButton>
                </>
              ) : (
                <EpicButton onClick={() => startSession(activeSession)}>
                  <Play className="w-4 h-4 mr-2" />
                  Reanudar
                </EpicButton>
              )}
            </div>
          </div>

          {/* Quick Event Buttons */}
          <div className="flex gap-2 mb-4">
            <EpicButton 
              variant="outline" 
              size="sm" 
              onClick={() => addSessionEvent('combat', 'Iniciado combate')}
            >
              <Sword className="w-4 h-4 mr-1" />
              Combate
            </EpicButton>
            <EpicButton 
              variant="outline" 
              size="sm" 
              onClick={() => addSessionEvent('roleplay', 'Escena de interpretación')}
            >
              <Users className="w-4 h-4 mr-1" />
              Roleplay
            </EpicButton>
            <EpicButton 
              variant="outline" 
              size="sm" 
              onClick={() => addSessionEvent('rest', 'Descanso corto/largo')}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Descanso
            </EpicButton>
            <EpicButton 
              variant="outline" 
              size="sm" 
              onClick={() => addSessionEvent('treasure', 'Tesoro encontrado')}
            >
              <Coins className="w-4 h-4 mr-1" />
              Tesoro
            </EpicButton>
          </div>

          {/* Recent Events */}
          <div>
            <h5 className="font-medium mb-2">Eventos Recientes</h5>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {activeSession.events.slice(-5).reverse().map(event => (
                  <div key={event.id} className="text-sm p-2 bg-muted/50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{event.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{event.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Card>
      )}

      {/* Create New Session */}
      {isCreating && (
        <Card className="p-6 bg-gradient-medieval border-primary/30">
          <h4 className="text-lg font-bold text-primary mb-4">Nueva Sesión</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título de la Sesión</label>
              <Input
                value={newSession.title || ''}
                onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Capítulo 1 - La Taberna del Dragón"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notas Previas</label>
              <Textarea
                value={newSession.notes || ''}
                onChange={(e) => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Objetivos de la sesión, preparación previa..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <EpicButton onClick={createSession}>
                <Save className="w-4 h-4 mr-2" />
                Crear Sesión
              </EpicButton>
              <EpicButton variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </EpicButton>
            </div>
          </div>
        </Card>
      )}

      {/* Sessions History */}
      <Card className="p-6 bg-gradient-medieval border-primary/30">
        <h4 className="text-lg font-bold text-primary mb-4">Historial de Sesiones</h4>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session.id} className="p-4 bg-muted rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{session.title}</h5>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(session.status)} text-white`}>
                      {getStatusText(session.status)}
                    </Badge>
                    {session.status !== 'active' && (
                      <EpicButton
                        variant="outline"
                        size="sm"
                        onClick={() => startSession(session)}
                      >
                        <Play className="w-4 h-4" />
                      </EpicButton>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>📅 {session.date}</span>
                  <span>⏱️ {formatDuration(session.duration)}</span>
                  <span>👥 {session.participants.length} jugadores</span>
                  <span>📝 {session.events.length} eventos</span>
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay sesiones registradas</p>
                <p className="text-sm">Crea una nueva sesión para empezar</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};