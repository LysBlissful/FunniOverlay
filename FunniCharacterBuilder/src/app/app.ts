import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CharacterEditor } from "../pages/character-editor";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CharacterEditor],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('FunniCharacterBuilder');
}
