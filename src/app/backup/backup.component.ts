import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router, RouterModule } from '@angular/router';// To detect the platform
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [RouterModule, CommonModule,FormsModule],
  templateUrl: './backup.component.html',
  styleUrl: './backup.component.css'
})
export class BackupComponent implements OnInit {
  data: any[] = [];
  filteredData: any[] = [];
  startDate: string = '';
  endDate: string = '';
  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.startDate = formatDate(firstDayOfMonth, 'yyyy-MM-dd', 'en');
    this.endDate = formatDate(today, 'yyyy-MM-dd', 'en');
    this.fetchData();
  }

  fetchData(): void {
    const loginId = localStorage.getItem('Savingsense_userId');
    if (loginId) {
      this.dataService.getFormDataByLoginId(parseInt(loginId, 10)).subscribe(
        (data) => {
          this.data = data.map(({ loginId, ...rest }) => rest); // Exclude loginId
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }
   // Filter data based on the selected date range
filterDataByDate(): void {
  if (this.startDate && this.endDate) {
    // Set the time to the start of the startDate and end of the endDate
    const startDate = new Date(this.startDate);
    startDate.setHours(0, 0, 0, 0); // Set to start of the day

    const endDate = new Date(this.endDate);
    endDate.setHours(23, 59, 59, 999); // Set to end of the day

    // Filter the data
    this.filteredData = this.data.filter((item) => {
      const itemDate = new Date(item.date); // Assuming 'date' is a field in your data
      return itemDate >= startDate && itemDate <= endDate;
    });
  } else {
    // If no dates are selected, default to showing all data
    this.filteredData = [...this.data];
  }
}
printAsPdf(): void {
  this.filterDataByDate(); // Apply date range filter

  // Function to format the date as 'dd MMM yyyy'
  const formatDateToReadable = (date: string) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('default', { month: 'short' }); // Get short month name
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Calculate totals for expenseAmount and savingAmount
  let totalExpenseAmount = 0;
  let totalSavingAmount = 0;

  // Processed data for the table
  const tableRows = this.filteredData.map((item, index) => {
    const expenseAmount = item.expenseAmount || 0;
    const savingAmount = item.savingAmount || 0;

    totalExpenseAmount += expenseAmount;
    totalSavingAmount += savingAmount;

    return `
      <tr>
        <td>${index + 1}</td> <!-- Serial Number (SL No) -->
        <td>${formatDateToReadable(item.date)}</td>
        <td>${item.category}</td>
        <td>${item.expenseName}</td>
        <td>${item.savingName}</td>
        <td style="text-align: right;">${expenseAmount.toFixed(2)}</td>
        <td style="text-align: right;">${savingAmount.toFixed(2)}</td>
      </tr>
    `;
  });

  // Total row
  const totalRow = `
    <tr>
      <td colspan="5" style="text-align: right; font-weight: bold;">Total</td>
      <td style="text-align: right; font-weight: bold;">${totalExpenseAmount.toFixed(2)}</td>
      <td style="text-align: right; font-weight: bold;">${totalSavingAmount.toFixed(2)}</td>
    </tr>
  `;

  // Print content
  const printContent = `
    <div style="text-align: center;">
      <img src="img/logo.png" alt="Logo" width="100" />
      <h1>Savingsense</h1>
      <h3>Data Backup</h3>
      <p>Date: ${formatDateToReadable(this.startDate)} to ${formatDateToReadable(this.endDate)}</p>
    </div>
    <table border="1" cellpadding="5" style="width: 100%; margin-top: 20px; border-collapse: collapse;">
      <thead>
        <tr>
          <th>SL No</th> <!-- Serial Number Header -->
          <th>Date</th>
          <th>Category</th>
          <th>Expense</th>
          <th>Saving</th>
          <th style="text-align: right;">Expense Amount</th>
          <th style="text-align: right;">Saving Amount</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.join('')}
        ${totalRow}
      </tbody>
    </table>
  `;

  const newWindow = window.open();

  // Check if newWindow is not null before using it
  if (newWindow) {
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.print();
  } else {
    alert('Unable to open the print window. Please check your browser settings.');
  }
}

  
  // async downloadAsJson(): Promise<void> {
  //   const date = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
  //   const fileName = `Savingsense_backup_${date}.json`;
  //   const jsonData = JSON.stringify(this.data, null, 2); // Beautified JSON
  
  //   if (this.data && this.data.length > 0) {
  //     try {
  //       await Filesystem.writeFile({
  //         path: fileName,
  //         data: jsonData,
  //         directory: Directory.Documents,
  //         recursive: true,
  //       });
  //       alert(`File saved successfully: ${fileName}`);
  //     } catch (error) {
  //       console.error('Error saving JSON file:', error);
  //       alert('Failed to save the file.');
  //     }
  //   } else {
  //     alert('No data available to save.');
  //   }
  // }
  
  // async downloadAsExcel(): Promise<void> {
  //   const date = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
  //   const fileName = `Savingsense_backup_${date}.csv`;
  
  //   if (this.data && this.data.length > 0) {
  //     const rows = [
  //       Object.keys(this.data[0]), // Column headers
  //       ...this.data.map((row) =>
  //         Object.values(row).map((value) => {
  //           // Enclose in double quotes if the value contains a comma
  //           if (typeof value === 'string' && value.includes(',')) {
  //             return `"${value}"`;
  //           }
  //           return value;
  //         })
  //       ),
  //     ];
  
  //     const csvContent = rows.map((row) => row.join(',')).join('\n');
  
  //     try {
  //       await Filesystem.writeFile({
  //         path: fileName,
  //         data: csvContent,
  //         directory: Directory.Documents,
  //         recursive: true,
  //       });
  //       alert(`File saved successfully: ${fileName}`);
  //     } catch (error) {
  //       console.error('Error saving CSV file:', error);
  //       alert('Failed to save the file.');
  //     }
  //   } else {
  //     alert('No data available to save.');
  //   }
  // }
  
  
  
}