import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; // Import your data service
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-remove',
  standalone: true,
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './remove.component.html',
  styleUrl: './remove.component.css'
})
export class RemoveComponent implements OnInit {
  data: any[] = [];
  originalData: any[] = [];
  selectedItems: any[] = []; // Array to hold selected items
  searchQuery: string = '';

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    // Retrieve the LoginId from localStorage
    const loginId = localStorage.getItem('Savingsense_userId');
    if (!loginId) {
      this.router.navigate(['/login']);
    } else {
      this.fetchData();
    }
  }

  // Fetch data from API based on loginId
  fetchData(): void {
    const loginId = localStorage.getItem('Savingsense_userId');
    if (loginId) {
      this.dataService.getFormDataByLoginId(parseInt(loginId, 10)).subscribe((response) => {
        this.originalData = response; // Store the unfiltered data
        this.data = [...this.originalData]; 
      });
    }
  }

  // Method to delete individual data
  deleteData(id: number): void {
    const loginId = localStorage.getItem('Savingsense_userId');
    if (loginId) {
      this.dataService.deleteFormData(id, parseInt(loginId,10)).subscribe(
        (response) => {
          console.log('Data deleted successfully:', response);
          this.fetchData(); // Refresh the data after deletion
        },
        (error) => {
          console.error('Error deleting data:', error);
        }
      );
    }
  }

// Method to delete selected items
// Method to delete selected items
deleteSelectedData(): void {
  const loginId = localStorage.getItem('Savingsense_userId');
  if (!loginId) {
    console.error('Invalid login ID');
    return;
  }

  if (this.selectedItems.length > 0) {
    const confirmDelete = confirm(
      'Are you sure you want to delete the selected data?'
    );
    if (confirmDelete) {
      const deleteRequests = this.selectedItems.map((item) =>
        this.dataService.deleteFormData(item.id, parseInt(loginId, 10))
      );

      // Use forkJoin to wait for all delete requests to finish
      forkJoin(deleteRequests).subscribe(
        (responses) => {
          console.log('Data deleted successfully:', responses);
          this.fetchData(); // Refresh the data after deletion
        },
        (error) => {
          console.error('Error deleting data:', error);
        }
      );

      this.selectedItems = []; // Clear the selection after deletion
    }
  } else {
    alert('No items selected to delete.');
  }
}




  // Method to search/filter data
searchData(): void {
  const query = this.searchQuery.toLowerCase();
  this.data = this.originalData.filter((item) =>
    item.category.toLowerCase().includes(query) || // Search in Category
    (item.expenseName && item.expenseName.toLowerCase().includes(query)) || // Search in Expense Name
    (item.savingName && item.savingName.toLowerCase().includes(query)) || // Search in Saving Name
    item.date.toLowerCase().includes(query) || // Search in Date
    item.expenseAmount.toString().includes(query) || // Search in Expense Amount
    item.savingAmount.toString().includes(query) // Search in Saving Amount
  );
}
  // Method to toggle item selection
  toggleSelection(item: any): void {
    if (this.selectedItems.includes(item)) {
      this.selectedItems = this.selectedItems.filter((i) => i !== item);
    } else {
      this.selectedItems.push(item);
    }
  }

  // Method to handle delete confirmation
  showDeleteConfirmation(id: number): void {
    if (confirm('Are you sure you want to delete this data?')) {
      this.deleteData(id);
    }
  }
    // Select or deselect all items
    selectAll(event: any): void {
      if (event.target.checked) {
        this.selectedItems = [...this.data]; // Select all items
      } else {
        this.selectedItems = []; // Deselect all items
      }
      this.selectedItems = event.target.checked; // Set the "select all" checkbox state
    }
}