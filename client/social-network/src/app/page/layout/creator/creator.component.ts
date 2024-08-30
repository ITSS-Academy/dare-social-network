import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { PostModel } from '../../../model/post.model';
import { ShareModule } from '../../../shared/share.module';
import { Store } from '@ngrx/store';
import { ProfileState } from '../../../ngrx/profile/profile.state';
import * as PostAction from '../../../ngrx/post/post.actions';
import { PostState } from '../../../ngrx/post/post.state';
import { Subscription } from 'rxjs';
import { getAllPost } from '../../../ngrx/post/post.actions';
import { PostDataModel } from '../../../model/post-data.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-creator',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    NgIf,
    ShareModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './creator.component.html',
  styleUrl: './creator.component.scss',
})
export class CreatorComponent implements OnInit, OnDestroy {
  protected readonly value = signal('');

  protected onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }
  profileMine$ = this.store.select('profile', 'mine');
  uid = '';

  subscription: Subscription[] = [];
  isLoading = true;
  isCreating$ = this.store.select('post', 'isCreating');
  isCreateSuccess$ = this.store.select('post', 'isCreateSuccess');

  constructor(
    public snackBar: MatSnackBar,

    private store: Store<{
      profile: ProfileState;
      post: PostState;
    }>,
  ) {
    this.subscription.push(
      this.profileMine$.subscribe((profile) => {
        if (profile) {
          this.uid = profile.uid;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
    this.isCreateSuccess$.subscribe().unsubscribe();
  }
  myFile: File[] = [];

  ngOnInit(): void {
    this.subscription.push(
      this.isCreating$.subscribe((isCreating) => {
        this.isLoading = isCreating;
        console.log('isCreating: ', isCreating);
      }),

      this.isCreateSuccess$.subscribe((isCreateSuccess) => {
        if (isCreateSuccess) {
          this.snackBar.open('Post created successfully', 'Close', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        }
      }),
    );
  }

  imageUrl = new FormControl(new Array<File>());

  createPostForm = new FormGroup({
    title: new FormControl(''),
    content: new FormControl(''),
  });
  postForm: PostModel = {
    uid: '',
    title: '',
    content: '',
    imageUrls: this.myFile as File[],
    id: BigInt(1),
    isLiked: false,
  };

  imageSrc: string | ArrayBuffer | null | undefined = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  isImageUploaded = false;
  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.myFile = [];

    if (input.files && input.files[0]) {
      Array.from(input.files).forEach((file) => {
        this.myFile.push(file); // Ensure myFile is an array and push files into it
      });
      const reader = new FileReader();
      console.log('input.files: ', input.files);
      reader.onload = (e) => {
        this.imageSrc = e.target?.result;
        this.isImageUploaded = true;
      };
      reader.readAsDataURL(input.files[0]);

      console.log('Post Form: ', this.postForm);
    } else {
      this.resetState();
    }
    console.log('My File: ', this.myFile);
  }
  clearInputData() {
    this.createPostForm.setValue({
      title: '',
      content: '',
    });
    this.imageSrc = null;
  }
  createPost() {
    const inputFilled = this.createPostForm.value?.title?.trim() !== '';
    const imageSrcFilled =
      typeof this.imageSrc === 'string' && this.imageSrc.trim() !== '';
    //
    // console.log('Title: ', this.createPostForm.value.title);
    // console.log('Description: ', this.createPostForm.value.description);
    // console.log('Image: ', this.imageSrc);

    if (!inputFilled || !imageSrcFilled) {
      this.snackBar.open('Please fill in all fields', 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      return;
    }
    if (this.myFile.length > 0) {
      for (const file of this.myFile) {
        if (!['image/png', 'image/jpeg'].includes(file.type)) {
          this.snackBar.open('Please upload a png or jpeg file', 'Close', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          return;
        }

        if (!this.imageSizeLimit(file)) {
          this.snackBar.open('Image size must be less than 5MB', 'Close', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          return;
        }
      }
    }

    this.createPostForm.value.title = this.createPostForm.value
      ?.title as string;
    //   this.textLimit(
    //   this.createPostForm.value?.title as string,
    //   10,
    // );
    console.log('Title: ', this.createPostForm.value.title);
    console.log('Description: ', this.createPostForm.value.content);
    console.log('Image: ', this.postForm.imageUrls);
    this.postForm = {
      uid: this.uid,
      id: BigInt(1),
      title: this.createPostForm.value.title,
      content: this.createPostForm.value.content ?? '',
      imageUrls: this.myFile,
      isLiked: false,
    };

    console.log('Post Form: ', this.postForm);
    this.store.dispatch(PostAction.createPost({ post: this.postForm }));

    this.clearInputData();
    this.resetState();
  }
  // textLimit(text: string, wordLimit: number): string {
  //   text.split(/\s+/);
  //   if (text.length > wordLimit) {
  //     return text.splice(0, wordLimit)
  //   }
  //   return text;
  // }
  imageSizeLimit(file: File): boolean {
    return file.size / 1024 / 1024 < 5;
  }
  clearTitle() {
    this.createPostForm.patchValue({
      title: '',
    });
  }
  clearContent() {
    this.createPostForm.patchValue({
      content: '',
    });
  }
  resetState() {
    this.isImageUploaded = false;
    this.imageSrc = null;
    this.myFile = [];

    // Reset the file input field
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clear the file input value
    }
  }
  // private maxLines = 15;
  // limitTextLine(event: Event): void{
  //   const textarea = event.target as HTMLTextAreaElement;
  //   const lines = textarea.value.split('\n').length;
  //
  //   if(lines > this.maxLines ){
  //     const truncatedText = textarea.value.split('\n').slice(0, this.maxLines).join('\n');
  //     textarea.value = truncatedText;
  //   }
  //
  // }
}
