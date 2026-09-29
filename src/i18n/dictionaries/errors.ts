/** Kept separate and tiny so the client error boundary doesn't ship the full dictionaries. */
export const errorCopy = {
  en: {
    title: "Something went wrong on our side.",
    body: "Your demo data is safe in this browser. Try again, or reload the page.",
    retry: "Try again",
  },
  fr: {
    title: "Un problème est survenu de notre côté.",
    body: "Vos données de démo sont intactes dans ce navigateur. Réessayez ou rechargez la page.",
    retry: "Réessayer",
  },
}
