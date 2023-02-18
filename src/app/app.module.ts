import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GridViewComponent } from './View/grid-view/grid-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatSliderModule} from '@angular/material/slider';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import { ToolBarComponent } from './View/tool-bar/tool-bar.component';
import {MatButtonModule} from '@angular/material/button';
import { ToolBarMicViewComponent } from './View/tool-bar-mic-view/tool-bar-mic-view.component';
import { EditorComponent } from './View/editor/editor.component';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StackComponent } from './View/stack/stack.component';
import { MicroEditorComponent } from './View/micro-editor/micro-editor.component';
import { MicVisualizationComponent } from './View/mic-visualization/mic-visualization.component';
import { BBusComponent } from './View/SVG/b-bus/b-bus.component';
import { CBusComponent } from './View/SVG/c-bus/c-bus.component';
import { ABusComponent } from './View/SVG/a-bus/a-bus.component';
import { ShifterComponent } from './View/SVG/shifter/shifter.component';
import { RegistersComponent } from './View/SVG/registers/registers.component';


@NgModule({
  declarations: [
    AppComponent,
    GridViewComponent,
    ToolBarComponent,
    ToolBarMicViewComponent,
    EditorComponent,
    StackComponent,
    MicroEditorComponent,
    MicVisualizationComponent,
    BBusComponent,
    CBusComponent,
    ABusComponent,
    ShifterComponent,
    RegistersComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    TextFieldModule,
    MatFormFieldModule,
    FormsModule,
    HttpClientModule,
    MatCheckboxModule,
    MatCardModule,
    MatSliderModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }