import { Component, OnInit,AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../filter.service';
import { FilterByNamePipe } from '../filter-by-name.pipe';
@Component({
  selector: 'app-loan',
  standalone: true,
  imports:  [RouterModule, CommonModule, FormsModule,FilterByNamePipe],
  templateUrl: './loan.component.html',
  styleUrl: './loan.component.css'
})
export class LoanComponent  implements OnInit {
  data: any[] = [];
  Loan: any[] = [];
  groupedLoan: any = {};
  filteredData: any[] = [];
  LoanSearchTerm: string = '';
  totalLoan: number = 0;
  isMobileNavActive = false;  // To track mobile nav state
  filteredLoan: { name: string; amount: number; isExpanded: boolean, details: any[] }[] = [];
  filterType: 'daily' | 'monthly' | 'yearly' = 'daily';
  constructor(private dataService: DataService, private filterService: FilterService, private router: Router,private renderer: Renderer2) { }
  ngOnInit(): void {
   
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
          this.Loan = this.data.filter((item) => item.category === 'Loan');
          this.groupData();
          this.animateValue('loan-amount', this.totalLoan, 2000);  // 4 seconds
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
  setFilterType(type: string): void {
    this.filterType = type as 'daily' | 'monthly' | 'yearly';
    this.groupData();
    this.animateValue('loan-amount', this.totalLoan, 2000);  // 4 seconds
  }
  getLoanKeys(): string[] {
    return Object.keys(this.groupedLoan);
  }
  groupData(): void {
    this.groupedLoan = this.Loan.reduce((acc, Loan) => {
      let dateKey = '';
      const date = new Date(Loan.date);

      if (this.filterType === 'daily') {
       // dateKey = date.toLocaleDateString();
       const day = String(date.getDate()).padStart(2, '0');
       const month = String(date.getMonth() + 1).padStart(2, '0');
       const year = date.getFullYear();
       dateKey = `${day}/${month}/${year}`;
      } else if (this.filterType === 'monthly') {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (this.filterType === 'yearly') {
        dateKey = `${date.getFullYear()}`;
      }

      if (!acc[dateKey]) {
        acc[dateKey] = { total: 0, items: [] };
      }

      acc[dateKey].total += Loan.loanAmount;
      acc[dateKey].items.push(Loan);
      return acc;
    }, {});
// 🔹 **Sort keys in descending order (latest first)**
this.groupedLoan = Object.fromEntries(
 // Object.entries(this.groupedLoan).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
 Object.entries(this.groupedLoan).sort(([a], [b]) => {
  const dateA = new Date(a.split('/').reverse().join('-'));
  const dateB = new Date(b.split('/').reverse().join('-'));
  return dateB.getTime() - dateA.getTime();
})
);
this.totalLoan = Object.values(this.groupedLoan).reduce((sum: number, item: any) => sum + item.total, 0);
    //console.log(this.groupedSavings);
  }
  formatDateKey(key: string, filterType: 'daily' | 'monthly' | 'yearly'): string {
    // Helper to get month abbreviation
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let date: Date;

    // Handle different formats manually
    if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(key)) {
      // Format: yyyy-mm-dd (ISO or similar)
      date = new Date(key);
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(key)) {
      // Format: dd/mm/yyyy
      const [day, month, year] = key.split("/").map(Number);
      date = new Date(year, month - 1, day);
    } else if (/^\d{4}-\d{2}$/.test(key)) {
      // Format: yyyy-mm
      const [year, month] = key.split("-").map(Number);
      date = new Date(year, month - 1, 1);
    } else if (/^\d{4}$/.test(key)) {
      // Format: yyyy
      date = new Date(Number(key), 0, 1);
    } else {
      // Invalid or unknown format
      return key;
    }

    // Check for invalid date
    if (isNaN(date.getTime())) {
      return key;
    }

    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    if (filterType === 'daily') {
      return `${month} ${day}, ${year}`; // Example: "Feb 14, 2025"
    } else if (filterType === 'monthly') {
      return `${month}, ${year}`; // Example: "Feb, 2025"
    } else if (filterType === 'yearly') {
      return `${year}`; // Example: "2025"
    }

    return key; // Fallback
  }
  //-----------------
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
  
  // Logout method
  logout(): void {
    // Remove the user ID from local storage
    localStorage.removeItem('Savingsense_userId');

    // Redirect to the login page
    this.router.navigate(['/login']);
  }
  navigateToNew(category: string): void {
    this.router.navigate(['/new'], { queryParams: { category } });
  }
}
