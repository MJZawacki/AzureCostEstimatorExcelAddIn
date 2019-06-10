import { Component, OnInit, Input, Output, EventEmitter, SimpleChange, OnChanges, ViewChild } from '@angular/core';
import {  Sku, SkusService } from '../skus-service.service';
import { InputRowComponent } from '../input-row-component/input-row-component.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatProgressBar } from '@angular/material';

@Component({
  selector: 'app-skus',
  templateUrl: './skus-component.component.html',
  styleUrls: ['./skus-component.component.css']
})
export class SkusComponent implements OnInit {


  @ViewChild(MatProgressBar, { static: true }) progressBar: MatProgressBar;
  selectedSku: Sku;
  filteredskus = [];
  allskus = [];
  constructor(private skuService: SkusService) {
    this._selectedRow = new InputRowComponent();

   }
  private _selectedRow: InputRowComponent;
  get selectedRow() {
    return this._selectedRow;
  }
  @Input('selectedRow')
  set selectedRow(row: InputRowComponent) {
    if ((row !== null) && (row.region !== this._selectedRow.region)) {
      // update skus
      console.log('updating skus');
      this.allskus = [];
      this.filteredskus = [];
      if ((row !== null) && (row.region != null)) {
        console.log(this.progressBar);
        this.progressUpdate.emit(true);
        this.skuService.getSkus(row.region)
        .pipe(
          catchError(this.handleError)
        )
        .subscribe(skus => {
          this.allskus = skus;
          this.filteredskus = skus;
          this.progressUpdate.emit(false);

          const newListString = this.allskus.map((sku) => sku.name);
          this.validSkus.emit(newListString);
        });
      }
    }
    this._selectedRow = row;

  }

  @Output() updateSku = new EventEmitter<Sku>();
  @Output() progressUpdate = new EventEmitter<boolean>();
  @Output() validSkus = new EventEmitter<string[]>();

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    const log: string[] = [];
    for (const propName in changes) {
      if (propName === 'selectedRow') {
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
    this.filteredskus = this.allskus.filter((x: Sku) => x.name.includes(skuFilter));
  }

  onEnter(skuFilter: string): void {
    if (this.filteredskus.length === 1) {
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
  }
}

@Component({
  selector: 'sku',
  template: `<div class="ms-Grid-col ms-sm1 ms-md1 ms-lg1" style='cursor: pointer;'>{{name}}</div>`
})
export class SkuComponent {
  @Input() id: string;
  @Input() name: string;
}

