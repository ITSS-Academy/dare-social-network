import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ShareModule } from '../../shared/share.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProfileModel } from '../../model/profile.model';
import { Subscription } from 'rxjs';
import { ProfileState } from '../../ngrx/profile/profile.state';
import { AuthState } from '../../ngrx/auth/auth.state';
import { Store } from '@ngrx/store';
import * as profileActions from '../../ngrx/profile/profile.actions';
import { MaterialModule } from '../../shared/material.module';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { WarningComponent } from '../../shared/components/warning/warning.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ShareModule, MaterialModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private store: Store<{ profile: ProfileState; auth: AuthState }>,
  ) {}

  createMineSuccess$ = this.store.select('profile', 'isCreateSuccess');

  isGetMineSuccess$ = this.store.select('profile', 'isGetMineSuccess');

  uid = '';
  isLoading = false;

  ngOnInit(): void {
    this.subscription.push(
      this.store.select('auth').subscribe((auth: AuthState) => {
        if (auth.authCredential) {
          this.uid = auth.authCredential.uid;
          this.regisForm.patchValue({
            email: auth.authCredential.email,
            avatarUrl: auth.authCredential.photoUrl,
            uid: auth.authCredential.uid,
          });
          console.log('auth', auth);
        }
      }),
    );
    this.createMineSuccess$.subscribe((isSuccess) => {
      if (isSuccess) {
        this.store.dispatch(profileActions.getMine({ uid: this.uid }));
      }
    });

    this.isGetMineSuccess$.subscribe((isSuccess) => {
      if (isSuccess) {
        this.isLoading = false;
        this.router.navigate(['/home']);
      }
    });

    // Vô hiệu hóa trường email khi cần thiết
    // this.disableEmailField();
  }
  subscription: Subscription[] = [];
  regisForm = new FormGroup({
    email: new FormControl(''),
    userName: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
    ]),
    avatarUrl: new FormControl(''),
    uid: new FormControl(''),
    box: new FormControl(false, Validators.requiredTrue),
  });

  regisData: ProfileModel = {
    email: '',
    userName: '',
    uid: '',
    bio: '',
    avatarUrl: '',
  };

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

  register() {
    let message = '';
    this.isLoading = true;
    if (this.regisForm.invalid) {
      if (this.regisForm.controls['userName'].invalid) {
        message = 'Please fill in the username field.';
      } else if (this.regisForm.controls['box'].value !== true) {
        message = 'Please agree to the terms and conditions.';
      }
      // @ts-ignore
      if (this.regisForm.value.userName.length < 10) {
        message = 'Please enter a valid username with at least 10 characters.';
      }
      // Ngăn không cho tiếp tục nếu có lỗi
      if (message) {
        this.openDialog(message);
        return;
      }
    } else {
      this.regisData = {
        email: this.regisForm.value.email ?? '',
        userName: this.regisForm.value.userName ?? '',
        uid: this.regisForm.value.uid ?? '',
        bio: '',
        avatarUrl: this.regisForm.value.avatarUrl ?? '',
      };
      this.store.dispatch(profileActions.createMine({ mine: this.regisData }));
    }

    console.log(this.regisData);
  }

  readonly dialog = inject(MatDialog);

  openDialog(message: string) {
    this.dialog.open(WarningComponent, {
      data: { message: message },
    });
  }
  // disableEmailField() {
  //   this.regisForm.get('email')?.disable();
  // }
}
