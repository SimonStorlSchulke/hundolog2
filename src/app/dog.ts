export type Dog = {
  name: string,
  anmerkungen: string,

  gesundheit: {
    bewegung: "gut" | "läuft/sitzt komisch" | null,
    gewicht: "okay" | "dünn" | "dick" | null,
    verhalten: "wach/klar" | "zurückgezogen/kränklich/matt" | null,
    freitext: string,
  },

  mitHunden: {
    spielt: boolean,
    streitet: boolean,
    verwaltetRessourcen: boolean,
    mobbtAndere: boolean,
    verkriechtSich: boolean,
    wirdBegruesst: boolean,
  },

  mitMenschen: {
    freundlich: boolean,
    kommt: "sofort" | "zögerlich" | "hält Abstand" | null,
    anfassbarkeit: "überall" | "teilweise" | "zeigt Abwehrverhalten" | null,
    laesstSichEinschraenken: boolean,
    laesstSichFesthalten: boolean,
  },
  completeness: number,
}
