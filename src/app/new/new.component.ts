import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../data.service'; // Import the service
import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,HttpClientModule,RouterModule],
  templateUrl: './new.component.html',
  styleUrl: './new.component.css'
})
export class NewComponent implements OnInit {
  form!: FormGroup;
  expenseTypes = ['Expense', 'Saving', 'Loan'];
  expenseNames: string[] = [];  // To hold the fetched expense names
  savingNames: string[] = [];   // To hold the fetched saving names
  loanNames: string[] = [];   // To hold the fetched loan names
  filteredExpenseNames: string[] = [];  // To show filtered expense names based on input
  filteredSavingNames: string[] = [];   // To show filtered saving names based on input
  filteredLoanNames: string[] = [];   // To show filtered Loan names based on input
  showExpenseSuggestions = false;  // Control the visibility of expense suggestions
  showSavingSuggestions = false;   // Control the visibility of saving suggestions
  showLoanSuggestions = false;   // Control the visibility of Loan suggestions
  formDataList = [];
  //
  isEditMode = false;
  editId!: number; 

  constructor(private fb: FormBuilder, private router: Router, private dataService: DataService,private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.initializeForm();

    // Check for query parameters to detect edit mode
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.form.get('category')?.setValue(params['category']);
        this.onCategoryChange();
      }
  
      if (params['data']) {
        this.isEditMode = true;
        const detail = JSON.parse(params['data']);
        this.editId = detail.id;
        this.populateForm(detail);
      }
    });
  }
  private populateForm(detail: any): void {
     // Convert the date to 'YYYY-MM-DD' format
  const formattedDate = detail.date ? detail.date.split('T')[0] : '';

    // Fill form controls with the data to edit
    this.form.patchValue({
      category: detail.category,
      expenseName: detail.expenseName || '',
      savingName: detail.savingName || '',
      loanName: detail.loanName || '',
      expenseAmount: detail.expenseAmount || 0,
      savingAmount: detail.savingAmount || 0,
      loanAmount: detail.loanAmount || 0,
      date: formattedDate,
    });

    this.onCategoryChange(); // Adjust form validators based on the category
  }

  private initializeForm(): void {
    const currentDate = new Date().toISOString().split('T')[0];  // Get the current date in 'YYYY-MM-DD' format

    this.form = this.fb.group({
      category: ['Expense', Validators.required],
      expenseName: ['', Validators.required],
      savingName: ['', Validators.required],
      loanName: ['', Validators.required],
      expenseAmount: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      savingAmount: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      loanAmount: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      date: [currentDate, Validators.required]
    });

    this.onCategoryChange();
    this.getExpenseNames();
    this.getSavingNames();
    this.getLoanNames();
  }
  // Fetch expense names from the API
  getExpenseNames(): void {
    // Check if 'Savingsense_userId' exists in localStorage
    const loginId = localStorage.getItem('Savingsense_userId');
    
    if (loginId) {
      // If loginId exists, fetch the data filtered by LoginId
      this.dataService.getFormDataByLoginId(parseInt(loginId, 10)).subscribe(data => {
        // Filter the data by category 'Expense' and map to expense names
        this.expenseNames = data.filter(item => item.category === 'Expense').map(item => item.expenseName);
      }, error => {
        console.error('Error fetching expense names:', error);
      });
    } else {
      // If no loginId exists, redirect to the login page
      this.router.navigate(['/login']);
    }
  }
  
  // Fetch saving names from the API based on LoginId
  getSavingNames(): void {
    // Check if 'Savingsense_userId' exists in localStorage
    const loginId = localStorage.getItem('Savingsense_userId');
    
    if (loginId) {
      // If loginId exists, fetch the data filtered by LoginId
      this.dataService.getFormDataByLoginId(parseInt(loginId, 10)).subscribe(data => {
        // Filter the data by category 'Saving' and map to saving names
        this.savingNames = data.filter(item => item.category === 'Saving').map(item => item.savingName);
      }, error => {
        console.error('Error fetching saving names:', error);
      });
    } else {
      // If no loginId exists, redirect to the login page
      this.router.navigate(['/login']);
    }
  }
  // Fetch Loan names from the API
  getLoanNames(): void {
    // Check if 'Savingsense_userId' exists in localStorage
    const loginId = localStorage.getItem('Savingsense_userId');
    
    if (loginId) {
      // If loginId exists, fetch the data filtered by LoginId
      this.dataService.getFormDataByLoginId(parseInt(loginId, 10)).subscribe(data => {
        // Filter the data by category 'Loan' and map to Loan names
        this.loanNames = data.filter(item => item.category === 'Loan').map(item => item.loanName);
      }, error => {
        console.error('Error fetching loan names:', error);
      });
    } else {
      // If no loginId exists, redirect to the login page
      this.router.navigate(['/login']);
    }
  }
  onCategoryChange(): void {
    const category = this.form.get('category')!.value;  // Add the '!' here
    if (category === 'Expense') {
      this.form.get('expenseName')!.setValidators([Validators.required]);
      this.form.get('expenseAmount')!.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
      this.form.get('savingName')!.clearValidators();
      this.form.get('savingAmount')!.clearValidators();
      this.form.get('loanName')!.clearValidators();
      this.form.get('loanAmount')!.clearValidators();
      // Focus on the Expense Amount input field
    setTimeout(() => {
      const expenseAmountInput = document.getElementById('expenseAmount') as HTMLInputElement;
      if (expenseAmountInput) {
        expenseAmountInput.focus();
      }
    }, 100);
    } else if (category === 'Saving') {
      this.form.get('savingName')!.setValidators([Validators.required]);
      this.form.get('savingAmount')!.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
      this.form.get('expenseName')!.clearValidators();
      this.form.get('expenseAmount')!.clearValidators();
      this.form.get('loanName')!.clearValidators();
      this.form.get('loanAmount')!.clearValidators();
       // Focus on the Saving Amount input field
    setTimeout(() => {
      const savingAmountInput = document.getElementById('savingAmount') as HTMLInputElement;
      if (savingAmountInput) {
        savingAmountInput.focus();
      }
    }, 100);
  } else if (category === 'Loan') {
    this.form.get('loanName')!.setValidators([Validators.required]);
    this.form.get('loanAmount')!.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
    this.form.get('expenseName')!.clearValidators();
    this.form.get('expenseAmount')!.clearValidators();
    this.form.get('savingName')!.clearValidators();
    this.form.get('savingAmount')!.clearValidators();
     // Focus on the Saving Amount input field
  setTimeout(() => {
    const loanAmountInput = document.getElementById('loanAmount') as HTMLInputElement;
    if (loanAmountInput) {
      loanAmountInput.focus();
    }
  }, 100);
    } else {
      this.form.get('expenseName')!.clearValidators();
      this.form.get('savingName')!.clearValidators();
      this.form.get('expenseAmount')!.clearValidators();
      this.form.get('savingAmount')!.clearValidators();
      this.form.get('loanName')!.clearValidators();
      this.form.get('loanAmount')!.clearValidators();
    }
    this.form.get('expenseName')!.updateValueAndValidity();
    this.form.get('savingName')!.updateValueAndValidity();
    this.form.get('expenseAmount')!.updateValueAndValidity();
    this.form.get('savingAmount')!.updateValueAndValidity();
    this.form.get('loanName')!.updateValueAndValidity();
    this.form.get('loanAmount')!.updateValueAndValidity();
  }

  // Handle input for Expense Name field
  onExpenseNameInput(event: any): void {
    const query = event.target.value.toLowerCase();
    const uniqueNames = Array.from(new Set(this.expenseNames)); // Remove duplicates
    this.filteredExpenseNames = uniqueNames.filter(name => name.toLowerCase().includes(query));
    this.showExpenseSuggestions = this.filteredExpenseNames.length > 0; // Show suggestions if any
  }
  
  // Handle input for Saving Name field
  onSavingNameInput(event: any): void {
    const query = event.target.value.toLowerCase();
    const uniqueNames = Array.from(new Set(this.savingNames)); // Remove duplicates
    this.filteredSavingNames = uniqueNames.filter(name => name.toLowerCase().includes(query));
    this.showSavingSuggestions = this.filteredSavingNames.length > 0; // Show suggestions if any
  }
    // Handle input for Loan Name field
    onLoanNameInput(event: any): void {
      const query = event.target.value.toLowerCase();
      const uniqueNames = Array.from(new Set(this.loanNames)); // Remove duplicates
      this.filteredLoanNames = uniqueNames.filter(name => name.toLowerCase().includes(query));
      this.showLoanSuggestions = this.filteredLoanNames.length > 0; // Show suggestions if any
    }
 // Handle selection from the Expense Name suggestion list
 onExpenseNameSelect(name: string): void {
  this.form.get('expenseName')?.setValue(name);
  this.showExpenseSuggestions = false;  // Hide suggestions after selection
}

