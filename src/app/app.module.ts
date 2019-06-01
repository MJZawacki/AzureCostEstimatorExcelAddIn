import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SkusService } from './costs/skus.service';
import AppComponent from './app.component';
import { SkusComponent, SkuComponent } from './skus/skus.component';
import { InputRow } from './InputRow/InputRow.component'
import { ButtonComponent } from './fabric/button/button.component';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material';
@NgModule({
  declarations: [AppComponent, SkusComponent, ButtonComponent, 
    InputRow, SkuComponent],
  imports: [BrowserModule, HttpClientModule],
  bootstrap: [AppComponent],
  providers: [SkusService ]
})
export default class AppModule { }