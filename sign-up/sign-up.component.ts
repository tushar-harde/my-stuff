import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';

const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (formGroup.get('password').value === formGroup.get('confirmPassword').value)
    return null;
  else
    return {passwordMismatch: true};
};

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  private validOtp: boolean = false;
  private confirmMobile: boolean = false;

  form = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    mobile: new FormControl(),
    otp: new FormControl({value: '', disabled: !this.confirmMobile}),
    email: new FormControl({value: '', disabled: !this.validOtp}),
    password: new FormControl({value: '', disabled: !this.validOtp}),
    confirmPassword: new FormControl({value: '', disabled: !this.validOtp}),
  },
  {
    validators: passwordMatchValidator
  });
  hide: boolean = true;
  
  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {}

  close() {
    this.modalCtrl.dismiss();
  }

  matchPassword() {
    if (this.form.hasError('passwordMismatch'))
      this.form.controls['confirmPassword'].setErrors([{'passwordMismatch': true}]);
    else
      this.form.controls['confirmPassword'].setErrors(null);
  }

  async confirmMobileNumber(event) {
    let mobile: number = this.form.get('mobile').value;
    try {
      if(mobile.toString().length != 10) {
        return;
      }        
      else if(mobile.toString().length === 10) {
        const alert = await this.alertCtrl.create({
          header: "Confirm mobile",
          message: `Your otp will send to this mobile number ${event.target.value}`,
          buttons: [{
            text: 'OK',
            handler: () => {
              console.log('mobile confirmed!');
            }
          },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () =>{
            console.log('cancel');
          }
        }]
        });
        await alert.present();
      }
    }
    catch(err) {
      return;
    }
  }

}
