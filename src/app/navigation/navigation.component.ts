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
  isLoggedIn = false;
  isSidenavOpen = false;
  showNavigation = false;
  private routerSub!: Subscription;

  constructor(
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

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

  ngDoCheck() {
    // Check auth status on change detection
    this.checkAuthStatus();
  };

  ngOnDestroy() {
    // Check for active subsription and clean up
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  };

  // Check if a token exists in localStorage and update isLoggedIn accordingly
  checkAuthStatus(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
  };

  // Toggle the sidenav's open/close state
  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  };

  // Log out the user and clear stored data
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isRegistered');
    this.isLoggedIn = false;
    this.router.navigate(['welcome']);
  };
}
