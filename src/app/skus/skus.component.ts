import { Component, OnInit, Input, Output, EventEmitter, SimpleChange, OnChanges } from '@angular/core';
import { Sku, SkusService } from '../costs/skus.service';
import { InputRow } from '../InputRow/InputRow.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
const template = require('./skus.component.html');
const style = require('./skus.component.css');
import { catchError, retry, map } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

@Component({
  selector: 'app-skus',
  template,
  styles: [style + '']
})
export class SkusComponent implements OnInit, OnChanges {

  selectedSku: Sku;

  constructor(private skuService: SkusService) {
    this._selectedRow = new InputRow();

   }
  private _selectedRow: InputRow;
  get selectedRow() {
    return this._selectedRow;
  }
  @Input('selectedRow')
  set selectedRow(row: InputRow) {
    if ((row !== null) && (row.region != this._selectedRow.region)) {
      // update skus
      console.log('updating skus');
      this.skus = [];
      if ((row !== null) && (row.region != null)) {
        this.skuService.getSkus(row.region)
        .pipe(
          catchError(this.handleError)
        )
        .subscribe(skus => {
          this.skus = skus;
        });
      }
    }
    this._selectedRow = row;

  } 

  @Output() updateSku = new EventEmitter<Sku>();

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    let log: string[] = [];
    for (let propName in changes) {
      if (propName == 'selectedRow') {
        console.log(`${propName} changed`);
       
      }
    }
  }
  skus = [
    { id: 1, name: 'sku1'},
    { id: 2, name: 'sku2'},
    { id: 3, name: 'sku3'}
 ];



  ngOnInit() {
    console.log(`selected sku = ${this.selectedSku}`);
  }
 
  onSelect(sku: Sku): void {
    this.selectedSku = sku;
    this.updateSku.emit(sku);
  }
 

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

  
}


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/