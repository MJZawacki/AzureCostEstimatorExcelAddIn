import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SkusComponent, SkuComponent } from './skus-component/skus-component.component';
import { InputRowComponent } from './input-row-component/input-row-component.component';
import { SkusService } from './skus-service.service';
import { HttpClientModule } from '@angular/common/http';
import { MatListModule, MatToolbarModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatProgressBarModule } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { TooltipModule } from 'ngx-bootstrap/tooltip';


@NgModule({
  declarations: [
    AppComponent,
    SkusComponent,
    InputRowComponent,
    SkuComponent
  ],
  imports: [
    BrowserModule, HttpClientModule, MatListModule, MatToolbarModule, MatIconModule, MatButtonModule,
    TooltipModule.forRoot(), BrowserAnimationsModule, MatFormFieldModule,MatInputModule, MatProgressBarModule],
  providers: [SkusService],
  bootstrap: [AppComponent]
})
export class AppModule { }
