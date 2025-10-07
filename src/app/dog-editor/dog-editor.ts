import { NgForOf } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatLabel } from '@angular/material/form-field';
import { MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { debounce, interval } from 'rxjs';
import { Dog } from 'src/app/dog';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-dog-editor',
  imports: [
    ReactiveFormsModule,
    FormsModule, MatFormFieldModule, MatInputModule,
    NgForOf,
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
    MatFabButton, MatProgressBar,
  ],
  templateUrl: './dog-editor.html',
  styleUrl: './dog-editor.scss'
})
export class DogEditor implements OnInit {
  dogForm!: FormGroup;

  bewegungOptions = ["gut", "läuft/sitzt komisch"];
  gewichtOptions = ["okay", "dünn", "dick"];
  verhaltenOptions = ["wach/klar", "zurückgezogen/kränklich/matt"];
  kommtOptions = ["sofort", "zögerlich", "hält Abstand"];
  anfassbarkeitOptions = [
    "überall",
    "teilweise",
    "zeigt Abwehrverhalten",
  ];
  searchFormControl: FormControl = new FormControl('');
  dogs = signal<Dog[]>([]);
  selectedDog = signal<number>(-1);
  searchText = signal('');
  askedRemoveDog = signal(false);

  shownDogs = computed(() => {
    return this.dogs().filter(dog => {
      if(this.searchText().trim() == '') return true;
      return dog.name.toLowerCase().includes(this.searchText().toLowerCase())
    });
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {

    const soredDogsStr = localStorage.getItem("dogs");
    if(soredDogsStr) {
      try {
        const storedDogs = JSON.parse(soredDogsStr) as Dog[];
        this.dogs.set(storedDogs);
      } catch (e) {
        console.error("can't load dogs:", e);
      }
    }

    this.dogForm = this.fb.group({
      name: [''],
      anmerkungen: [''],
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
      }),
      mitMenschen: this.fb.group({
        freundlich: [false],
        kommt: [null],
        anfassbarkeit: [null],
        laesstSichEinschraenken: [false],
        laesstSichFesthalten: [false],
      }),
      completeness: [0],
    });

    this.dogForm.statusChanges.pipe(debounce(i => interval(500))).subscribe(d => this.saveDog());
  }

  newDog() {

    const newDog = {
      name: '',
      anmerkungen: '',
      gesundheit: {
        freitext: '',
        bewegung: null,
        gewicht: null,
        verhalten: null,
      },
      mitHunden: {
        spielt: false,
        mobbtAndere: false,
        streitet: false,
        verkriechtSich: false,
        verwaltetRessourcen: false,
        wirdBegruesst: false,
      },
      mitMenschen: {
        freundlich: false,
        laesstSichEinschraenken: false,
        laesstSichFesthalten: false,
        kommt: null,
        anfassbarkeit: null,
      },
      completeness: 0,
    }

    this.dogs.update(dogs => [...dogs, newDog]);

    this.selectDog(this.dogs().indexOf(newDog));
  }

  saveDog(): void {
    this.dogs.update((dogs) => {
      const editedDog: Dog = this.dogForm.value;
      editedDog.completeness = this.getDogCompleteness(editedDog);
      dogs[this.selectedDog()] = editedDog
      return [...dogs];
    })
    this.saveToLocalStorage();
  }

  getDogCompleteness(dog: Dog) {
    let completeness = 0;
    if(dog.name) completeness += 10;
    if(dog.mitMenschen.kommt) completeness += 16;
    if(dog.mitMenschen.anfassbarkeit) completeness += 16;
    if(dog.anmerkungen) completeness += 16;
    if(dog.gesundheit.bewegung) completeness += 16;
    if(dog.gesundheit.gewicht) completeness += 16;
    if(dog.gesundheit.verhalten) completeness += 16;
    return completeness;
  }

  selectDog(index: number) {
    this.saveDog();
    this.selectedDog.set(index);
    this.dogForm.setValue(this.dogs()[index]);
  }

  removeDog() {
    const index = this.selectedDog();
    this.dogs.update(dogs => dogs.filter((_, i) => i !== index));
    this.selectedDog.set(-1);
    this.saveToLocalStorage();
    this.askedRemoveDog.set(false);
  }

  saveToLocalStorage() {
    localStorage.setItem('dogs', JSON.stringify(this.dogs()));
  }

  deselectDog() {
    this.selectedDog.set(-1);
  }

  search($event: Event) {
    this.searchText.set(($event.target as HTMLInputElement).value)
  }
}
