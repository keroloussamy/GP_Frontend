import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../shared/services/authentication.service';
import { PatternValidation } from '../shared/validations/patternMatcher';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  constructor(private loginService:AuthenticationService,private fb:FormBuilder,private router: Router) { }

  ngOnInit(): void {
  }

  
  get firstname()
  {
    return this.signupform.get('firstname');
  } 
  get lastname()
  {
    return this.signupform.get('lastname');
  } 
  get username()
  {
    return this.signupform.get('username');
  } 
  get email()
  {
    return this.signupform.get('email');
  }
  get password()
  {
    return this.signupform.get('password');
  }


  signupform=this.fb.group({
    firstname:['',[Validators.required,Validators.minLength(5)]],
    lastname:['',[Validators.required,Validators.minLength(5)]],
    username:['',[Validators.required,Validators.minLength(5)]],
    password:['',[Validators.required]],
    email:['',[Validators.required,PatternValidation(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)]],
  });


  invalidEmailOrPassword:boolean = false;

  onSubmit()
  {
    this.loginService.signup(this.signupform.value).subscribe(
      response=>{
        
        localStorage.setItem('token',response.body['token'])
        localStorage.setItem('currentUser',JSON.stringify(response.body))
      this.invalidEmailOrPassword = false;
        this.router.navigate(['/home'])

      }
    ,err=>{
      this.invalidEmailOrPassword = true;
    })
  }

}