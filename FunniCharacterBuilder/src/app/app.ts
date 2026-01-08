import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Alert } from "../components";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Alert],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('FunniCharacterBuilder');
}
