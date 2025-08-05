export interface Creature {
  id: string;
  name: string;
  type: string;
  size: string;
  armorClass: number;
  hitPoints: number;
  speed: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  skills?: string[];
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  senses: string;
  languages: string;
  challengeRating: string;
  proficiencyBonus: number;
  actions: Action[];
  description: string;
}

export interface Action {
  name: string;
  description: string;
  damage?: string;
  attackBonus?: number;
  range?: string;
}

export const bestiary: Creature[] = [
  {
    id: "goblin",
    name: "Goblin",
    type: "Humanoide (goblinoide)",
    size: "Pequeño",
    armorClass: 15,
    hitPoints: 7,
    speed: "30 pies",
    strength: 8,
    dexterity: 14,
    constitution: 10,
    intelligence: 10,
    wisdom: 8,
    charisma: 8,
    skills: ["Sigilo +6"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 9",
    languages: "Común, Goblin",
    challengeRating: "1/4",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Cimitarra",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 2",
        attackBonus: 4,
        range: "5 pies"
      },
      {
        name: "Arco corto",
        description: "Ataque de arma a distancia",
        damage: "1d6 + 2",
        attackBonus: 4,
        range: "80/320 pies"
      }
    ],
    description: "Pequeña criatura maligna que vive en cuevas y túneles."
  },
  {
    id: "orc",
    name: "Orco",
    type: "Humanoide (orco)",
    size: "Mediano",
    armorClass: 13,
    hitPoints: 15,
    speed: "30 pies",
    strength: 16,
    dexterity: 12,
    constitution: 16,
    intelligence: 7,
    wisdom: 11,
    charisma: 10,
    skills: ["Intimidación +2"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 10",
    languages: "Común, Orco",
    challengeRating: "1/2",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Hacha de guerra",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d8 + 3",
        attackBonus: 5,
        range: "5 pies"
      },
      {
        name: "Jabalina",
        description: "Ataque de arma cuerpo a cuerpo o a distancia",
        damage: "1d6 + 3",
        attackBonus: 5,
        range: "5 pies o alcance 30/120 pies"
      }
    ],
    description: "Guerrero feroz y brutal que vive para la batalla."
  },
  {
    id: "skeleton",
    name: "Esqueleto",
    type: "No-muerto",
    size: "Mediano",
    armorClass: 13,
    hitPoints: 13,
    speed: "30 pies",
    strength: 10,
    dexterity: 14,
    constitution: 15,
    intelligence: 6,
    wisdom: 8,
    charisma: 5,
    damageImmunities: ["Veneno"],
    conditionImmunities: ["Envenenado", "Exhausto"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 9",
    languages: "Entiende todos los idiomas que conocía en vida pero no puede hablar",
    challengeRating: "1/4",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Espada corta",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 2",
        attackBonus: 4,
        range: "5 pies"
      },
      {
        name: "Arco corto",
        description: "Ataque de arma a distancia",
        damage: "1d6 + 2",
        attackBonus: 4,
        range: "80/320 pies"
      }
    ],
    description: "Resto animado de un humanoide muerto, desprovisto de carne."
  },
  {
    id: "zombie",
    name: "Zombi",
    type: "No-muerto",
    size: "Mediano",
    armorClass: 8,
    hitPoints: 22,
    speed: "20 pies",
    strength: 13,
    dexterity: 6,
    constitution: 16,
    intelligence: 3,
    wisdom: 6,
    charisma: 5,
    damageImmunities: ["Veneno"],
    conditionImmunities: ["Envenenado"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 8",
    languages: "Entiende los idiomas que conocía en vida pero no puede hablar",
    challengeRating: "1/4",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Golpe",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 1",
        attackBonus: 3,
        range: "5 pies"
      }
    ],
    description: "Cadáver reanimado que camina sin propósito, hambriento de carne."
  },
  {
    id: "wolf",
    name: "Lobo",
    type: "Bestia",
    size: "Mediano",
    armorClass: 13,
    hitPoints: 11,
    speed: "40 pies",
    strength: 12,
    dexterity: 15,
    constitution: 12,
    intelligence: 3,
    wisdom: 12,
    charisma: 6,
    skills: ["Percepción +3", "Sigilo +4"],
    senses: "Percepción pasiva 13",
    languages: "—",
    challengeRating: "1/4",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Mordisco",
        description: "Ataque de arma cuerpo a cuerpo. Si el objetivo es una criatura, debe superar una tirada de salvación de Fuerza CD 11 o caer derribada.",
        damage: "2d4 + 2",
        attackBonus: 4,
        range: "5 pies"
      }
    ],
    description: "Depredador pack que caza en manadas coordinadas."
  },
  {
    id: "spider",
    name: "Araña Gigante",
    type: "Bestia",
    size: "Grande",
    armorClass: 14,
    hitPoints: 26,
    speed: "30 pies, trepar 30 pies",
    strength: 14,
    dexterity: 16,
    constitution: 12,
    intelligence: 2,
    wisdom: 11,
    charisma: 4,
    skills: ["Sigilo +7"],
    senses: "Ceguera +10 pies, Visión en la oscuridad 60 pies, Percepción pasiva 10",
    languages: "—",
    challengeRating: "1",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Mordisco",
        description: "Ataque de arma cuerpo a cuerpo. El objetivo debe realizar una tirada de salvación de Constitución CD 11, recibiendo 2d8 de daño por veneno en caso de fallo, o la mitad en caso de éxito.",
        damage: "1d8 + 3",
        attackBonus: 5,
        range: "5 pies"
      },
      {
        name: "Red",
        description: "Ataque de arma a distancia. Una criatura Grande o más pequeña queda restringida hasta escapar.",
        attackBonus: 5,
        range: "30/60 pies"
      }
    ],
    description: "Aracnido gigante que teje telarañas mortales."
  },
  {
    id: "troll",
    name: "Trol",
    type: "Gigante",
    size: "Grande",
    armorClass: 15,
    hitPoints: 84,
    speed: "30 pies",
    strength: 18,
    dexterity: 13,
    constitution: 20,
    intelligence: 7,
    wisdom: 9,
    charisma: 7,
    skills: ["Percepción +2"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 12",
    languages: "Gigante",
    challengeRating: "5",
    proficiencyBonus: 3,
    actions: [
      {
        name: "Ataque múltiple",
        description: "El trol realiza tres ataques: uno con su mordisco y dos con sus garras."
      },
      {
        name: "Mordisco",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 4",
        attackBonus: 7,
        range: "5 pies"
      },
      {
        name: "Garra",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "2d6 + 4",
        attackBonus: 7,
        range: "5 pies"
      }
    ],
    description: "Criatura regenerativa con un apetito voraz y temperamento violento."
  },
  {
    id: "ogre",
    name: "Ogro",
    type: "Gigante",
    size: "Grande",
    armorClass: 11,
    hitPoints: 59,
    speed: "40 pies",
    strength: 19,
    dexterity: 8,
    constitution: 16,
    intelligence: 5,
    wisdom: 7,
    charisma: 7,
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 8",
    languages: "Común, Gigante",
    challengeRating: "2",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Garrote gigante",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "2d8 + 4",
        attackBonus: 6,
        range: "5 pies"
      },
      {
        name: "Jabalina",
        description: "Ataque de arma cuerpo a cuerpo o a distancia",
        damage: "2d6 + 4",
        attackBonus: 6,
        range: "5 pies o alcance 30/120 pies"
      }
    ],
    description: "Gigante primitivo y hambriento que vive en cuevas y pantanos."
  },
  {
    id: "bandit",
    name: "Bandido",
    type: "Humanoide (cualquier raza)",
    size: "Mediano",
    armorClass: 12,
    hitPoints: 11,
    speed: "30 pies",
    strength: 11,
    dexterity: 12,
    constitution: 12,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    senses: "Percepción pasiva 10",
    languages: "Cualquier idioma (usualmente común)",
    challengeRating: "1/8",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Cimitarra",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 1",
        attackBonus: 3,
        range: "5 pies"
      },
      {
        name: "Ballesta ligera",
        description: "Ataque de arma a distancia",
        damage: "1d8 + 1",
        attackBonus: 3,
        range: "80/320 pies"
      }
    ],
    description: "Forajido desesperado que asalta a viajeros en caminos solitarios."
  },
  {
    id: "kobold",
    name: "Kobold",
    type: "Humanoide (kobold)",
    size: "Pequeño",
    armorClass: 12,
    hitPoints: 5,
    speed: "30 pies",
    strength: 7,
    dexterity: 15,
    constitution: 9,
    intelligence: 8,
    wisdom: 7,
    charisma: 8,
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 8",
    languages: "Común, Dracónico",
    challengeRating: "1/8",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Daga",
        description: "Ataque de arma cuerpo a cuerpo o a distancia",
        damage: "1d4 + 2",
        attackBonus: 4,
        range: "5 pies o alcance 20/60 pies"
      },
      {
        name: "Honda",
        description: "Ataque de arma a distancia",
        damage: "1d4 + 2",
        attackBonus: 4,
        range: "30/120 pies"
      }
    ],
    description: "Pequeño humanoide reptiliano cobarde pero astuto."
  },
  {
    id: "hobgoblin",
    name: "Hobgoblin",
    type: "Humanoide (goblinoide)",
    size: "Mediano",
    armorClass: 18,
    hitPoints: 11,
    speed: "30 pies",
    strength: 13,
    dexterity: 12,
    constitution: 12,
    intelligence: 10,
    wisdom: 10,
    charisma: 9,
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 10",
    languages: "Común, Goblin",
    challengeRating: "1/2",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Espada larga",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d8 + 1",
        attackBonus: 3,
        range: "5 pies"
      },
      {
        name: "Arco largo",
        description: "Ataque de arma a distancia",
        damage: "1d8 + 1",
        attackBonus: 3,
        range: "150/600 pies"
      }
    ],
    description: "Goblinoide disciplinado y militar con estructura jerárquica."
  },
  {
    id: "gnoll",
    name: "Gnoll",
    type: "Humanoide (gnoll)",
    size: "Mediano",
    armorClass: 15,
    hitPoints: 22,
    speed: "30 pies",
    strength: 14,
    dexterity: 12,
    constitution: 11,
    intelligence: 6,
    wisdom: 10,
    charisma: 7,
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 10",
    languages: "Gnoll",
    challengeRating: "1/2",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Mordisco",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d4 + 2",
        attackBonus: 4,
        range: "5 pies"
      },
      {
        name: "Lanza",
        description: "Ataque de arma cuerpo a cuerpo o a distancia",
        damage: "1d6 + 2",
        attackBonus: 4,
        range: "5 pies o alcance 20/60 pies"
      },
      {
        name: "Arco largo",
        description: "Ataque de arma a distancia",
        damage: "1d8 + 1",
        attackBonus: 3,
        range: "150/600 pies"
      }
    ],
    description: "Híbrido humano-hiena salvaje y caníbal que caza en manadas."
  },
  {
    id: "bugbear",
    name: "Osgo",
    type: "Humanoide (goblinoide)",
    size: "Mediano",
    armorClass: 16,
    hitPoints: 27,
    speed: "30 pies",
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 8,
    wisdom: 11,
    charisma: 9,
    skills: ["Sigilo +6", "Supervivencia +2"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 10",
    languages: "Común, Goblin",
    challengeRating: "1",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Maza de armas",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "2d8 + 2",
        attackBonus: 4,
        range: "5 pies"
      },
      {
        name: "Jabalina",
        description: "Ataque de arma cuerpo a cuerpo o a distancia",
        damage: "1d6 + 2",
        attackBonus: 4,
        range: "5 pies o alcance 30/120 pies"
      }
    ],
    description: "Goblinoide grande y peludo que prefiere las emboscadas."
  },
  {
    id: "lizardfolk",
    name: "Hombre Lagarto",
    type: "Humanoide (hombre lagarto)",
    size: "Mediano",
    armorClass: 15,
    hitPoints: 22,
    speed: "30 pies, nadar 30 pies",
    strength: 15,
    dexterity: 10,
    constitution: 13,
    intelligence: 7,
    wisdom: 12,
    charisma: 7,
    skills: ["Percepción +3", "Sigilo +4", "Supervivencia +5"],
    senses: "Percepción pasiva 13",
    languages: "Dracónico",
    challengeRating: "1/2",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Ataque múltiple",
        description: "Realiza dos ataques cuerpo a cuerpo, solo uno puede ser con su mordisco."
      },
      {
        name: "Mordisco",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 2",
        attackBonus: 4,
        range: "5 pies"
      },
      {
        name: "Maza pesada",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 2",
        attackBonus: 4,
        range: "5 pies"
      },
      {
        name: "Jabalina",
        description: "Ataque de arma cuerpo a cuerpo o a distancia",
        damage: "1d6 + 2",
        attackBonus: 4,
        range: "5 pies o alcance 30/120 pies"
      },
      {
        name: "Escudo con picos",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 2",
        attackBonus: 4,
        range: "5 pies"
      }
    ],
    description: "Humanoide reptiliano tribal que vive en pantanos y humedales."
  },
  {
    id: "wight",
    name: "Tumulario",
    type: "No-muerto",
    size: "Mediano",
    armorClass: 14,
    hitPoints: 45,
    speed: "30 pies",
    strength: 15,
    dexterity: 14,
    constitution: 16,
    intelligence: 10,
    wisdom: 13,
    charisma: 15,
    skills: ["Percepción +3", "Sigilo +4"],
    damageResistances: ["Necrótico", "Contundente, cortante y perforante de ataques no mágicos"],
    damageImmunities: ["Veneno"],
    conditionImmunities: ["Exhausto", "Envenenado"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 13",
    languages: "Los idiomas que conocía en vida",
    challengeRating: "3",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Ataque múltiple",
        description: "Realiza dos ataques con espada larga. Puede usar su Drenar vida en lugar de uno de los ataques."
      },
      {
        name: "Drenar vida",
        description: "Ataque de arma cuerpo a cuerpo. El objetivo debe superar una tirada de salvación de Constitución CD 13 o su máximo de puntos de golpe se reduce por el daño necrótico recibido.",
        damage: "1d6 + 3 necrótico",
        attackBonus: 4,
        range: "5 pies"
      },
      {
        name: "Espada larga",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d8 + 2",
        attackBonus: 4,
        range: "5 pies"
      },
      {
        name: "Arco largo",
        description: "Ataque de arma a distancia",
        damage: "1d8 + 2",
        attackBonus: 4,
        range: "150/600 pies"
      }
    ],
    description: "Guerrero no-muerto que drena la vida de sus víctimas."
  },
  {
    id: "ghoul",
    name: "Necrófago",
    type: "No-muerto",
    size: "Mediano",
    armorClass: 12,
    hitPoints: 22,
    speed: "30 pies",
    strength: 13,
    dexterity: 15,
    constitution: 10,
    intelligence: 7,
    wisdom: 10,
    charisma: 6,
    damageImmunities: ["Veneno"],
    conditionImmunities: ["Hechizado", "Exhausto", "Envenenado"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 10",
    languages: "Común",
    challengeRating: "1",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Mordisco",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "2d6 + 2",
        attackBonus: 4,
        range: "5 pies"
      },
      {
        name: "Garras",
        description: "Ataque de arma cuerpo a cuerpo. Si el objetivo es una criatura que no sea elfo o no-muerto, debe superar una tirada de salvación de Constitución CD 10 o quedar paralizada durante 1 minuto.",
        damage: "2d4 + 2",
        attackBonus: 4,
        range: "5 pies"
      }
    ],
    description: "No-muerto hambriento que se alimenta de carne de humanoide."
  },
  {
    id: "wraith",
    name: "Espectro",
    type: "No-muerto",
    size: "Mediano",
    armorClass: 13,
    hitPoints: 67,
    speed: "0 pies, volar 60 pies (flotar)",
    strength: 6,
    dexterity: 16,
    constitution: 16,
    intelligence: 12,
    wisdom: 14,
    charisma: 15,
    damageResistances: ["Ácido", "Frío", "Fuego", "Rayo", "Trueno", "Contundente, cortante y perforante de ataques no mágicos"],
    damageImmunities: ["Necrótico", "Veneno"],
    conditionImmunities: ["Hechizado", "Exhausto", "Agarrado", "Paralizado", "Petrificado", "Derribado", "Restringido", "Envenenado"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 12",
    languages: "Los idiomas que conocía en vida",
    challengeRating: "5",
    proficiencyBonus: 3,
    actions: [
      {
        name: "Drenar vida",
        description: "Ataque de arma cuerpo a cuerpo. El objetivo debe realizar una tirada de salvación de Constitución CD 14. En caso de fallo, su máximo de puntos de golpe se reduce por el daño necrótico recibido.",
        damage: "4d8 + 3 necrótico",
        attackBonus: 6,
        range: "5 pies"
      }
    ],
    description: "Espíritu incorpóreo lleno de malicia que drena la esencia vital."
  },
  {
    id: "owlbear",
    name: "Oso Búho",
    type: "Monstruosidad",
    size: "Grande",
    armorClass: 13,
    hitPoints: 59,
    speed: "40 pies",
    strength: 20,
    dexterity: 12,
    constitution: 17,
    intelligence: 3,
    wisdom: 12,
    charisma: 7,
    skills: ["Percepción +3"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 13",
    languages: "—",
    challengeRating: "3",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Ataque múltiple",
        description: "Realiza dos ataques: uno con su pico y uno con sus garras."
      },
      {
        name: "Pico",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d10 + 5",
        attackBonus: 7,
        range: "5 pies"
      },
      {
        name: "Garras",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "2d8 + 5",
        attackBonus: 7,
        range: "5 pies"
      }
    ],
    description: "Híbrido feroz entre oso y búho con instintos territoriales."
  },
  {
    id: "displacer_beast",
    name: "Bestia Desplazadora",
    type: "Monstruosidad",
    size: "Grande",
    armorClass: 13,
    hitPoints: 85,
    speed: "40 pies",
    strength: 18,
    dexterity: 15,
    constitution: 16,
    intelligence: 4,
    wisdom: 13,
    charisma: 8,
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 11",
    languages: "—",
    challengeRating: "3",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Ataque múltiple",
        description: "Realiza dos ataques con tentáculos."
      },
      {
        name: "Tentáculo",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "2d6 + 4",
        attackBonus: 6,
        range: "10 pies"
      }
    ],
    description: "Felino con tentáculos que proyecta imágenes ilusorias de sí mismo."
  },
  {
    id: "rust_monster",
    name: "Monstruo del Óxido",
    type: "Monstruosidad",
    size: "Mediano",
    armorClass: 14,
    hitPoints: 27,
    speed: "40 pies",
    strength: 13,
    dexterity: 12,
    constitution: 13,
    intelligence: 2,
    wisdom: 13,
    charisma: 6,
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 11",
    languages: "—",
    challengeRating: "1/2",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Mordisco",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d8 + 1",
        attackBonus: 3,
        range: "5 pies"
      },
      {
        name: "Antena",
        description: "El monstruo corroe un objeto metálico no mágico que lleve o vista el objetivo."
      }
    ],
    description: "Criatura que se alimenta de metal, especialmente hierro y acero."
  },
  {
    id: "mimic",
    name: "Mímico",
    type: "Monstruosidad",
    size: "Mediano",
    armorClass: 12,
    hitPoints: 58,
    speed: "15 pies",
    strength: 17,
    dexterity: 12,
    constitution: 15,
    intelligence: 5,
    wisdom: 13,
    charisma: 8,
    skills: ["Sigilo +5"],
    damageImmunities: ["Ácido"],
    conditionImmunities: ["Derribado"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 11",
    languages: "—",
    challengeRating: "2",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Seudópodo",
        description: "Ataque de arma cuerpo a cuerpo. Si el mímico está en forma de objeto, el objetivo queda agarrado.",
        damage: "1d8 + 3",
        attackBonus: 5,
        range: "5 pies"
      },
      {
        name: "Mordisco",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d8 + 3",
        attackBonus: 5,
        range: "5 pies"
      }
    ],
    description: "Criatura cambiante que imita objetos para emboscar a sus presas."
  },
  {
    id: "gelatinous_cube",
    name: "Cubo Gelatinoso",
    type: "Cieno",
    size: "Grande",
    armorClass: 6,
    hitPoints: 84,
    speed: "15 pies",
    strength: 14,
    dexterity: 3,
    constitution: 20,
    intelligence: 1,
    wisdom: 6,
    charisma: 1,
    conditionImmunities: ["Cegado", "Hechizado", "Sordo", "Exhausto", "Asustado", "Derribado"],
    senses: "Ceguera +60 pies (ciego más allá de este radio), Percepción pasiva 8",
    languages: "—",
    challengeRating: "2",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Seudópodo",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "3d6 ácido",
        attackBonus: 4,
        range: "5 pies"
      },
      {
        name: "Engullir",
        description: "El cubo se mueve hasta su velocidad. Mientras lo hace, puede entrar en el espacio de criaturas Medianas o más pequeñas."
      }
    ],
    description: "Masa gelatinosa transparente que devora todo a su paso."
  },
  {
    id: "dryad",
    name: "Dríade",
    type: "Feérico",
    size: "Mediano",
    armorClass: 11,
    hitPoints: 22,
    speed: "30 pies",
    strength: 10,
    dexterity: 12,
    constitution: 11,
    intelligence: 14,
    wisdom: 15,
    charisma: 18,
    skills: ["Percepción +4", "Sigilo +5"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 14",
    languages: "Élfico, Silvano",
    challengeRating: "1",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Puño",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1 contundente",
        attackBonus: 2,
        range: "5 pies"
      },
      {
        name: "Enmarañar",
        description: "Las plantas en un área de 20 pies de radio se enmarañan. Las criaturas en el área deben superar una tirada de salvación de Fuerza CD 13 o quedar restringidas."
      }
    ],
    description: "Ninfa del bosque vinculada mágicamente a un árbol específico."
  },
  {
    id: "satyr",
    name: "Sátiro",
    type: "Feérico",
    size: "Mediano",
    armorClass: 14,
    hitPoints: 31,
    speed: "40 pies",
    strength: 12,
    dexterity: 16,
    constitution: 11,
    intelligence: 12,
    wisdom: 10,
    charisma: 14,
    skills: ["Percepción +2", "Actuación +6", "Sigilo +5"],
    senses: "Percepción pasiva 12",
    languages: "Común, Élfico, Silvano",
    challengeRating: "1/2",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Espada corta",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 3",
        attackBonus: 5,
        range: "5 pies"
      },
      {
        name: "Arco corto",
        description: "Ataque de arma a distancia",
        damage: "1d6 + 3",
        attackBonus: 5,
        range: "80/320 pies"
      }
    ],
    description: "Feérico alegre mitad cabra que ama la música y las festividades."
  },
  {
    id: "basilisk",
    name: "Basilisco",
    type: "Monstruosidad",
    size: "Mediano",
    armorClass: 15,
    hitPoints: 52,
    speed: "20 pies",
    strength: 16,
    dexterity: 8,
    constitution: 15,
    intelligence: 2,
    wisdom: 8,
    charisma: 7,
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 9",
    languages: "—",
    challengeRating: "3",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Mordisco",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "2d6 + 3 + 1d8 veneno",
        attackBonus: 5,
        range: "5 pies"
      },
      {
        name: "Mirada petrificante",
        description: "Si una criatura inicia su turno a 30 pies o menos del basilisco y ambos pueden verse, el objetivo debe realizar una tirada de salvación de Constitución CD 12. En caso de fallo, comienza a convertirse en piedra."
      }
    ],
    description: "Reptil de ocho patas cuya mirada puede convertir en piedra."
  },
  {
    id: "manticore",
    name: "Mantícora",
    type: "Monstruosidad",
    size: "Grande",
    armorClass: 14,
    hitPoints: 68,
    speed: "30 pies, volar 50 pies",
    strength: 17,
    dexterity: 16,
    constitution: 17,
    intelligence: 7,
    wisdom: 12,
    charisma: 8,
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 11",
    languages: "Común",
    challengeRating: "3",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Ataque múltiple",
        description: "Realiza tres ataques: uno con su mordisco y dos con sus garras, o tres con espinas de cola."
      },
      {
        name: "Mordisco",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d8 + 3",
        attackBonus: 5,
        range: "5 pies"
      },
      {
        name: "Garra",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 3",
        attackBonus: 5,
        range: "5 pies"
      },
      {
        name: "Espina de cola",
        description: "Ataque de arma a distancia",
        damage: "1d8 + 3",
        attackBonus: 5,
        range: "100/200 pies"
      }
    ],
    description: "Criatura con cuerpo de león, cara humana, alas de murciélago y cola con espinas venenosas."
  },
  {
    id: "harpy",
    name: "Arpía",
    type: "Monstruosidad",
    size: "Mediano",
    armorClass: 11,
    hitPoints: 38,
    speed: "20 pies, volar 40 pies",
    strength: 12,
    dexterity: 13,
    constitution: 12,
    intelligence: 7,
    wisdom: 10,
    charisma: 13,
    senses: "Percepción pasiva 10",
    languages: "Común",
    challengeRating: "1",
    proficiencyBonus: 2,
    actions: [
      {
        name: "Ataque múltiple",
        description: "Realiza dos ataques: uno con sus garras y uno con su garrote."
      },
      {
        name: "Garras",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "2d4 + 1",
        attackBonus: 3,
        range: "5 pies"
      },
      {
        name: "Garrote",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d4 + 1",
        attackBonus: 3,
        range: "5 pies"
      },
      {
        name: "Canción seductora",
        description: "Toda criatura humanoide a 300 pies que pueda oír la canción debe superar una tirada de salvación de Sabiduría CD 11 o quedar hechizada hasta que la canción termine."
      }
    ],
    description: "Criatura con torso de mujer y alas y garras de ave rapaz que seduce con su canto."
  },
  {
    id: "medusa",
    name: "Medusa",
    type: "Monstruosidad",
    size: "Mediano",
    armorClass: 15,
    hitPoints: 127,
    speed: "30 pies",
    strength: 10,
    dexterity: 15,
    constitution: 16,
    intelligence: 12,
    wisdom: 13,
    charisma: 15,
    skills: ["Engaño +5", "Intuición +5", "Percepción +5", "Sigilo +5"],
    senses: "Visión en la oscuridad 60 pies, Percepción pasiva 15",
    languages: "Común",
    challengeRating: "6",
    proficiencyBonus: 3,
    actions: [
      {
        name: "Ataque múltiple",
        description: "Puede usar su Mirada petrificante o realizar dos ataques cuerpo a cuerpo."
      },
      {
        name: "Cimitarra de serpiente",
        description: "Ataque de arma cuerpo a cuerpo",
        damage: "1d6 + 2 + 1d4 veneno",
        attackBonus: 5,
        range: "5 pies"
      },
      {
        name: "Arco largo",
        description: "Ataque de arma a distancia",
        damage: "1d8 + 2 + 1d4 veneno",
        attackBonus: 5,
        range: "150/600 pies"
      },
      {
        name: "Mirada petrificante",
        description: "Una criatura a 30 pies que pueda ver a la medusa debe realizar una tirada de salvación de Constitución CD 14. En caso de fallo, comienza a convertirse en piedra."
      }
    ],
    description: "Mujer maldita con serpientes por cabello cuya mirada petrifica."
  }
];