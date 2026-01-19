import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InsuranceFormComponent } from './insurance-form/insurance-form.component';

@Component({
  selector: 'app-root',
  imports: [InsuranceFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('demo');
}
