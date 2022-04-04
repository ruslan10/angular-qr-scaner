import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { QrscanComponent } from './qrscan/qrscan.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    QrscanComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
