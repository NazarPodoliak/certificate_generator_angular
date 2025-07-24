import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'certificate-app';
  showLandingPage = true;

  constructor(private router: Router) {}

  getStarted() {
    this.showLandingPage = false;
    this.router.navigate(['/']);
  }

  goToAdmin() {
    this.showLandingPage = false;
    this.router.navigate(['/admin']);
  }

  goHome() {
    this.showLandingPage = true;
  }
}
