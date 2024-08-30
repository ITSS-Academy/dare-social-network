import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material.module';
import { ShareModule } from '../../../../shared/share.module';
import { Store } from '@ngrx/store';
import { StorageState } from '../../../../ngrx/storage/storage.state';
import { StorageModel } from '../../../../model/storage.model';
import * as StorageActions from '../../../../ngrx/storage/storage.actions';
import { Subscription } from 'rxjs';
import { ProfileModel } from '../../../../model/profile.model';
import { ProfileState } from '../../../../ngrx/profile/profile.state';
import * as ProfileActions from '../../../../ngrx/profile/profile.actions';

import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [MaterialModule, ShareModule],
  templateUrl: 'edit-profile.component.html',
  styleUrls: ['edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, OnDestroy {
  @Output() avatarChanged = new EventEmitter<string>();
  urlsa: string;
  myAvatarUrl: string[] = [];
  myFile: File[] = [];
  uid = '';
  profileMine: ProfileModel = <ProfileModel>{};

  protected readonly value = signal('');

  protected onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected document = document;
  profileForm: ProfileModel = {
    bio: '',
    uid: '',
    userName: '',
    email: '',
    avatarUrl: this.profileMine.avatarUrl,
  };
  editProfileForm = new FormGroup({
    name: new FormControl(''),
    bio: new FormControl(''),
    uid: new FormControl(''),
    email: new FormControl(''),
    avatarUrl: new FormControl(''),
  });

  subscription: Subscription[] = [];

  imageUrls$ = this.store.select('storage', 'url');

  isUploading$ = this.store.select('storage', 'isUploading');
  uploadError$ = this.store.select('storage', 'uploadError');

  profileMine$ = this.store.select('profile', 'mine');
  isUpdating = false;
  isUpdateSuccess$ = this.store.select('profile', 'isUpdateSuccess');

  constructor(
    public snackBar: MatSnackBar,

    public dialog: MatDialog,
    public store: Store<{
      storage: StorageState;
      profile: ProfileState;
    }>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.urlsa = data.avatarUrl;
  }
  ngOnInit(): void {
    this.subscription.push(
      this.profileMine$.subscribe((profile) => {
        if (profile) {
          this.uid = profile.uid;
          this.editProfileForm.setValue({
            name: profile.userName,
            bio: profile.bio,
            uid: profile.uid,
            email: profile.email,
            avatarUrl: profile.avatarUrl,
          });
          this.profileMine = profile;
        }
      }),

      this.imageUrls$.subscribe((urls) => {
        if (urls) {
          console.log(urls);
          urls.forEach((url) => {
            this.myAvatarUrl.push(url);
            this.profileForm.avatarUrl = url;
            console.log(this.profileForm.avatarUrl);
          });
        }
      }),

      this.uploadError$.subscribe((error) => {
        if (error) {
          this.snackBar.open('Image size must be under 5MB ', 'Close', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        }
      }),

      this.isUpdateSuccess$.subscribe((isUpdateSuccess) => {
        if (isUpdateSuccess) {
          this.isUpdating = false;

          this.store.dispatch(ProfileActions.getMine({ uid: this.uid }));
          //when update success, show snackbar
          this.snackBar.open('Update successfully', 'Close', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });

          this.dialog.closeAll();
        }
      }),
    );
  }
  ngOnDestroy(): void {
    this.subscription.forEach((sub) => {
      sub.unsubscribe();
    });
    this.store.dispatch(StorageActions.clearState());
    this.store.dispatch(ProfileActions.clearUpdateState());
  }
  onSelectedFile(e: any): void {
    if (e.target.files) {
      console.log(e.target.files);
      Array.from(e.target.files).forEach((value) => {
        const file = value as File;
        this.myFile.push(file);
        console.log(this.myFile);
      });
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.urlsa = event.target.result;
      };
      this.myFile.forEach((file) => {
        this.store.dispatch(
          StorageActions.uploadFile({ file, fileName: file.name }),
        );
      });
    }
  }

  onSaveClick(): void {
    // this.avatarChanged.emit(this.url);
    this.isUpdating = true;
    this.profileForm = {
      uid: this.editProfileForm.value.uid ?? '',
      avatarUrl: this.profileForm.avatarUrl ?? this.profileMine.avatarUrl,
      email: this.editProfileForm.value.email ?? '',
      bio: this.editProfileForm.value.bio ?? '',
      userName: this.editProfileForm.value.name ?? '',
    };
    console.log(this.profileForm);
    this.store.dispatch(
      ProfileActions.updateMine({
        mine: this.profileForm,
      }),
    );

    // this.dialog.closeAll();
    // this.clearInput();
  }
  clearName(): void {
    this.editProfileForm.patchValue({
      name: '',
    });
  }
  clearBio(): void {
    this.editProfileForm.patchValue({
      bio: '',
    });
  }
}
