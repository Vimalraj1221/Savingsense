import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filterState: { 
    filterType: 'daily' | 'monthly' | 'yearly'; 
    selectedDate: string; 
    selectedMonth: string; 
    selectedYear: { from: string; to: string }; 
  } = {
    filterType: 'daily',
    selectedDate: '',
    selectedMonth: '',
    selectedYear: { from: '', to: '' },
  };

  constructor() {}

  // Set the filter state values
  setFilterState(state: { 
    filterType: 'daily' | 'monthly' | 'yearly'; 
    selectedDate: string; 
    selectedMonth: string; 
    selectedYear: { from: string; to: string }; 
  }): void {
    this.filterState = state;
    localStorage.setItem('filterState', JSON.stringify(state)); // Optionally persist to localStorage
  }

  // Get the filter state values
  getFilterState(): { 
    filterType: 'daily' | 'monthly' | 'yearly'; 
    selectedDate: string; 
    selectedMonth: string; 
    selectedYear: { from: string; to: string }; 
  } {
    const savedState = localStorage.getItem('filterState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Use ternary operators to check for each field, else set default values
      this.filterState = {
        filterType: parsedState.filterType || 'daily',
        selectedDate: parsedState.selectedDate || this.getCurrentDate(),
        selectedMonth: parsedState.selectedMonth || this.getCurrentMonth(),
        selectedYear: { 
          from: parsedState.selectedYear.from || this.getStartOfYear(), 
          to: parsedState.selectedYear.to || this.getCurrentDate() 
        },
      };
    }
    return this.filterState;
  }

  // Clear the filter state from memory and storage
  clearFilterState(): void {
    this.filterState = {
      filterType: 'daily',
      selectedDate: '',
      selectedMonth: '',
      selectedYear: { from: '', to: '' },
    };
    localStorage.removeItem('filterState');
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentMonth(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  getStartOfYear(): string {
    const currentYear = new Date().getFullYear(); // Get the current year
    const startOfYear = new Date(`${currentYear}-01-01`); // Construct 1st January
    return startOfYear.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

}
