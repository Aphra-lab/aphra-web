const IMAGE_TEXT =
  "Aphra. Bienvenue, voici le site internet d'Aphra. Marque de boisson de dégustation fabriquée à l'aide d'une technique de clarification artisanale. Notre numéro de téléphone : 06 24 51 14 04. Notre mail est : contact@aphralab.com";
const HEALTH_WARNING =
  "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#fcfcf2] p-4">
      <img
        src="/aphra-hello.jpg"
        width={1004}
        height={650}
        alt={IMAGE_TEXT}
        className="h-auto w-full max-w-[1004px]"
      />
      <p className="text-center font-mono text-sm text-neutral-800">
        {HEALTH_WARNING}
      </p>
    </main>
  );
}
