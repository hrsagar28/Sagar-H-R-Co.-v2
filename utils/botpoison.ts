import Botpoison from '@botpoison/browser';

let botpoison: Botpoison | null = null;

export const getBotpoisonSolution = async () => {
  const publicKey = import.meta.env.VITE_BOTPOISON_PUBLIC_KEY;
  if (!publicKey) return '';

  botpoison ||= new Botpoison({ publicKey });
  const { solution } = await botpoison.challenge();
  return solution;
};
