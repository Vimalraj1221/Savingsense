import { Component, OnInit,AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../filter.service';
import { FilterByNamePipe } from '../filter-by-name.pipe';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule,FilterByNamePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private touchStartX = 0;
  private swipeThreshold = 50;

  isMobileNavActive = false;  // To track mobile nav state
  data: any[] = [];
  filteredData: any[] = [];
  filteredExpenses: { name: string; amount: number; isExpanded: boolean, details: any[] }[] = [];
  filteredSavings: { name: string; amount: number; isExpanded: boolean, details: any[] }[] = [];
  filteredLoan: { name: string; amount: number; isExpanded: boolean, details: any[] }[] = [];
  totalExpense: number = 0;
  totalSaving: number = 0;
  totalLoan: number = 0;
  totalAmount: number = 0;

  filterType: 'daily' | 'monthly' | 'yearly' = 'daily';

  selectedDate: string = '';
  selectedMonth: string = '';
  selectedYear: { from: string; to: string } = { from: '', to: '' };
  showExpense = true;  // Initially show Expense
  showSaving = true;   // Initially show Saving
  showLoan = true;   // Initially show Saving
  expenseSearchTerm: string = '';
  savingSearchTerm: string = '';
  loanSearchTerm: string = '';
  constructor(private dataService: DataService, private filterService: FilterService, private router: Router,private renderer: Renderer2) { }

  ngOnInit(): void {
    // Fetch filter state when component loads
    const savedState = this.filterService.getFilterState();
    if (savedState) {
      this.filterType = savedState.filterType;
      this.selectedDate = savedState.selectedDate;
      this.selectedMonth = savedState.selectedMonth;
      this.selectedYear = savedState.selectedYear;
    }
    else {
      this.selectedDate = this.getCurrentDate();
      this.selectedMonth = this.getCurrentMonth();
      this.selectedYear = {
        from: this.getStartOfYear(),
        to: this.getCurrentDate(),
      };
    }
    this.fetchData();
  }

  fetchData(): void {
    // Check if 'Savingsense_userId' exists in localStorage
    const loginId = localStorage.getItem('Savingsense_userId');

    if (loginId) {
      // If loginId exists, fetch the data
      this.dataService.getFormDataByLoginId(parseInt(loginId, 10)).subscribe(
        (data) => {
          this.data = data;
          this.applyFilters();
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    } else {
      // If no loginId exists, redirect to the login page
      this.router.navigate(['/login']);
    }
  }

  setFilterType(type: 'daily' | 'monthly' | 'yearly'): void {
    this.filterType = type;
   if (type==='daily'){ this.selectedDate = this.getCurrentDate();}
   else if(type==='monthly'){this.selectedMonth = this.getCurrentMonth();}
   else if(type==='yearly'){ this.selectedYear = {
    from: this.getStartOfYear(),
    to: this.getCurrentDate(),
  };}
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.filterType === 'daily') {
      this.filterByDate(new Date(this.selectedDate));
    } else if (this.filterType === 'monthly') {
      this.filterByMonth(new Date(this.selectedMonth + '-01'));
    } else if (this.filterType === 'yearly') {
      const fromDate = new Date(this.selectedYear.from);
      const toDate = new Date(this.selectedYear.to);
      this.filterByYearRange(fromDate, toDate);
    }
     // Save the filter state after applying the filters
     this.filterService.setFilterState({
      filterType: this.filterType,
      selectedDate: this.selectedDate,
      selectedMonth: this.selectedMonth,
      selectedYear: this.selectedYear,
    });
    //
    this.animateValue('expense-amount', this.totalExpense, 2000); // 4 seconds
    this.animateValue('saving-amount', this.totalSaving, 2000);  // 4 seconds
    this.animateValue('loan-amount', this.totalLoan, 2000);   // 4 seconds
  }

  filterByDate(filterDate: Date): void {
    this.filteredData = this.data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate.toDateString() === filterDate.toDateString();
    });
    this.calculateTotals();
  }

  filterByMonth(filterDate: Date): void {
    this.filteredData = this.data.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getFullYear() === filterDate.getFullYear() &&
        itemDate.getMonth() === filterDate.getMonth()
      );
    });
    this.calculateTotals();
  }

  filterByYearRange(fromDate: Date, toDate: Date): void {
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    // Set time to 00:00:00.000 for accurate date comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    this.filteredData = this.data.filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0); // Normalize item date to midnight
      return itemDate >= startDate && itemDate <= endDate;
    });

    this.calculateTotals();
  }

  calculateTotals(): void {
    const groupedExpenses = this.filteredData
      .filter((item) => item.category === 'Expense')
      .reduce((acc, item) => {
        const key = item.expenseName || 'Unknown';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {} as { [key: string]: any[] });

    const groupedSavings = this.filteredData
      .filter((item) => item.category === 'Saving')
      .reduce((acc, item) => {
        const key = item.savingName || 'Unknown';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {} as { [key: string]: any[] });

      const groupedLoan = this.filteredData
      .filter((item) => item.category === 'Loan')
      .reduce((acc, item) => {
        const key = item.loanName || 'Unknown';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {} as { [key: string]: any[] });

      // Helper function to sort by latest date
  const sortByLatestDate = (a: any, b: any) => {
    const dateA = new Date(a.details[0].date).getTime();
    const dateB = new Date(b.details[0].date).getTime();
    return dateB - dateA; // Latest date first
  };

  // Map and sort by latest date
  this.filteredExpenses = Object.keys(groupedExpenses)
    .map((key) => ({
      name: key,
      amount: groupedExpenses[key].reduce((sum: number, item: any) => sum + item.expenseAmount, 0),
      isExpanded: false,
      details: groupedExpenses[key],
    }))
    .sort(sortByLatestDate);

  this.filteredSavings = Object.keys(groupedSavings)
    .map((key) => ({
      name: key,
      amount: groupedSavings[key].reduce((sum: number, item: any) => sum + item.savingAmount, 0),
      isExpanded: false,
      details: groupedSavings[key],
    }))
    .sort(sortByLatestDate);

    this.filteredLoan = Object.keys(groupedLoan)
    .map((key) => ({
      name: key,
      amount: groupedLoan[key].reduce((sum: number, item: any) => sum + item.loanAmount, 0),
      isExpanded: false,
      details: groupedLoan[key],
    }))
    .sort(sortByLatestDate);

    // this.filteredExpenses = Object.keys(groupedExpenses).map((key) => ({
    //   name: key,
    //   amount: groupedExpenses[key].reduce((sum: number, item: any) => sum + item.expenseAmount, 0),
    //   isExpanded: false,
    //   details: groupedExpenses[key], // Include the list of detailed data
    // }));

    // this.filteredSavings = Object.keys(groupedSavings).map((key) => ({
    //   name: key,
    //   amount: groupedSavings[key].reduce((sum: number, item: any) => sum + item.savingAmount, 0),
    //   isExpanded: false,
    //   details: groupedSavings[key], // Include the list of detailed data
    // }));

    this.totalExpense = this.filteredExpenses.reduce((sum: number, item: any) => sum + item.amount, 0);
    this.totalSaving = this.filteredSavings.reduce((sum: number, item: any) => sum + item.amount, 0);
    this.totalLoan = this.filteredLoan.reduce((sum: number, item: any) => sum + item.amount, 0);
    this.totalAmount = this.totalExpense + this.totalSaving;
  }


  toggleDetails(type: 'expense' | 'saving' | 'loan', index: number): void {
    if (type === 'expense') {
      this.filteredExpenses[index].isExpanded = !this.filteredExpenses[index].isExpanded;
    } else if (type === 'saving') {
      this.filteredSavings[index].isExpanded = !this.filteredSavings[index].isExpanded;
  } else if (type === 'loan') {
    this.filteredLoan[index].isExpanded = !this.filteredLoan[index].isExpanded;
  }
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


  //toggle side
  toggleMobileNav() {
    // Toggle the class on the body or navmenu based on the state
    this.isMobileNavActive = !this.isMobileNavActive;

    const body = document.querySelector('.header');
    const navmenu = document.querySelector('.navmenu');
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle') as HTMLElement;

    if (body && navmenu && mobileNavToggleBtn) {
      body.classList.toggle('mobile-nav-active', this.isMobileNavActive);
      mobileNavToggleBtn.classList.toggle('bi-list', !this.isMobileNavActive);
      mobileNavToggleBtn.classList.toggle('bi-x', this.isMobileNavActive);
    }
  }
  // Logout method
  logout(): void {
    // Remove the user ID from local storage
    localStorage.removeItem('Savingsense_userId');

    // Redirect to the login page
    this.router.navigate(['/login']);
  }


  //--------------------------------------------------------
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent, detail: any): void {
    const touchCurrentX = event.touches[0].clientX;
    const diffX = this.touchStartX - touchCurrentX;

    if (diffX > this.swipeThreshold) {
      // Swipe left detected
      detail.isSwiped = true;
    } else if (diffX < -this.swipeThreshold) {
      // Swipe right detected
      detail.isSwiped = false;
    }
  }

  onTouchEnd(detail: any): void {
    // Add or remove the "swiped-left" class based on the `isSwiped` flag
    detail.isSwiped = detail.isSwiped || false;
  }
  //------------------------------------------------------------
  editDetail(detail: any): void {
    this.router.navigate(['/edit', detail.id], { queryParams: { data: JSON.stringify(detail) } });
  }

  deleteDetail(detail: any): void {
    if (confirm('Are you sure you want to delete this data?')) {
      this.deleteData(detail.id);
    }
  }
  // Method to delete individual data
  deleteData(id: number): void {
    const loginId = localStorage.getItem('Savingsense_userId');
    if (loginId) {
      this.dataService.deleteFormData(id, parseInt(loginId, 10)).subscribe(
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

  //------------------
 
  
  animateValue(id: string, end: number, duration: number): void {
    const element = document.getElementById(id);
    if (!element) return;
  
    // Determine the starting value dynamically
    const start = Math.max(1, end - (Math.abs(end - 10) <= 10 ? 10 : Math.min(10, end)));
  
    // If start and end are the same, set value instantly and skip animation
    if (start === end) {
      element.innerText = end.toLocaleString(); // Format numbers with commas
      return;
    }
  
    const startTime = performance.now(); // Animation start time
    const range = end - start; // Total change in value
  
    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Normalize progress (0 to 1)
  
      const current = Math.floor(start + progress * range); // Calculate the current value
      element.innerText = current.toLocaleString(); // Format numbers with commas
  
      if (progress < 1) {
        requestAnimationFrame(animate); // Continue animation
      }
    };
  
    requestAnimationFrame(animate);
  }
  
  navigateToNew(category: string): void {
    this.router.navigate(['/new'], { queryParams: { category } });
  }
  toggleExpenseVisibility(): void {
    this.showExpense = !this.showExpense;
  }

  toggleSavingVisibility(): void {
    this.showSaving = !this.showSaving;
  }
  toggleLoanVisibility(): void {
    this.showLoan = !this.showLoan;
  }
}
