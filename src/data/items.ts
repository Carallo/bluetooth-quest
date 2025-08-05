export interface Item {
  id: string;
  name: string;
  category: 'weapons' | 'armor' | 'potions' | 'magic' | 'consumables' | 'tools';
  price: number;
  damage?: string;
  armorClass?: number;
  effect?: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const items: Item[] = [
  // Armas
  {
    id: 'sword-short',
    name: 'Espada Corta',
    category: 'weapons',
    price: 10,
    damage: '1d6',
    description: 'Una espada ligera y versátil, perfecta para combate cuerpo a cuerpo.',
    rarity: 'common'
  },
  {
    id: 'sword-long',
    name: 'Espada Larga',
    category: 'weapons',
    price: 15,
    damage: '1d8',
    description: 'Espada de una mano con mayor alcance y daño.',
    rarity: 'common'
  },
  {
    id: 'sword-great',
    name: 'Espada a Dos Manos',
    category: 'weapons',
    price: 50,
    damage: '2d6',
    description: 'Poderosa espada que requiere ambas manos pero causa gran daño.',
    rarity: 'uncommon'
  },
  {
    id: 'bow-short',
    name: 'Arco Corto',
    category: 'weapons',
    price: 25,
    damage: '1d6',
    description: 'Arco ligero ideal para ataques a distancia.',
    rarity: 'common'
  },
  {
    id: 'bow-long',
    name: 'Arco Largo',
    category: 'weapons',
    price: 50,
    damage: '1d8',
    description: 'Arco poderoso con mayor alcance y precisión.',
    rarity: 'uncommon'
  },
  {
    id: 'dagger',
    name: 'Daga',
    category: 'weapons',
    price: 2,
    damage: '1d4',
    description: 'Arma ligera y rápida, útil para ataques sigilosos.',
    rarity: 'common'
  },
  {
    id: 'mace',
    name: 'Maza',
    category: 'weapons',
    price: 5,
    damage: '1d6',
    description: 'Arma contundente efectiva contra armaduras.',
    rarity: 'common'
  },
  {
    id: 'staff-magic',
    name: 'Bastón Mágico',
    category: 'weapons',
    price: 100,
    damage: '1d6',
    effect: '+2 al daño mágico',
    description: 'Bastón imbuido con poder arcano que amplifica la magia.',
    rarity: 'rare'
  },

  // Armaduras
  {
    id: 'leather-armor',
    name: 'Armadura de Cuero',
    category: 'armor',
    price: 10,
    armorClass: 11,
    description: 'Armadura ligera hecha de cuero endurecido.',
    rarity: 'common'
  },
  {
    id: 'chain-mail',
    name: 'Cota de Malla',
    category: 'armor',
    price: 50,
    armorClass: 13,
    description: 'Armadura de anillos entrelazados que ofrece buena protección.',
    rarity: 'uncommon'
  },
  {
    id: 'plate-armor',
    name: 'Armadura de Placas',
    category: 'armor',
    price: 150,
    armorClass: 16,
    description: 'La mejor protección disponible, hecha de placas de acero.',
    rarity: 'rare'
  },
  {
    id: 'shield-wooden',
    name: 'Escudo de Madera',
    category: 'armor',
    price: 5,
    armorClass: 1,
    description: 'Escudo básico que proporciona protección adicional.',
    rarity: 'common'
  },
  {
    id: 'shield-steel',
    name: 'Escudo de Acero',
    category: 'armor',
    price: 20,
    armorClass: 2,
    description: 'Escudo resistente forjado en acero de alta calidad.',
    rarity: 'uncommon'
  },

  // Pociones
  {
    id: 'potion-healing-minor',
    name: 'Poción de Curación Menor',
    category: 'potions',
    price: 25,
    effect: 'Restaura 1d4+1 PV',
    description: 'Una poción básica que cura heridas leves.',
    rarity: 'common'
  },
  {
    id: 'potion-healing',
    name: 'Poción de Curación',
    category: 'potions',
    price: 50,
    effect: 'Restaura 2d4+2 PV',
    description: 'Poción estándar que cura heridas moderadas.',
    rarity: 'uncommon'
  },
  {
    id: 'potion-healing-greater',
    name: 'Poción de Curación Mayor',
    category: 'potions',
    price: 100,
    effect: 'Restaura 4d4+4 PV',
    description: 'Poción poderosa que cura heridas graves.',
    rarity: 'rare'
  },
  {
    id: 'potion-mana',
    name: 'Poción de Maná',
    category: 'potions',
    price: 75,
    effect: 'Restaura 1d4+1 puntos de hechizo',
    description: 'Restaura la energía mágica del usuario.',
    rarity: 'uncommon'
  },
  {
    id: 'potion-strength',
    name: 'Poción de Fuerza',
    category: 'potions',
    price: 60,
    effect: '+2 Fuerza por 1 hora',
    description: 'Aumenta temporalmente la fuerza física.',
    rarity: 'uncommon'
  },

  // Objetos Mágicos
  {
    id: 'ring-protection',
    name: 'Anillo de Protección',
    category: 'magic',
    price: 200,
    effect: '+1 CA y salvaciones',
    description: 'Anillo encantado que protege de todo tipo de daño.',
    rarity: 'rare'
  },
  {
    id: 'amulet-health',
    name: 'Amuleto de Salud',
    category: 'magic',
    price: 150,
    effect: '+2 Constitución',
    description: 'Amuleto que fortalece la vitalidad del portador.',
    rarity: 'rare'
  },
  {
    id: 'cloak-elvenkind',
    name: 'Capa Élfica',
    category: 'magic',
    price: 100,
    effect: '+2 Sigilo',
    description: 'Capa tejida por elfos que ayuda a moverse sin ser detectado.',
    rarity: 'uncommon'
  },
  {
    id: 'boots-speed',
    name: 'Botas de Velocidad',
    category: 'magic',
    price: 120,
    effect: '+10 pies velocidad',
    description: 'Botas encantadas que aumentan la velocidad de movimiento.',
    rarity: 'rare'
  },

  // Consumibles
  {
    id: 'rations',
    name: 'Raciones de Viaje',
    category: 'consumables',
    price: 2,
    effect: 'Sustento por 1 día',
    description: 'Alimento preservado para largos viajes.',
    rarity: 'common'
  },
  {
    id: 'torch',
    name: 'Antorcha',
    category: 'consumables',
    price: 1,
    effect: 'Iluminación por 1 hora',
    description: 'Proporciona luz en lugares oscuros.',
    rarity: 'common'
  },
  {
    id: 'rope',
    name: 'Cuerda (15 metros)',
    category: 'tools',
    price: 5,
    description: 'Cuerda resistente útil para escalar y atar.',
    rarity: 'common'
  },
  {
    id: 'bedroll',
    name: 'Saco de Dormir',
    category: 'tools',
    price: 5,
    description: 'Proporciona comodidad para descansar.',
    rarity: 'common'
  },
  {
    id: 'thieves-tools',
    name: 'Herramientas de Ladrón',
    category: 'tools',
    price: 25,
    effect: '+2 a abrir cerraduras',
    description: 'Conjunto de ganzúas y herramientas especializadas.',
    rarity: 'uncommon'
  }
];

export const getItemsByCategory = (category: Item['category']): Item[] => {
  return items.filter(item => item.category === category);
};

export const getItemById = (id: string): Item | undefined => {
  return items.find(item => item.id === id);
};

export const getRarityColor = (rarity: Item['rarity']): string => {
  switch (rarity) {
    case 'common': return 'text-muted-foreground';
    case 'uncommon': return 'text-primary';
    case 'rare': return 'text-accent';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-destructive';
    default: return 'text-muted-foreground';
  }
};

export const categories = [
  { id: 'weapons', name: 'Armas', icon: '⚔️' },
  { id: 'armor', name: 'Armaduras', icon: '🛡️' },
  { id: 'potions', name: 'Pociones', icon: '🧪' },
  { id: 'magic', name: 'Objetos Mágicos', icon: '✨' },
  { id: 'consumables', name: 'Consumibles', icon: '🍞' },
  { id: 'tools', name: 'Herramientas', icon: '🔧' }
] as const;