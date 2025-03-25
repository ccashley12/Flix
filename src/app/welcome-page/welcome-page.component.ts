import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // for *ngIf
import { MatButtonModule } from '@angular/material/button';
import { UserRegistrationFormComponent } from '../user-registration-form/user-registration-form.component';
import { UserLoginFormComponent } from '../user-login-form/user-login-form.component';
import { ChangeDetectorRef } from '@angular/core';

/**
 * @summary This component represents the welcome page of the application. It handles user registration, login, and redirects the user based on their authentication and registration status.
 * @example
 * <app-welcome-page></app-welcome-page>
 */

@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    UserLoginFormComponent,
    UserRegistrationFormComponent,
  ],
  templateUrl: './welcome-page.component.html',
})
export class WelcomePageComponent {
  isLoggedIn = false;
  isRegistered = false;
  selectedTabIndex = 0;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {} // For navigation

  ngOnInit() {
    this.checkAuthStatus();
    this.checkRegistrationStatus();

    if (this.isLoggedIn) {
      this.router.navigate(['/movies']);
    } else if (!this.isRegistered) {
      this.selectedTabIndex = 1; // Switch to Signup tab if user is not registered
    }
    this.cdr.detectChanges();
  }

  checkAuthStatus(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.cdr.detectChanges();
  }

  checkRegistrationStatus(): void {
    this.isRegistered = localStorage.getItem('isRegistered') === 'true';
    this.cdr.detectChanges();
  }

  onLoginSuccess(): void {
    this.checkAuthStatus();

    if (this.isLoggedIn) {
      this.router.navigate(['/movies']).then(() => {
        window.location.reload();
      });
    }
  }

  onRegistrationSuccess(): void {
    this.isRegistered = true;
    localStorage.setItem('isRegistered', 'true');
    this.selectedTabIndex = 0; // Switch to Login tab after successful signup
    this.cdr.detectChanges();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isRegistered');
    this.isLoggedIn = false;
    this.isRegistered = false;
    this.checkAuthStatus();
    this.cdr.detectChanges();
    this.router.navigate(['/welcome']);
  }
}