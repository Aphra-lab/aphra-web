import { readdirSync } from 'node:fs';

import { render, screen, within } from '@testing-library/react';

import { AssetGrid } from '../../src/docs/AssetGrid';
import { ColourTable, RecipeTable } from '../../src/docs/ColourTable';
import { cn } from '../../src/utils/cn';

describe('cn', () => {
  it('joins the truthy class names', () => {
    expect(cn('a', false, undefined, 'b', null)).toBe('a b');
  });
});

describe('ColourTable', () => {
  it('lists the seven brandbook colours with their print values', () => {
    render(<ColourTable />);

    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(8);
    expect(screen.getByText('#374036')).toBeInTheDocument();
    expect(screen.getByText('68 49 63 61')).toBeInTheDocument();
  });
});

describe('RecipeTable', () => {
  it('lists the four recipes with their colour', () => {
    render(<RecipeTable />);

    expect(screen.getByText('Rhum mangue')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
      5,
    );
  });
});

describe('AssetGrid', () => {
  it('offers a download link for every file in assets/', () => {
    render(<AssetGrid />);

    const files = readdirSync('packages/design/assets').filter((file) =>
      /\.(svg|webp)$/.test(file),
    );
    for (const file of files) {
      expect(screen.getByRole('link', { name: file })).toHaveAttribute(
        'download',
        file,
      );
    }
  });
});
