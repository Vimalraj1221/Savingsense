import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const userId = localStorage.getItem('Savingsense_userId');
    
    // If no userId in localStorage, redirect to login
    if (!userId) {
      this.router.navigate(['/login']);
      return false;
    }

    // If userId exists, allow access to the route
    return true;
  }
}
