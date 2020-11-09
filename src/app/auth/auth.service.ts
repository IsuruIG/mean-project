import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthData } from './auth-data.model';
import { AuthInterceptor } from './auth-interceptor';

@Injectable({providedIn: 'root'})
export class AuthService {
private token: string;
private tokenTimer: any;
private authStatusListener = new Subject<boolean>();
private isAuthenticated = false;
private userId: string;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http.post("http://localhost:3000/user/signup", authData).subscribe(response => {
      console.log(response);
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http.post<{token: string, expiresIn: number, userId: string}>("http://localhost:3000/user/login", authData)
      .subscribe(response => {
        const recievedToken = response.token;
        this.token = recievedToken;
        if (recievedToken) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration *1000); // geTime() - to convert to millisecs.
          console.log(expirationDate);
          this.saveAuthData(recievedToken, expirationDate, this.userId);
          this.router.navigate(["/"]);
        }
      });
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInfo.token;
      this.isAuthenticated = true;
      this.userId = authInfo.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }

  private setAuthTimer(duraion: number) {
    console.log("Setting timer:" + duraion);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duraion * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('useerId');
  }

  private getAuthData() {
    const token =localStorage.getItem('token');
    const expDate =localStorage.getItem('expirationDate');
    const userId =localStorage.getItem('userId');

    if (!token || !expDate ) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expDate),
      userId: userId
    }
  }
}
