export type ColorToken =
  'paper' | 'ink' | 'black' | 'green' | 'yellow' | 'brown' | 'red';

export interface PaletteColor {
  token: ColorToken;
  hex: string;
  cmjn: string | null;
  rvb: string;
}

export const PALETTE: readonly PaletteColor[] = [
  { token: 'paper', hex: '#fdfcf2', cmjn: null, rvb: '253 252 242' },
  { token: 'ink', hex: '#374036', cmjn: '68 49 63 61', rvb: '55 64 54' },
  { token: 'black', hex: '#000000', cmjn: '91 79 62 97', rvb: '0 0 0' },
  { token: 'green', hex: '#29896f', cmjn: '80 24 63 7', rvb: '41 137 111' },
  { token: 'yellow', hex: '#f59e14', cmjn: '0 44 94 0', rvb: '246 159 20' },
  { token: 'brown', hex: '#a35b1a', cmjn: '27 65 98 21', rvb: '164 92 26' },
  { token: 'red', hex: '#dd2414', cmjn: '4 95 100 1', rvb: '221 37 20' },
];
