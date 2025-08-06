import { useState } from "react";
import { EpicButton } from "@/components/ui/epic-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Eye, Heart, Shield, Zap } from "lucide-react";
import { type Character } from "@/data/characters";
import { useToast } from "@/hooks/use-toast";

interface CharacterListProps {
  characters: Character[];
  onCreateNew: () => void;
  onEdit: (character: Character) => void;
  onView: (character: Character) => void;
  onDelete: (characterId: string) => void;
}

export const CharacterList = ({ characters, onCreateNew, onEdit, onView, onDelete }: CharacterListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteCharacter, setDeleteCharacter] = useState<Character | null>(null);

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (character: Character) => {
    onDelete(character.id);
    setDeleteCharacter(null);
    toast({
      title: "Personaje eliminado",
      description: `${character.name} ha sido eliminado`,
      variant: "destructive"
    });
  };

  const getHealthStatus = (character: Character) => {
    const percentage = (character.hitPoints.current / character.hitPoints.maximum) * 100;
    if (percentage <= 25) return "text-destructive";
    if (percentage <= 50) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Mis Personajes</h2>
          <p className="text-muted-foreground">
            {characters.length} personaje{characters.length !== 1 ? 's' : ''} creado{characters.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar personajes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <EpicButton onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Personaje
          </EpicButton>
        </div>
      </div>

      {/* Lista de personajes */}
      {filteredCharacters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {characters.length === 0 ? (
              <>
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  ¡Crea tu primer personaje!
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Comienza tu aventura creando un personaje único con estadísticas, habilidades y trasfondo personalizado.
                </p>
                <EpicButton onClick={onCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Personaje
                </EpicButton>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  No se encontraron personajes
                </h3>
                <p className="text-muted-foreground text-center">
                  Intenta con otros términos de búsqueda
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <Card key={character.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{character.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {character.race} {character.class}
                    </p>
                  </div>
                  <Badge variant="outline">Nivel {character.level}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className={`text-sm font-medium ${getHealthStatus(character)}`}>
                        {character.hitPoints.current}/{character.hitPoints.maximum}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">PV</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{character.armorClass}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">CA</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">+{character.proficiencyBonus}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Comp.</p>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="space-y-2">
                  {character.background && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Trasfondo:</span>
                      <Badge variant="secondary" className="text-xs">{character.background}</Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Actualizado:</span>
                    <span className="text-xs">
                      {new Date(character.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <EpicButton variant="outline" size="sm" onClick={() => onView(character)} className="flex-1">
                    <Eye className="w-4 h-4" />
                  </EpicButton>
                  <EpicButton variant="outline" size="sm" onClick={() => onEdit(character)} className="flex-1">
                    <Edit className="w-4 h-4" />
                  </EpicButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <EpicButton variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </EpicButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar personaje?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente el personaje "{character.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(character)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};