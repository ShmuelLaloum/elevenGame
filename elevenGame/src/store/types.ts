export interface Item {
  id: string;
  name: string;
  type: 'cardBack' | 'reaction';
  image?: string;
  emoji?: string;
  price?: number;
}
