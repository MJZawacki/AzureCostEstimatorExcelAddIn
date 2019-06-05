import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-input-row-component',
  templateUrl: './input-row-component.component.html',
  styleUrls: ['./input-row-component.component.css']
})
export class InputRowComponent implements OnInit {

  region: string;
  sku: string;
  
  
  constructor() { }

  ngOnInit() {
  }

}
