import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../data.service'; // Import your DataService for API calls

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  errorMessage = '';
  passwordType = 'password';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: DataService // Inject DataService for API calls
  ) {}

  ngOnInit(): void {
    // Check if the user is already logged in
    const userId = localStorage.getItem('Savingsense_userId');
    if (userId) {
      // If the user is already logged in, redirect them to the dashboard
      this.router.navigate(['/dashboard']);
    }

    // Initialize the login form
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getter for easy access to form fields
  get f() {
    return this.loginForm.controls as {
      username: any;
      password: any;
    };
  }
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
  }
  // Handle form submission
  onSubmit(): void {
    this.submitted = true;

    // If the form is invalid, return
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;

    // Call the API to authenticate the user
    this.dataService.login(username, password).subscribe(
      (response) => {
        // If login is successful, store the userId in localStorage
        const userId = response.userId; // Assuming the API returns userId
        localStorage.setItem('Savingsense_userId', userId.toString());
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        // If login fails, display an error message
        this.errorMessage = 'Invalid username or password';
        console.error('Error during login', error);
      }
    );
  }

  // Handle signup button click
  onSignup() {
    this.router.navigate(['/signup']);
  }
}