// Handle selection from the Saving Name suggestion list
onSavingNameSelect(name: string): void {
  this.form.get('savingName')?.setValue(name);
  this.showSavingSuggestions = false;  // Hide suggestions after selection
}
// Handle selection from the Loan Name suggestion list
onLoanNameSelect(name: string): void {
  this.form.get('loanName')?.setValue(name);
  this.showLoanSuggestions = false;  // Hide suggestions after selection
}
  close(): void {
    this.router.navigate(['/dashboard']); 
  }
  
  onSubmit(): void {
    // Check if the form is valid
    if (this.form.valid) {
      // Retrieve the LoginId from localStorage
      const loginId = localStorage.getItem('Savingsense_userId');
  
      if (loginId) {
        // If LoginId exists, construct the form data to include the LoginId
        const formValue = {
          id:this.isEditMode?this.editId:0,
          category: this.form.value.category,
          expenseName: this.form.value.category === 'Expense' ? this.form.value.expenseName : '',
          savingName: this.form.value.category === 'Saving' ? this.form.value.savingName : '',
          loanName: this.form.value.category === 'Loan' ? this.form.value.loanName : '',
          expenseAmount: this.form.value.category === 'Expense' ? this.form.value.expenseAmount : 0,
          savingAmount: this.form.value.category === 'Saving' ? this.form.value.savingAmount : 0,
          loanAmount: this.form.value.category === 'Loan' ? this.form.value.loanAmount : 0,
          date: this.form.value.date,  // Date will automatically be in the format YYYY-MM-DD
          LoginId: parseInt(loginId, 10)  // Include LoginId in the form data
        };
        if (this.isEditMode) {
          // Call the update API
          this.dataService.updateFormData(this.editId, formValue.LoginId, formValue).subscribe(
            (response) => {
              console.log('Data updated successfully', response);
              this.router.navigate(['/dashboard']); // Navigate to dashboard after editing
            },
            (error) => {
              console.error('Error updating data', error);
            }
          );
        } else {
        // Call the saveData method to send data to the backend
        this.dataService.saveFormData(formValue).subscribe(
          (response) => {
            console.log('Data saved successfully', response);
            this.router.navigate(['/dashboard']); // Navigate to the dashboard after saving data
          },
          (error) => {
            console.error('Error saving data', error);
          }
        );
      }
      } else {
        // If no LoginId found, redirect to login page
        this.router.navigate(['/login']);
      }
    } else {
      console.error('Form is invalid');
    }
  }
  
}
