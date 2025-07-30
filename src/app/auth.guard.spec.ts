// auth-guard.service.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {DataService} from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private dataService: DataService
  ) {}

  canActivate(): boolean {
    if (this.dataService.getUserDetails()) {
      // User details are available, allow access
      return true;
    } else {
      // User details are not available, redirect to login page
      this.router.navigate(['/login']);
      return false;
    }
  }
}
