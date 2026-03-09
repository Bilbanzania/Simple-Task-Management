import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { AppComponent } from '../app.component';
import { NgxTurnstileModule } from 'ngx-turnstile';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxTurnstileModule], 
  templateUrl: './login.component.html',
})
export class LoginComponent {
  auth = inject(AuthService);
  app = inject(AppComponent);
  cdr = inject(ChangeDetectorRef);
  
  isRegistering = signal(false);
  email = '';
  password = '';
  orgName = '';

  turnstileToken = '';

  isDarkMode = this.app.isDarkMode;

  onCaptchaResolved(token: string | null) {
    this.turnstileToken = token || '';
    this.cdr.detectChanges();
  }

  async submit() {
    if (!this.turnstileToken) {
      alert('Please complete the security check.');
      return;
    }

    try {
      if (this.isRegistering()) {
        await this.auth.register({ 
          email: this.email, 
          password: this.password, 
          organizationName: this.orgName,
          turnstileToken: this.turnstileToken 
        }).toPromise();
      } else {
        await this.auth.login({ 
          email: this.email, 
          password: this.password,
          turnstileToken: this.turnstileToken
        }).toPromise();
      }
    } catch (err) {
      alert('Error: ' + JSON.stringify(err));
    }
  }

  toggleMode() {
    this.isRegistering.set(!this.isRegistering());
  }

  toggleTheme() {
    this.app.toggleTheme();
  }
}