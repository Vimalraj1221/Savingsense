import { Component, OnInit,AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-profile',
  standalone: true,
   imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any = {}; // User data object
constructor(private dataService: DataService,  private router: Router,private renderer: Renderer2) { }
ngOnInit(): void {
  const loginId = localStorage.getItem('Savingsense_userId');

  if (loginId) {
    const id = Number(loginId);   
    if (!isNaN(id)) {
      this.dataService.getUserById(id).subscribe(response => {
        this.user = response;
      });
    } else {
      console.error('Invalid user ID');
    }
  }
 else {
  // If no loginId exists, redirect to the login page
  this.router.navigate(['/login']);
}
}

editProfile() {
  this.router.navigate(['/edit-profile']); // Navigate to Edit Profile Component
}

logout() {
  localStorage.removeItem('Savingsense_userId');
  this.router.navigate(['/login']); // Redirect to login page
}
}
