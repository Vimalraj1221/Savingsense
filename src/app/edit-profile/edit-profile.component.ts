import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  showPassword: boolean = false;
  isDataLoaded: boolean = false;  // Flag to show form after data is loaded

  constructor(
    private dataService: DataService,
    private router: Router,
    private fb: FormBuilder
  ) { }
  private initializeForm(): void {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  ngOnInit(): void {
    this.initializeForm();
    this.getUserDetails();
  }

  // Get user details via GET API
  getUserDetails(): void {
    const loginId = localStorage.getItem('Savingsense_userId');
    if (loginId) {
      const id = Number(loginId);
      this.dataService.getUserById(id).subscribe(
        (data) => {
          this.profileForm.patchValue({
            email: data.email,
            username: data.username
          });
          this.isDataLoaded = true;
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Toggle show/hide password
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Update profile via PUT API
  updateProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    const loginId = localStorage.getItem('Savingsense_userId');
    if (loginId) {
      const id = Number(loginId);
      const updatedUser = this.profileForm.value;
      this.dataService.updateUser(id, updatedUser).subscribe(
        (response) => {
          alert(response.message);
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          console.error(error);
          alert('Failed to update profile');
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
