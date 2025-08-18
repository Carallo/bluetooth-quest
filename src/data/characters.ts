import { Item } from './items';

export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  experience: number;
  hitPoints: {
    current: number;
    maximum: number;
    temporary: number;
  };
  armorClass: number;
  proficiencyBonus: number;
  speed: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  savingThrows: {
    strength: boolean;
    dexterity: boolean;
    constitution: boolean;
    intelligence: boolean;
    wisdom: boolean;
    charisma: boolean;
  };
  skills: {
    [key: string]: boolean;
  };
  equipment: string[];
  equipmentV2?: {
    mainHand?: Item;
    offHand?: Item;
    armor?: Item;
    amulet?: Item;
    ring1?: Item;
    ring2?: Item;
    boots?: Item;
    cloak?: Item;
  },
  spells: string[];
  inventory?: Item[];
  background: string;
  alignment: string;
  gold: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const races = [
  { name: "Humano", bonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 } },
  { name: "Elfo", bonuses: { dexterity: 2 } },
  { name: "Enano", bonuses: { constitution: 2 } },
  { name: "Mediano", bonuses: { dexterity: 2 } },
  { name: "Dracónido", bonuses: { strength: 2, charisma: 1 } },
  { name: "Gnomo", bonuses: { intelligence: 2 } },
  { name: "Semielfo", bonuses: { charisma: 2 } },
  { name: "Semiorco", bonuses: { strength: 2, constitution: 1 } },
  { name: "Tiefling", bonuses: { intelligence: 1, charisma: 2 } }
];

export const classes = [
  { 
    name: "Bárbaro", 
    hitDie: 12, 
    primaryAbility: ["strength"], 
    savingThrows: ["strength", "constitution"],
    skillChoices: ["Supervivencia", "Intimidación", "Percepción", "Trato con Animales"]
  },
  { 
    name: "Bardo", 
    hitDie: 8, 
    primaryAbility: ["charisma"], 
    savingThrows: ["dexterity", "charisma"],
    skillChoices: ["Actuación", "Persuasión", "Engaño", "Historia"]
  },
  { 
    name: "Clérigo", 
    hitDie: 8, 
    primaryAbility: ["wisdom"], 
    savingThrows: ["wisdom", "charisma"],
    skillChoices: ["Historia", "Medicina", "Perspicacia", "Religión"]
  },
  { 
    name: "Druida", 
    hitDie: 8, 
    primaryAbility: ["wisdom"], 
    savingThrows: ["intelligence", "wisdom"],
    skillChoices: ["Medicina", "Naturaleza", "Percepción", "Religión", "Supervivencia", "Trato con Animales"]
  },
  { 
    name: "Guerrero", 
    hitDie: 10, 
    primaryAbility: ["strength", "dexterity"], 
    savingThrows: ["strength", "constitution"],
    skillChoices: ["Acrobacias", "Intimidación", "Historia", "Percepción", "Supervivencia"]
  },
  { 
    name: "Monje", 
    hitDie: 8, 
    primaryAbility: ["dexterity", "wisdom"], 
    savingThrows: ["strength", "dexterity"],
    skillChoices: ["Acrobacias", "Atletismo", "Historia", "Perspicacia", "Religión", "Sigilo"]
  },
  { 
    name: "Paladín", 
    hitDie: 10, 
    primaryAbility: ["strength", "charisma"], 
    savingThrows: ["wisdom", "charisma"],
    skillChoices: ["Atletismo", "Intimidación", "Medicina", "Persuasión", "Religión"]
  },
  { 
    name: "Explorador", 
    hitDie: 10, 
    primaryAbility: ["dexterity", "wisdom"], 
    savingThrows: ["strength", "dexterity"],
    skillChoices: ["Supervivencia", "Trato con Animales", "Perspicacia", "Investigación", "Naturaleza", "Percepción", "Sigilo"]
  },
  { 
    name: "Pícaro", 
    hitDie: 8, 
    primaryAbility: ["dexterity"], 
    savingThrows: ["dexterity", "intelligence"],
    skillChoices: ["Acrobacias", "Atletismo", "Engaño", "Perspicacia", "Intimidación", "Investigación", "Percepción", "Actuación", "Persuasión", "Juego de Manos", "Sigilo"]
  },
  { 
    name: "Hechicero", 
    hitDie: 6, 
    primaryAbility: ["charisma"], 
    savingThrows: ["constitution", "charisma"],
    skillChoices: ["Arcanos", "Engaño", "Intimidación", "Perspicacia", "Persuasión", "Religión"]
  },
  { 
    name: "Brujo", 
    hitDie: 8, 
    primaryAbility: ["charisma"], 
    savingThrows: ["wisdom", "charisma"],
    skillChoices: ["Arcanos", "Engaño", "Historia", "Intimidación", "Investigación", "Naturaleza", "Religión"]
  },
  { 
    name: "Mago", 
    hitDie: 6, 
    primaryAbility: ["intelligence"], 
    savingThrows: ["intelligence", "wisdom"],
    skillChoices: ["Arcanos", "Historia", "Perspicacia", "Investigación", "Medicina", "Religión"]
  }
];

export const skills = [
  "Acrobacias", "Trato con Animales", "Arcanos", "Atletismo", "Engaño", 
  "Historia", "Perspicacia", "Intimidación", "Investigación", "Medicina", 
  "Naturaleza", "Percepción", "Actuación", "Persuasión", "Religión", 
  "Juego de Manos", "Sigilo", "Supervivencia"
];

export const backgrounds = [
  "Acólito", "Criminal", "Artista", "Héroe Popular", "Noble", "Sabio", 
  "Soldado", "Huérfano", "Ermitaño", "Artesano", "Marinero", "Forastero"
];

export const alignments = [
  "Legal Bueno", "Neutral Bueno", "Caótico Bueno",
  "Legal Neutral", "Neutral Verdadero", "Caótico Neutral", 
  "Legal Malvado", "Neutral Malvado", "Caótico Malvado"
];

export const getStatModifier = (stat: number): number => {
  return Math.floor((stat - 10) / 2);
};

export const getProficiencyBonus = (level: number): number => {
  return Math.ceil(level / 4) + 1;
};

export const getExperienceForLevel = (level: number): number => {
  const xpTable = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
  return xpTable[level - 1] || 0;
};