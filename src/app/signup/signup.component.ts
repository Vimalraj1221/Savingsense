import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../data.service'; // Import your DataService for API calls

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  submitted = false;
  errorMessage = '';
  passwordType = 'password';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: DataService // Inject DataService for API calls
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      verifyPassword: ['', [Validators.required]]
    }, {
      validator: this.matchPasswords('password', 'verifyPassword')
    });
  }
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
  }
  // Custom validator to check if passwords match
  matchPasswords(password: string, verifyPassword: string) {
    return (formGroup: FormGroup) => {
      const passControl = formGroup.controls[password];
      const verifyControl = formGroup.controls[verifyPassword];
      if (verifyControl.errors && !verifyControl.errors['mustMatch']) {
        return;
      }
      if (passControl.value !== verifyControl.value) {
        verifyControl.setErrors({ mustMatch: true });
      } else {
        verifyControl.setErrors(null);
      }
    };
  }

  // Getter for easy access to form controls
  get f() {
    return this.signupForm.controls as {
      email: any;
      username: any;
      password: any;
      verifyPassword: any;
    };
  }

  // Handle form submission
  onSubmit(): void {
    this.submitted = true;

    // If form is invalid, return early
    if (this.signupForm.invalid) {
      return;
    }

    // Extract the form values
    const { email, username, password } = this.signupForm.value;

    // Call the API to perform the signup
    this.dataService.signup(email, username, password).subscribe(
      (response) => {
        // If signup is successful, navigate to the login page
        console.log('Signup successful:', response);
        this.router.navigate(['/login']);
      },
      (error) => {
        // Handle signup error (e.g., username or email already exists)
        this.errorMessage = 'Error: ' + error.error.message; // Display API error message
        console.error('Signup error:', error);
      }
    );
  }

  // Handle return to login
  onReturnToLogin(): void {
    this.router.navigate(['/login']);
  }
}
