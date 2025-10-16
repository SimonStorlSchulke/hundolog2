
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounce, firstValueFrom, interval, Subscription } from 'rxjs';
import { Dog, dogsToText } from 'src/app/dog';
import { StrapiService } from 'src/app/strapi.service';

@Component({
  selector: 'app-dog-editor',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckbox,
    MatCardContent,
    MatCardTitle,
    MatCard,
    MatLabel,
    MatFormField,
    MatInput,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatButton,
    MatIconModule,
    MatFabButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatSelect,
    MatOption
  ],
  templateUrl: './dog-editor.html',
  styleUrl: './dog-editor.scss'
})
export class DogEditor implements OnInit {
  dogForm!: FormGroup;

  bewegungOptions = ["gut", "läuft/sitzt komisch"];
  gewichtOptions = ["okay", "dünn", "dick"];
  geschlechtOptions = ["Rüde", "Hündin"];
  verhaltenOptions = ["wach/klar", "zurückgezogen/kränklich/matt"];
  kommtOptions = ["sofort", "zögerlich", "hält Abstand"];
  anfassbarkeitOptions = [
    "gar nicht",
    "überall",
    "teilweise",
    "nur an der Nase/ nur minimal",
    "zeigt Abwehrverhalten",
  ];
  searchFormControl: FormControl = new FormControl('');
  dogs = signal<Dog[]>([]);
  selectedDog = signal<number>(-1);
  searchText = signal('');
  askedRemoveDog = signal(false);
  searchedGender = signal<"Rüde" | "Hündin" | "mf">("mf");

  shownDogs = computed(() => {
    return this.dogs().filter(dog => {
      if(this.searchedGender() != "mf" && dog.geschlecht != this.searchedGender() ) return false;
      if(this.searchText().trim() == '') return true;
      return dog.name.toLowerCase().includes(this.searchText().toLowerCase())
    });
  });

  private reloadSubscription?: Subscription;

  public maxCompleteness = 13;

  constructor(private fb: FormBuilder, readonly strapiService: StrapiService, private matSnackBar: MatSnackBar) {
    this.reloadDogs();

    // watch for tab focus/visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // start interval only when tab is visible
    if (!document.hidden) {
      this.startReloadInterval();
    }
  }

