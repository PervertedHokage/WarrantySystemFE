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

  }
}
