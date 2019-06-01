import { Component, OnInit, Input, Output, EventEmitter, SimpleChange, OnChanges } from '@angular/core';
import { Sku, SkusService } from '../costs/skus.service';
import { InputRow } from '../InputRow/InputRow.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
const template = require('./skus.component.html');
const style = require('./skus.component.css');
import { catchError, retry, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-skus',
  template,
  
  styles: [`.skulist {
    height:300pt;

    overflow:hidden;
    overflow-y:scroll;
}

.example-form {
  min-width: 150px;
  max-width: 500px;
  width: 100%;
}

.example-full-width {
  width: 100%;
}
`]
})
export class SkusComponent implements OnInit, OnChanges {

  selectedSku: Sku;
  filteredskus = [];
  allskus = [];
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
      this.allskus = [];
      this.filteredskus = [];
      if ((row !== null) && (row.region != null)) {
        this.skuService.getSkus(row.region)
        .pipe(
          catchError(this.handleError)
        )
        .subscribe(skus => {
          this.allskus = skus;
          this.filteredskus = skus;
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
 



  ngOnInit() {
    console.log(`selected sku = ${this.selectedSku}`);
  }
 
  onSelect(sku: Sku): void {
    this.selectedSku = sku;
    this.updateSku.emit(sku);
  }
 
  onKey(skuFilter: string): void {
    console.log(skuFilter);
    // update skus list
    this.filteredskus = this.allskus.filter((x:Sku) => x.name.includes(skuFilter));
  }

  onEnter(skuFilter: string): void {
    if (this.filteredskus.length == 1) {
      this.updateSku.emit(this.filteredskus[0]);
    }
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
    return throwError(
      'Something bad happened; please try again later.');
  };

  
}

@Component({
  selector: 'sku',
  template: `<div class="ms-Grid-col ms-sm1 ms-md1 ms-lg1" style='cursor: pointer;'>{{name}}</div>`,
  styles: [style + '']
})
export class SkuComponent {
  @Input() id: string;
  @Input() name: string;
}


