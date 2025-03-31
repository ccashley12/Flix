import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  DoCheck,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // for *ngIf
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

/**
 * @summary The NavbarComponent manages the navigation bar's visibility, side navigation state,
 * and user authentication status. It is used for showing the navbar, toggling the side navigation,
 * and logging out the user.
 * @example
 * <app-navbar></app-navbar>
 */
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Improves performance by checking only on input changes
})

export class NavigationComponent implements OnInit, DoCheck, OnDestroy {
  /**
   * @property {boolean} isLoggedIn - Tracks if the user is logged in.
   * @default false
   */
  isLoggedIn = false;
  /**
   * @property {boolean} isSidenavOpen - Tracks the state of the sidenav (open/closed).
   * @default false
   */
  isSidenavOpen = false;
  /**
   * @property {boolean} showNavigation - Tracks the visibility of the navbar.
   * @default false
   */
  showNavigation = false;
  /**
   * @property {Subscription} routerSub - Subscription for router events.
   */
  private routerSub!: Subscription;

  constructor(
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * @summary Initializes the component, checks authentication status, and listens to route changes.
   * @returns {void}
   */
  ngOnInit() {
    // Check authentication when component initializes
    this.checkAuthStatus();
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavigation = !event.url.startsWith('/welcome'); // Show navbar on routes other than /welcome
        this.cdr.detectChanges(); // Detect the component for change detection
      });
  };

  /**
   * @summary Checks authentication status whenever the change detection runs.
   * @returns {void}
   */
  ngDoCheck() {
    // Check auth status on change detection
    this.checkAuthStatus();
  };

  /**
   * @summary Cleans up the router subscription when the component is destroyed.
   * @returns {void}
   */
  ngOnDestroy() {
    // Check for active subsription and clean up
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  };

  /**
   * @summary Checks if a token exists in localStorage and updates the isLoggedIn state accordingly.
   * @returns {void}
   */
  checkAuthStatus(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
  };

  /**
   * @summary Toggles the open/close state of the side navigation.
   * @returns {void}
   */
  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  };

  /**
   * @summary Logs out the user, clears stored data from localStorage, and navigates to the welcome page.
   * @returns {void}
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isRegistered');
    this.isLoggedIn = false;
    this.router.navigate(['welcome']);
  };
}
