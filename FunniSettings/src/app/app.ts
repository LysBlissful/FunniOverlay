import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoundaryEditor } from "../boundary-editor/boundary-editor";
declare global {
  interface Window {
  electronAPI: {
  sendMessage:
    (message : string) => void;
  }
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BoundaryEditor],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FunniSettings');
  sendMessage() { window.electronAPI.sendMessage("Hello from Angular!"); }
}
