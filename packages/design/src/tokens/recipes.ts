import type { ColorToken } from './palette';

export type IllustrationName =
  'concombre' | 'mangue' | 'pomme' | 'poivron' | 'tomate';

export interface Recipe {
  id: string;
  name: string;
  color: ColorToken;
  illustration: IllustrationName;
}

export const RECIPES = [
  {
    id: 'gin-concombre',
    name: 'Gin concombre',
    color: 'green',
    illustration: 'concombre',
  },
  {
    id: 'rhum-mangue',
    name: 'Rhum mangue',
    color: 'yellow',
    illustration: 'mangue',
  },
  {
    id: 'cafe-calva',
    name: 'Café calva',
    color: 'brown',
    illustration: 'pomme',
  },
  {
    id: 'vodka-tomate',
    name: 'Vodka tomate',
    color: 'red',
    illustration: 'tomate',
  },
] as const satisfies readonly Recipe[];
