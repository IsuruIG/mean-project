import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  isUserIsAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isUserIsAuthenticated = this.authService.getIsAuth();
    this.authSub = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.isUserIsAuthenticated = isAuthenticated;
      });
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
