import { Component, OnInit } from '@angular/core';
import { Sku } from '../costs/skus.service';


@Component({
  selector: 'app-skus',
  templateUrl: './skus.component.html',
  styleUrls: ['./skus.component.css']
})
export class SkusComponent implements OnInit {

  skus = [
    { id: 1, name: 'sku1'},
    { id: 2, name: 'sku2'}
 ];

  selectedSku: Sku;


  constructor() { }

  ngOnInit() {
  }

  onSelect(sku: Sku): void {
    this.selectedSku = sku;
  }
}


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/