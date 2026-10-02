import { HealthWarning } from '@aphralab/design';

const IMAGE_TEXT =
  "Aphra. Bienvenue, voici le site internet d'Aphra. Marque de boisson de dégustation fabriquée à l'aide d'une technique de clarification artisanale. Notre numéro de téléphone : 06 24 51 14 04. Notre mail est : contact@aphralab.com";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper p-4">
      <img
        src="/aphra-hello.jpg"
        width={1004}
        height={650}
        alt={IMAGE_TEXT}
        className="h-auto w-full max-w-[1004px]"
      />
      <HealthWarning className="text-center" />
    </main>
  );
}
