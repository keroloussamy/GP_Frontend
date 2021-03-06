import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { PasswordConfirmationValidatorService } from '../../shared/validations/password-confirmation-validator.service';
import { ResetPasswordDto } from '../../shared/_interfaces/resetPasswordDTO.model';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  public resetPasswordForm: FormGroup;
  public showSuccess: boolean;
  public showError: boolean;
  public errorMessage: string;

  private _token: string;
  private _email: string;

  constructor(private _authService: AuthenticationService, private _passConfValidator: PasswordConfirmationValidatorService,
    private _route: ActivatedRoute) { }

  ngOnInit(): void {
    this.resetPasswordForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirm: new FormControl('')
    });
    this.resetPasswordForm.get('confirm').setValidators([Validators.required,
    this._passConfValidator.validateConfirmPassword(this.resetPasswordForm.get('password'))]);

    this._token = this._route.snapshot.queryParams['token'];
    this._email = this._route.snapshot.queryParams['email'];
  }

  public validateControl = (controlName: string) => {
    return this.resetPasswordForm.controls[controlName].invalid && this.resetPasswordForm.controls[controlName].touched
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.resetPasswordForm.controls[controlName].hasError(errorName)
  }

  isDarkModeEnabled = () => window.localStorage.getItem('darkmode') == 'dark';
  
  public resetPassword = (resetPasswordFormValue) => {
    this.showError = this.showSuccess = false;

    const resetPass = { ...resetPasswordFormValue };
    const resetPassDto: ResetPasswordDto = {
      password: resetPass.password,
      confirmPassword: resetPass.confirm,
      token: this._token,
      email: this._email
    }

    this._authService.resetPassword(resetPassDto)
      .subscribe(res => {
        console.log(res)
        this.showSuccess = true;
      },
        err => {
          console.log(err)
          this.showError = true;
          this.errorMessage = err.error;
        })
  }


}
