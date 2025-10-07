import { Component, signal } from '@angular/core';
import { DogEditor } from 'src/app/dog-editor/dog-editor';

@Component({
  selector: 'app-root',
  imports: [DogEditor],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('hundolog');
}
