import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Dog, StrapiDogResponse, StrapiDogsResponse, StrapiUpdateDogRequest } from 'src/app/dog';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {

  httpClient = inject(HttpClient);

  static apiBaseUrl = "https://cms.sheltify.de/api/";

  static bearer =
    "b8477deec71978e30ab76a1119ea4cb05032e2eded68fcf8d353c9bec04adcfd1e21e1ec066da683c103a03f011b7853f501923bb481568260b1f7620110c4322a2fba30362aff28ed1d067f236a96d0c49b8488232fb1a96759cbaa61ca095f74a80bc295ace3575e36b096c3086a67d0b0552921231dac9737250b193725cb";

  static readonly headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${StrapiService.bearer}`,
  };

  constructor() {
  }

  getDogs(): Observable<Dog[]> {
    let url = decodeURIComponent(StrapiService.apiBaseUrl + 'hundologs?pagination[pageSize]=800');
    return this.httpClient
      .get<StrapiDogsResponse>(url, {
        headers: StrapiService.headers,
      })
      .pipe(map(
        (r) => r.data.map((d) => {
          const dog = d.attributes.data;
          dog.id = d.id;
          return Object.assign(new Dog(), dog);
        })));
  }

  updateDog(dog: Dog) {
    const request: StrapiUpdateDogRequest = {data: {data: dog}};
    let url = decodeURIComponent(StrapiService.apiBaseUrl + 'hundologs/' + dog.id);
    return this.httpClient
      .put(url, request, {
        headers: StrapiService.headers,
      })
  }

  createDog(dog: Dog) {
    const request: StrapiUpdateDogRequest = {data: {data: dog}};
    let url = decodeURIComponent(StrapiService.apiBaseUrl + 'hundologs');
    return this.httpClient
      .post(url, request, {
        headers: StrapiService.headers,
      })
  }

  deleteDog(id: number) {
    let url = decodeURIComponent(StrapiService.apiBaseUrl + 'hundologs/' + id);
    return this.httpClient
      .delete(url, {
        headers: StrapiService.headers,
      })
  }
}
