import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DogEditor } from 'src/app/dog-editor/dog-editor';
import { DogList } from 'src/app/dog-list/dog-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DogList, DogEditor],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('hundolog');
}
