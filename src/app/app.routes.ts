import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NewComponent } from './new/new.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { SignupComponent } from './signup/signup.component';
import { RemoveComponent } from './remove/remove.component';
import { BackupComponent } from './backup/backup.component';
import { ExpenseComponent } from './expense/expense.component';
import { SavingComponent } from './saving/saving.component';
import { LoanComponent } from './loan/loan.component';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, data: { title: 'Login' } },
    { path: 'signup', component: SignupComponent, data: { title: 'Sign Up' } },
    { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' },canActivate: [AuthGuard] },    
    { path: 'expense', component: ExpenseComponent, data: { title: 'Expense' },canActivate: [AuthGuard] },    
    { path: 'saving', component: SavingComponent, data: { title: 'Saving' },canActivate: [AuthGuard] },    
    { path: 'loan', component: LoanComponent, data: { title: 'Loan' },canActivate: [AuthGuard] },    
    { path: 'new', component: NewComponent, data: { title: 'New' },canActivate: [AuthGuard]},
    { path: 'edit/:id', component: NewComponent ,data: { title: 'New' },canActivate: [AuthGuard]}, 
    { path: 'remove', component: RemoveComponent, data: { title: 'Remove' },canActivate: [AuthGuard]},
    { path: 'backup', component: BackupComponent, data: { title: 'Backup' },canActivate: [AuthGuard]},
    { path: 'profile', component: ProfileComponent, data: { title: 'Profile' },canActivate: [AuthGuard]},
    { path: 'edit-profile', component: EditProfileComponent, data: { title: 'Edit Profile' },canActivate: [AuthGuard]},
    // Add wildcard route to redirect to login page
     { path: '**', redirectTo: 'login' }
  ];
