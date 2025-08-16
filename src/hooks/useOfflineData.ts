import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { type Character } from '@/data/characters';
import { type Item } from '@/data/items';

interface InventoryItem extends Item {
  quantity: number;
  characterId?: string;
  equipped?: boolean;
}

interface OfflineData {
  characters: Character[];
  campaigns: any[];
  inventory: InventoryItem[];
  combatLog: any[];
  gameSettings: any;
}

const defaultData: OfflineData = {
  characters: [],
  campaigns: [],
  inventory: [],
  combatLog: [],
  gameSettings: {
    theme: 'dark',
    soundEnabled: true,
    autoSave: true
  }
};

export const useOfflineData = () => {
  const [data, setData, removeData, isLoading] = useLocalStorage<OfflineData>('dnd_offline_data', defaultData);

  // Guardar personaje
  const saveCharacter = (character: Character) => {
    setData(prev => ({
      ...prev,
      characters: [...prev.characters.filter(c => c.id !== character.id), character]
    }));
  };

  // Eliminar personaje
  const deleteCharacter = (characterId: string) => {
    setData(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== characterId)
    }));
  };

  // Guardar campaña
  const saveCampaign = (campaign: any) => {
    setData(prev => ({
      ...prev,
      campaigns: [...prev.campaigns.filter(c => c.id !== campaign.id), campaign]
    }));
  };

  // Agregar item al inventario
  const addToInventory = (item: Item, quantity: number = 1) => {
    setData(prev => {
      const existingItem = prev.inventory.find(i => i.id === item.id);
      if (existingItem) {
        return {
          ...prev,
          inventory: prev.inventory.map(i => 
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        };
      }
      return {
        ...prev,
        inventory: [...prev.inventory, { ...item, quantity } as InventoryItem]
      };
    });
  };

  // Remover item del inventario
  const removeFromInventory = (itemId: string, quantity: number = 1) => {
    setData(prev => ({
      ...prev,
      inventory: prev.inventory.reduce((acc, item) => {
        if (item.id === itemId) {
          const newQuantity = item.quantity - quantity;
          if (newQuantity > 0) {
            acc.push({ ...item, quantity: newQuantity });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as InventoryItem[])
    }));
  };

  // Guardar log de combate
  const saveCombatLog = (logEntry: any) => {
    setData(prev => ({
      ...prev,
      combatLog: [...prev.combatLog, { ...logEntry, timestamp: Date.now() }]
    }));
  };

  // Actualizar configuración
  const updateSettings = (settings: any) => {
    setData(prev => ({
      ...prev,
      gameSettings: { ...prev.gameSettings, ...settings }
    }));
  };

  // Exportar datos para compartir via Bluetooth
  const exportData = () => {
    return JSON.stringify(data);
  };

  // Importar datos desde Bluetooth
  const importData = (jsonData: string) => {
    try {
      const importedData = JSON.parse(jsonData);
      setData(importedData);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  // Limpiar todos los datos
  const clearAllData = () => {
    removeData();
  };

  return {
    data,
    isLoading,
    saveCharacter,
    deleteCharacter,
    saveCampaign,
    addToInventory,
    removeFromInventory,
    saveCombatLog,
    updateSettings,
    exportData,
    importData,
    clearAllData
  };
};