import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { log } from 'ng-zorro-antd/core/logger';
import { AuthService } from '../../auth/auth.service';
import { jwtDecode } from 'jwt-decode';
import { NzSpinModule } from 'ng-zorro-antd/spin';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  imports: [CommonModule, ReactiveFormsModule, NzSpinModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  submitted = false;
  isLoading = false;
  token: any;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      loginname: ['', [Validators.required]],
      passwordhash: ['', [Validators.required]],
    });
  }

  onLogin(): void {
    this.submitted = true;
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.token = this.authService.getToken();

        try {
          const decoded: any = jwtDecode(this.token);
        } catch (error) {
          console.error('Invalid token', error);
        }

        const target = this.authService.RedirectUrl || '/admin';

        this.authService.RedirectUrl = null; // reset
        this.router.navigate([target]);
      },

      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Đăng nhập thất bại';
      },
    });
  }

}
