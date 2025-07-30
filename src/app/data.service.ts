import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //private apiUrl = `http://localhost:5106`; // Your base API URL
  private apiUrl = `https://manojit.runasp.net`; // Your base API URL

  constructor(private http: HttpClient) { }
  
  // **Signup**: Registers a new user with email, username, and password
  signup(email: string, username: string, password: string): Observable<any> {
    const signupData = { email, username, password };
    return this.http.post<any>(`${this.apiUrl}/api/User/signup`, signupData);
  }

  // **Login**: Authenticate user and get userId or LoginId on successful login
  login(username: string, password: string): Observable<any> {
    const email='';
    const loginData = {email, username, password };
    return this.http.post<any>(`${this.apiUrl}/api/User/login`, loginData);
  }

  // **FormDataController - GET**: Get form data by LoginId
  getFormDataByLoginId(loginId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formdata?loginId=${loginId}`);
  }

  // **FormDataController - POST**: Save form data to server
  saveFormData(formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/formdata`, formData);
  }

  // **FormDataController - PUT**: Update form data based on ID and LoginId
  updateFormData(id: number, loginId: number, formData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/formdata/${id}?loginId=${loginId}`, formData);
  }

  // **FormDataController - DELETE**: Delete form data based on ID and LoginId
  deleteFormData(id: number, loginId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/formdata/${id}?loginId=${loginId}`);
  }
   // **UserController - PUT**: Update user by ID
   updateUser(id: number, updatedUser: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/User/update/${id}`, updatedUser);
  }

  // **UserController - GET**: Get user by ID
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/User/${id}`);
  }
  getUserDetails() {
    return localStorage.getItem('Savingsense_userId');
  }
}