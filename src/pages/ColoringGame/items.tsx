// A single colorable region inside an item.
export interface Region {
  id: string;
  shape: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'path';
  props: Record<string, string | number>;
}

// i18n keys used for item names (must exist in the Dict).
export type ItemNameKey =
  | 'coloringHouse'
  | 'coloringFish'
  | 'coloringFlower'
  | 'coloringCar'
  | 'coloringButterfly'
  | 'coloringBalloon';

export interface ColoringItem {
  id: string;
  nameKey: ItemNameKey;
  viewBox: string;
  regions: Region[];
}

export const ITEMS: ColoringItem[] = [
  {
    id: 'house',
    nameKey: 'coloringHouse',
    viewBox: '0 0 200 200',
    regions: [
      // Sky decorations
      { id: 'sun', shape: 'circle', props: { cx: 34, cy: 36, r: 17 } },
      {
        id: 'cloud',
        shape: 'path',
        props: {
          d: 'M118,46 C116,36 126,30 134,33 C138,22 154,22 158,32 C168,29 176,38 171,46 C175,52 167,56 160,54 L128,54 C121,54 117,51 118,46 Z',
        },
      },
      // Tree on the right
      { id: 'treeTrunk', shape: 'rect', props: { x: 162, y: 122, width: 12, height: 52, rx: 3 } },
      { id: 'treeLeaves', shape: 'circle', props: { cx: 168, cy: 106, r: 25 } },
      // Ground
      { id: 'grass', shape: 'rect', props: { x: 0, y: 168, width: 200, height: 32 } },
      // House
      { id: 'chimney', shape: 'rect', props: { x: 132, y: 42, width: 16, height: 34, rx: 2 } },
      { id: 'roof', shape: 'polygon', props: { points: '100,26 24,96 176,96' } },
      { id: 'body', shape: 'rect', props: { x: 46, y: 96, width: 108, height: 74, rx: 4 } },
      { id: 'door', shape: 'rect', props: { x: 85, y: 126, width: 30, height: 44, rx: 4 } },
      { id: 'doorknob', shape: 'circle', props: { cx: 108, cy: 149, r: 3 } },
      { id: 'windowL', shape: 'rect', props: { x: 56, y: 108, width: 24, height: 24, rx: 3 } },
      { id: 'windowR', shape: 'rect', props: { x: 120, y: 108, width: 24, height: 24, rx: 3 } },
    ],
  },
  {
    id: 'fish',
    nameKey: 'coloringFish',
    viewBox: '0 0 200 200',
    regions: [
      // Bubbles
      { id: 'bubble1', shape: 'circle', props: { cx: 40, cy: 48, r: 8 } },
      { id: 'bubble2', shape: 'circle', props: { cx: 58, cy: 30, r: 6 } },
      { id: 'bubble3', shape: 'circle', props: { cx: 30, cy: 74, r: 5 } },
      // Seaweed
      {
        id: 'seaweed',
        shape: 'path',
        props: {
          d: 'M168,180 C160,160 176,150 168,132 C160,114 176,104 170,88 L182,88 C188,104 172,114 180,132 C188,150 172,160 180,180 Z',
        },
      },
      // Fish (facing left)
      {
        id: 'tail',
        shape: 'path',
        props: {
          d: 'M132,100 L182,64 C188,74 188,126 182,136 Z',
        },
      },
      { id: 'body', shape: 'ellipse', props: { cx: 92, cy: 100, rx: 58, ry: 40 } },
      {
        id: 'fin',
        shape: 'path',
        props: {
          d: 'M74,134 C84,150 108,150 116,134 C104,140 86,140 74,134 Z',
        },
      },
      {
        id: 'dorsalFin',
        shape: 'path',
        props: {
          d: 'M70,66 C82,48 108,48 118,66 C104,60 84,60 70,66 Z',
        },
      },
      { id: 'eye', shape: 'circle', props: { cx: 58, cy: 90, r: 10 } },
    ],
  },
  {
    id: 'flower',
    nameKey: 'coloringFlower',
    viewBox: '0 0 200 200',
    regions: [
      // Sun and ground
      { id: 'sun', shape: 'circle', props: { cx: 36, cy: 38, r: 18 } },
      { id: 'grass', shape: 'rect', props: { x: 0, y: 172, width: 200, height: 28 } },
      // Stem and leaves
      { id: 'stem', shape: 'rect', props: { x: 95, y: 100, width: 10, height: 72, rx: 5 } },
      { id: 'leafL', shape: 'ellipse', props: { cx: 72, cy: 142, rx: 22, ry: 11 } },
      { id: 'leafR', shape: 'ellipse', props: { cx: 128, cy: 152, rx: 22, ry: 11 } },
      // Petals (rotated ellipses around the center)
      {
        id: 'petal1',
        shape: 'ellipse',
        props: { cx: 100, cy: 58, rx: 16, ry: 30, transform: 'rotate(0 100 90)' },
      },
      {
        id: 'petal2',
        shape: 'ellipse',
        props: { cx: 100, cy: 58, rx: 16, ry: 30, transform: 'rotate(60 100 90)' },
      },
      {
        id: 'petal3',
        shape: 'ellipse',
        props: { cx: 100, cy: 58, rx: 16, ry: 30, transform: 'rotate(120 100 90)' },
      },
      {
        id: 'petal4',
        shape: 'ellipse',
        props: { cx: 100, cy: 58, rx: 16, ry: 30, transform: 'rotate(180 100 90)' },
      },
      {
        id: 'petal5',
        shape: 'ellipse',
        props: { cx: 100, cy: 58, rx: 16, ry: 30, transform: 'rotate(240 100 90)' },
      },
      {
        id: 'petal6',
        shape: 'ellipse',
        props: { cx: 100, cy: 58, rx: 16, ry: 30, transform: 'rotate(300 100 90)' },
      },
      { id: 'center', shape: 'circle', props: { cx: 100, cy: 90, r: 18 } },
    ],
  },
  {
    id: 'car',
    nameKey: 'coloringCar',
    viewBox: '0 0 200 200',
    regions: [
      // Road
      { id: 'road', shape: 'rect', props: { x: 0, y: 158, width: 200, height: 42 } },
      // Car body (rounded, facing right)
      {
        id: 'body',
        shape: 'path',
        props: {
          d: 'M24,140 C24,120 34,112 52,110 L64,84 C68,76 76,72 88,72 L128,72 C140,72 148,76 152,84 L164,110 C182,112 192,120 192,140 L192,148 C192,152 188,154 184,154 L36,154 C32,154 28,152 28,148 Z',
        },
      },
      {
        id: 'cabin',
        shape: 'path',
        props: {
          d: 'M70,84 C74,78 80,76 88,76 L128,76 C136,76 142,78 146,84 L152,104 L64,104 Z',
        },
      },
      {
        id: 'windowL',
        shape: 'path',
        props: {
          d: 'M78,84 C80,80 84,78 90,78 L98,78 L98,100 L72,100 Z',
        },
      },
      {
        id: 'windowR',
        shape: 'path',
        props: {
          d: 'M106,78 L126,78 C132,78 136,80 138,84 L144,100 L106,100 Z',
        },
      },
      { id: 'headlight', shape: 'circle', props: { cx: 182, cy: 128, r: 7 } },
      { id: 'wheelL', shape: 'circle', props: { cx: 62, cy: 152, r: 20 } },
      { id: 'wheelR', shape: 'circle', props: { cx: 148, cy: 152, r: 20 } },
      { id: 'hubL', shape: 'circle', props: { cx: 62, cy: 152, r: 8 } },
      { id: 'hubR', shape: 'circle', props: { cx: 148, cy: 152, r: 8 } },
    ],
  },
  {
    id: 'butterfly',
    nameKey: 'coloringButterfly',
    viewBox: '0 0 200 200',
    regions: [
      // Antennae
      {
        id: 'antennaL',
        shape: 'path',
        props: {
          d: 'M96,64 C88,48 78,40 66,36 L70,30 C84,36 96,46 102,62 Z',
        },
      },
      {
        id: 'antennaR',
        shape: 'path',
        props: {
          d: 'M104,64 C112,48 122,40 134,36 L130,30 C116,36 104,46 98,62 Z',
        },
      },
      // Upper wings
      {
        id: 'wingTL',
        shape: 'path',
        props: {
          d: 'M96,96 C70,60 34,58 24,84 C16,106 44,124 84,116 C92,112 96,104 96,96 Z',
        },
      },
      {
        id: 'wingTR',
        shape: 'path',
        props: {
          d: 'M104,96 C130,60 166,58 176,84 C184,106 156,124 116,116 C108,112 104,104 104,96 Z',
        },
      },
      // Lower wings
      {
        id: 'wingBL',
        shape: 'path',
        props: {
          d: 'M92,118 C64,124 44,140 52,162 C60,182 92,172 98,140 C98,132 96,124 92,118 Z',
        },
      },
      {
        id: 'wingBR',
        shape: 'path',
        props: {
          d: 'M108,118 C136,124 156,140 148,162 C140,182 108,172 102,140 C102,132 104,124 108,118 Z',
        },
      },
      // Wing spots
      { id: 'spotTL', shape: 'circle', props: { cx: 52, cy: 92, r: 9 } },
      { id: 'spotTR', shape: 'circle', props: { cx: 148, cy: 92, r: 9 } },
      { id: 'spotBL', shape: 'circle', props: { cx: 70, cy: 150, r: 7 } },
      { id: 'spotBR', shape: 'circle', props: { cx: 130, cy: 150, r: 7 } },
      // Body
      { id: 'body', shape: 'ellipse', props: { cx: 100, cy: 108, rx: 11, ry: 44 } },
    ],
  },
  {
    id: 'balloon',
    nameKey: 'coloringBalloon',
    viewBox: '0 0 200 200',
    regions: [
      // Second (smaller) balloon behind
      { id: 'balloon2', shape: 'ellipse', props: { cx: 142, cy: 78, rx: 34, ry: 42 } },
      { id: 'knot2', shape: 'polygon', props: { points: '136,118 148,118 142,132' } },
      // Main balloon
      { id: 'balloon1', shape: 'ellipse', props: { cx: 82, cy: 72, rx: 44, ry: 54 } },
      { id: 'knot1', shape: 'polygon', props: { points: '75,124 89,124 82,140' } },
      // Strings
      {
        id: 'string1',
        shape: 'path',
        props: {
          d: 'M82,140 C78,158 90,168 84,186 L90,186 C96,168 84,158 88,140 Z',
        },
      },
      {
        id: 'string2',
        shape: 'path',
        props: {
          d: 'M142,132 C138,150 150,160 144,180 L150,180 C156,160 144,150 148,132 Z',
        },
      },
    ],
  },
];
