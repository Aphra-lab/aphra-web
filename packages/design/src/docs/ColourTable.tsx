import { contrastRatio } from '../tokens/contrast';
import { PALETTE, type ColorToken } from '../tokens/palette';
import { RECIPES } from '../tokens/recipes';

function hexOf(token: ColorToken) {
  return PALETTE.find((colour) => colour.token === token)?.hex ?? '#000000';
}

function Swatch({ hex }: { hex: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-10 border border-ink"
      style={{ backgroundColor: hex }}
    />
  );
}

export function ColourTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Swatch</th>
          <th>Token</th>
          <th>HEX</th>
          <th>CMJN</th>
          <th>RVB</th>
          <th>On paper</th>
          <th>On black</th>
        </tr>
      </thead>
      <tbody>
        {PALETTE.map((colour) => (
          <tr key={colour.token}>
            <td>
              <Swatch hex={colour.hex} />
            </td>
            <td>
              <code>{colour.token}</code>
            </td>
            <td>{colour.hex}</td>
            <td>{colour.cmjn ?? '—'}</td>
            <td>{colour.rvb}</td>
            <td>{contrastRatio(colour.hex, hexOf('paper')).toFixed(1)}</td>
            <td>{contrastRatio(colour.hex, hexOf('black')).toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RecipeTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Recipe</th>
          <th>Colour</th>
          <th>Illustration</th>
        </tr>
      </thead>
      <tbody>
        {RECIPES.map((recipe) => (
          <tr key={recipe.id}>
            <td>{recipe.name}</td>
            <td>
              <Swatch hex={hexOf(recipe.color)} /> <code>{recipe.color}</code>
            </td>
            <td>
              <code>{recipe.illustration}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
