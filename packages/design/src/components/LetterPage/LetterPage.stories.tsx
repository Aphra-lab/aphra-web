import type { Meta, StoryObj } from '@storybook/react-vite';

import { CircledLink } from '../CircledLink/CircledLink';
import { Header } from '../Header/Header';
import { Signature } from '../Signature/Signature';
import { LetterPage } from './LetterPage';

const meta = {
  title: 'Layout/LetterPage',
  component: LetterPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LetterPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wireframe: Story = {
  args: {
    header: (
      <Header
        menuOpen={false}
        onMenuToggle={() => undefined}
        bottlesSold={450}
      />
    ),
    signOff: (
      <>
        <p>Sobrement,</p>
        <Signature team className="ml-[45%] mt-6" />
      </>
    ),
    address: (
      <>
        Aphra SAS,
        <br />
        23-31 impasse Prudhon,
        <br />
        94200 Ivry sur Seine
      </>
    ),
    children: (
      <>
        <p>
          Bienvenue,
          <br />
          Vous êtes sur le site internet d'Aphra.
          <br />
          Marque de boisson de dégustation fabriquée à l'aide d'une{' '}
          <CircledLink href="#" shape={1}>
            technique
          </CircledLink>{' '}
          de clarification artisanale.
        </p>
        <p>
          Ici, vous pouvez découvrir nos différentes{' '}
          <CircledLink href="#" shape={2}>
            recettes
          </CircledLink>{' '}
          signatures.
        </p>
        <p>
          Nous travaillons main dans la main avec différents{' '}
          <CircledLink href="#" shape={3}>
            partenaires
          </CircledLink>{' '}
          à Paris et worldwide.
        </p>
        <p>
          Pour plus amples informations, n'hésitez pas à nous{' '}
          <CircledLink href="#" shape={1}>
            contacter
          </CircledLink>{' '}
          pour que l'on se contacte.
        </p>
      </>
    ),
  },
};
