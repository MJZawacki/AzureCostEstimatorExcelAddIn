import { Component, OnInit, Input, Output, EventEmitter, SimpleChange, OnChanges } from '@angular/core';
import { Sku } from '../costs/skus.service';
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

  private _selectedRow: InputRow;

  @Input()
  set selectedRow(row: InputRow) {
    this._selectedRow = row;
    // update skus
    console.log('updating skus');
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
    { id: 2, name: 'sku2'}
 ];

  selectedSku: Sku;


  constructor() {
    this.selectedRow = null;

   }

  ngOnInit() {
  }
 
  onSelect(sku: Sku): void {
    this.selectedSku = sku;
  }
 
  // this.skuService.getSkus(region)
  // .subscribe(skus => this.skus = skus);


  
}


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/