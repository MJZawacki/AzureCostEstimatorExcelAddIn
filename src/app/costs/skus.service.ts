import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry, map } from 'rxjs/operators';


@Injectable()
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
    let endpoint : string = 'https://mzratecardfunc.azurewebsites.net/api/costmodel?code=FGhUffy0jIaVwck4uQ4kdHSTav4RUr3yMUtNIT/fOzyeff/MpeS/Kw=='
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
    return new ErrorObservable(
      'Something bad happened; please try again later.');
  };


  public getSkus(region : string ) : Observable<Sku[]> {
    let endpoint = 'https://mzratecardfunc.azurewebsites.net/api/cost/' + region + '?code=94PmLQSkKSRctaaIUzaCIL4VB7h7pvraC23NmlukSwJkVze6H8E3qA=='
        
    return this.http.get<Sku[]>(endpoint,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        }
      )}).pipe(
        catchError(this.handleError)
      );
  }
}
export interface Sku {
  id: number;
  name: string;
  monthlycost: string;
}