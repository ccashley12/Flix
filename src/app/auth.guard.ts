import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const User = localStorage.getItem('user');
    if (User) {
      return true;
    } else {
      this.router.navigate(['/welcome']);
      return false;
    }
  }
}