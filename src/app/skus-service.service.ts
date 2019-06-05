import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { catchError, retry, map } from 'rxjs/operators';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SkusService {

  constructor(private http: HttpClient) { }


  public calculateCosts(regions,skus,types,priorities,osvalues,quantities) : Observable<Sku[]> {
    
    var input = [];
    for (var i in regions) {

        input.push( {
        "location": regions[i][0],
        "name": skus[i][0],
        "hours": 730,
        "type": types[i][0],
        "priority": priorities[i][0],
        "os": osvalues[i][0],
        "quantity": quantities[i][0]
        });
    }

    return this.getCosts(input);
    
    
}
  
  
  public getCosts(input : any ) : Observable<Sku[]> {
    let endpoint : string = `${environment.api_endpoint}/api/costmodel?${environment.api_code}`;
    return this.http.post<any>(endpoint, 
                input,
                {
                  headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                  }
                )}).pipe(
                  map(result => result.costs),
                  catchError(this.handleError)
                );
  };

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };


  public getSkus(region : string ) : Observable<Sku[]> {
    let endpoint : string = `${environment.api_endpoint}/api/cost/${region}?${environment.api_code}`;
        
    return this.http.get<Sku[]>(endpoint,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        }
      )}).pipe(
        catchError(this.handleError)
      ) as Observable<Sku[]>;
  }
}
export interface Sku {
  id: number;
  name: string;
  monthlycost: string;
}
