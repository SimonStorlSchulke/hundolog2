export type StrapiDogResponse = {
  data: {
    id: number,
    attributes: {
      data: Dog
    }
  },
}
export type StrapiDogsResponse = {
  data: {
    id: number,
    attributes: {
      data: Dog
    }
  }[]
}

export type StrapiUpdateDogRequest = {
  data: {
    data: Dog
  },
}

export class Dog {
  name: string = "";
  id: number = -1;
  anmerkungen: string = "";
  schwierigkeit: number = NaN;
  groesseCm: number = NaN;
  geschlecht: "Rüde" | "Hündin" | null = null;
  foto: boolean = false;
  video: boolean = false;

  gesundheit: {
    bewegung: "gut" | "läuft/sitzt komisch" | null,
    gewicht: "okay" | "dünn" | "dick" | null,
    verhalten: "wach/klar" | "zurückgezogen/kränklich/matt" | null,
    freitext: string,
  } = {
    bewegung: null,
    gewicht: null,
    verhalten: null,
    freitext: "",
  }

  mitHunden: {
    spielt: boolean,
    streitet: boolean,
    verwaltetRessourcen: boolean,
    mobbtAndere: boolean,
    verkriechtSich: boolean,
    wirdBegruesst: boolean,
    bewegungsfreiheit: number,
  } = {
    spielt: false,
    streitet: false,
    verwaltetRessourcen: false,
    mobbtAndere: false,
    verkriechtSich: false,
    wirdBegruesst: false,
    bewegungsfreiheit: NaN,
  };

  mitMenschen: {
    freundlich: boolean,
    schnappt: boolean,
    zeigtSonstigeAggressionen: boolean,
    wirdSteif: boolean,
    kommt: "sofort" | "zögerlich" | "hält Abstand" | null,
    anfassbarkeit: "überall" | "teilweise" | "zeigt Abwehrverhalten" | null,
    laesstSichEinschraenken: boolean,
    laesstSichFesthalten: boolean,
  } = {
    freundlich: false,
    schnappt: false,
    zeigtSonstigeAggressionen: false,
    wirdSteif: false,
    kommt: null,
    anfassbarkeit: null,
    laesstSichEinschraenken: false,
    laesstSichFesthalten: false,
  };
  completeness = 0;
}

export function dogsToText(dogs: Dog[]) {

  let texts: string[] = [];
  const br = '  ';

  for (const dog of dogs) {
    const dogText = `
## ${dog.name || 'unbenannter Hund'}

**Gesundheit:**
Bewegung: ${dog.gesundheit.bewegung || '-'}${br}
Gewicht: ${dog.gesundheit.gewicht || '-'}${br}
Verhalten: ${dog.gesundheit.verhalten || '-'}${br}
${br}
**Mit Hunden:**${br}
- [${dog.mitHunden.spielt ? 'x' : ' '}] spielt${br}
- [${dog.mitHunden.streitet ? 'x' : ' '}] streitet sich oft${br}
- [${dog.mitHunden.verwaltetRessourcen ? 'x' : ' '}] verwaltet Ressourcen${br}
- [${dog.mitHunden.mobbtAndere ? 'x' : ' '}] mobbt andere${br}
- [${dog.mitHunden.verkriechtSich ? 'x' : ' '}] verkriecht sich${br}
- [${dog.mitHunden.wirdBegruesst ? 'x' : ' '}] wird begrüßt${br}
${br}
**Mit Menschen**${br}
- [${dog.mitMenschen.freundlich ? 'x' : ' '}] freundlich${br}
kommt: ${dog.mitMenschen.kommt || '-'}${br}
Anfassbarkeit: ${dog.mitMenschen.anfassbarkeit || '-'}${br}
- [${dog.mitMenschen.laesstSichEinschraenken ? 'x' : ' '}] lässt sich einschränken${br}
- [${dog.mitMenschen.laesstSichFesthalten ? 'x' : ' '}] lässt sich festhalten${br}
${br}
**Anmerkungen**${br}
${dog.anmerkungen || 'keine'}${br}
    `;

    texts.push(dogText);
  }

  return texts.join('\n\n');
}
