import { Routes } from '@angular/router';
import { DogEditor } from 'src/app/dog-editor/dog-editor';
import { DogList } from 'src/app/dog-list/dog-list';

export const routes: Routes = [
  {path: 'liste', component: DogList},
  {path: 'edit', component: DogEditor},
];
