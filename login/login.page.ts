import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { SignUpComponent } from 'src/app/component/sign-up/sign-up.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form = new FormGroup({
    mobile: new FormControl(''),
    password: new FormControl(''),
  });
  hide: boolean = true;
  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  async signUp() {
    const modal = await this.modalCtrl.create({
      component: SignUpComponent,      
    });
    modal.present();
  }

}
