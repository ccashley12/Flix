import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { CommonModule } from '@angular/common';

/**
 * @summary Main app component that acts as the entry point for the Angular application.
 * @example
 * @property {string} title The title of the application.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavigationComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  /**
   * @property {string} title The title of the application.
   * @default 'CinemaExpress'
   */
  title = 'CinemaExpress';
}