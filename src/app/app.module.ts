import { NgModule, Type } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SkusService } from './costs/skus.service';
import AppComponent from './app.component';
import { SkusComponent, SkuComponent } from './skus/skus.component';
import { InputRow } from './InputRow/InputRow.component'
import { ButtonComponent } from './fabric/button/button.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import {MatButtonModule, MatToolbar, MatToolbarModule, MatIconModule, MatListModule, MatFormFieldModule, MatInputModule} from '@angular/material';

@NgModule({
  declarations: [AppComponent, SkusComponent, ButtonComponent, 
    InputRow, SkuComponent],
  imports: [BrowserModule, HttpClientModule, MatListModule, MatToolbarModule, MatIconModule, MatButtonModule,
    TooltipModule.forRoot(), BrowserAnimationsModule, MatFormFieldModule,MatInputModule ],
  bootstrap: [AppComponent],
  providers: [SkusService ]
})
export default class AppModule { }