import { Component, OnInit } from '@angular/core';
const template = require('./InputRow.component.html');

@Component({
    template,
    selector: 'inputrow'
  })
export class InputRow implements OnInit {

    region: string;
    sku: string;
    
    constructor() { }

    ngOnInit() {
    }
}


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/