  ngOnInit(): void {
      this.dogForm = this.fb.group({
      name: [''],
      id: [-1],
      foto: [false],
      video: [false],
      anmerkungen: [''],
      schwierigkeit: [NaN],
      groesseCm: [NaN],
      geschlecht: [null],
      belltViel: [false],
      gesundheit: this.fb.group({
        bewegung: [null],
        gewicht: [null],
        verhalten: [null],
        freitext: [''],
      }),
      mitHunden: this.fb.group({
        spielt: [false],
        streitet: [false],
        verwaltetRessourcen: [false],
        mobbtAndere: [false],
        verkriechtSich: [false],
        wirdBegruesst: [false],
        wirdGemobbt: [false],
        jagdTrieb: [false],
        bewegungsfreiheit: [NaN],
      }),
      mitMenschen: this.fb.group({
        freundlich: [false],
        schnappt: [false],
        zeigtSonstigeAggressionen: [false],
        wirdSteif: [false],
        kommt: [null],
        anfassbarkeit: [null],
        laesstSichEinschraenken: [false],
        laesstSichFesthalten: [false],
        skeptisch: [false],
      }),
      completeness: [0],
    });

    this.dogForm.valueChanges.pipe(debounce(i => interval(3000))).subscribe(d => this.saveDog());
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.stopReloadInterval();
    } else {
      this.reloadDogs();
      this.startReloadInterval();
    }
  };

  private startReloadInterval() {
    this.stopReloadInterval();
    this.reloadSubscription = interval(5000).subscribe(() => {
      this.reloadDogs();
    });
  }

  private stopReloadInterval() {
    this.reloadSubscription?.unsubscribe();
    this.reloadSubscription = undefined;
  }

  async reloadDogs() {
    console.log("reloading dogs");
    try {
      const storedDogs = await firstValueFrom(this.strapiService.getDogs());
      this.dogs.set(storedDogs);
    } catch {
      this.showError("Fehler beim Löschen")
    }
  }

  async newDog() {
    await this.saveDog();
    const newDog = new Dog();

    try {
      newDog.id = await firstValueFrom(this.strapiService.createDog(newDog))
    } catch {
      this.showError("Fehler beim Erstellen")
    }

    this.dogs.update(dogs => [...dogs, newDog]);

    await this.selectDog(this.dogs().indexOf(newDog), true);

  }

  async saveDog() {
    this.dogs.update((dogs) => {
      const editedDog: Dog = this.dogForm.value;
      editedDog.completeness = this.getDogCompleteness(editedDog);
      dogs[this.selectedDog()] = editedDog
      return [...dogs];
    })
    if(this.selectedDog() > -1 && this.dogForm.dirty) {
      console.log("saving dog")
      const editedDog = this.dogs()[this.selectedDog()];

      try {
        if(editedDog.id == -1) {
          await firstValueFrom(this.strapiService.createDog(editedDog))
        } else {
          await firstValueFrom(this.strapiService.updateDog(editedDog))
        }
      } catch {
        this.showError("Fehler beim speichern")
      }
    }
  }

  getDogCompleteness(dog: Dog) {
    let completeness = 0;
    if(dog.name) { completeness += 1;}
    if(dog.geschlecht) { completeness += 1;}
    if(this.numExists(dog.groesseCm)) { completeness += 1;}
    if(dog.foto) { completeness += 1;}
    if(dog.video) { completeness += 1;}
    if(dog.mitMenschen.kommt) { completeness += 1;}
    if(dog.mitMenschen.anfassbarkeit) { completeness += 1;}
    if(dog.anmerkungen) { completeness += 1;}
    if(dog.gesundheit.bewegung) { completeness += 1;}
    if(dog.gesundheit.gewicht) { completeness += 1;}
    if(dog.gesundheit.verhalten) { completeness += 1;}
    if(this.numExists(dog.schwierigkeit)) { completeness += 1;}
    if(this.numExists(dog.mitHunden.bewegungsfreiheit)) { completeness += 1;}
    return completeness;
  }

  private numExists(value: number | null) {
    return value != null && !isNaN(value);
  }

  async selectDog(index: number, skipSave = false) {
    if(!skipSave) {
      await this.saveDog();
    }
    this.dogForm.markAsPristine();
    this.selectedDog.set(index);
    this.dogForm.setValue(this.dogs()[index]);
  }

  async deselectDog() {
    await this.saveDog();
    this.selectedDog.set(-1);
  }

  async removeDog() {
    try {
      await firstValueFrom(this.strapiService.deleteDog(this.dogs()[this.selectedDog()].id));
    } catch {
      this.showError("Fehler beim Löschen")
      return;
    }
    const index = this.selectedDog();
    this.dogs.update(dogs => dogs.filter((_, i) => i !== index));
    this.selectedDog.set(-1);
    this.askedRemoveDog.set(false);
  }

  search($event: Event) {
    this.searchText.set(($event.target as HTMLInputElement).value)
  }

  async downloadAsText(): Promise<void> {
    try {
      const text = dogsToText(this.dogs())
      const blob = new Blob([text], { type: "text/plain" });
      const urlObject = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = urlObject;
      link.download = "hundolog.md";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(urlObject);
    } catch (error) {
      console.error("Error downloading JSON as TXT:", error);
    }
  }

  private showError(text: string) {
    this.matSnackBar.open(text, "X", {"duration": 2000});
  }

  async export(): Promise<void> {
    try {
      const jsonString = JSON.stringify(this.dogs(), null, 2); // pretty print JSON
      const blob = new Blob([jsonString], { type: "text/plain" });
      const urlObject = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = urlObject;
      link.download = "hundolog_export.json";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(urlObject);
    } catch (error) {
      console.error("Error downloading JSON:", error);
    }
  }
}
