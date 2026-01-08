import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FunniSettings');
  sendMessage() { window.electronAPI.sendMessage("Hello from Angular!"); }
}
