import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { PostModel } from '../../model/post.model';
import { ProfileModel } from '../../model/profile.model';
import * as CommentAction from '../../ngrx/comment/comment.actions';
import { CommentState } from '../../ngrx/comment/comment.state';
import * as PostAction from '../../ngrx/post/post.actions';
import { PostState } from '../../ngrx/post/post.state';
import { LikeState } from '../../ngrx/like/like.state';
import { ProfileState } from '../../ngrx/profile/profile.state';
import { IdToAvatarPipe } from '../../shared/pipes/id-to-avatar.pipe';
import { IdToNamePipe } from '../../shared/pipes/id-to-name.pipe';
import { ShareModule } from '../../shared/share.module';
import * as PostActions from '../../ngrx/post/post.actions';
import * as ProfileActions from '../../ngrx/profile/profile.actions';
import * as LikeActions from '../../ngrx/like/like.actions';
import { CommentModel } from '../../model/comment.model';
import { LikeModel } from '../../model/like.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Location } from '@angular/common';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-detail-post',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogClose,
    AsyncPipe,
    IdToNamePipe,
    IdToAvatarPipe,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatButton,
    ShareModule,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatButton,
    ShareModule,
    MatIconButton,
    MatProgressSpinner,
  ],
  templateUrl: './detail-post.component.html',
  styleUrls: ['./detail-post.component.scss'],
  providers: [
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
  ],
})
export class DetailPostComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  postDetail$ = this.store.select('post', 'postDetail');
  getPostDetailSuccess$ = this.store.select('post', 'isGetPostDetailSuccess');
  getPostDetail$ = this.store.select('post', 'isGettingPostDetail');
  mine$ = this.store.select('profile', 'mine');
  comments$ = this.store.select('comment', 'comments');
  createCommentSuccess$ = this.store.select('comment', 'createCommentSuccess');
  createLikeSuccess$ = this.store.select('like', 'createLikeSuccess');
  likes$ = this.store.select('like', 'likes');
  deleteLikeSuccess$ = this.store.select('like', 'deleteLikeSuccess');
  likeCount$ = this.store.select('like', 'count');

  profileMine: ProfileModel = <ProfileModel>{};
  postDetails: PostModel = <PostModel>{};
  postId = '';
  commentList: CommentModel[] = [];
  likeList: LikeModel[] = [];
  isLoading = false;
  constructor(
    private dialogRef: MatDialogRef<DetailPostComponent>,
    private location: Location,
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private store: Store<{
      post: PostState;
      profile: ProfileState;
      comment: CommentState;
      like: LikeState;
    }>,
    private activeRoute: ActivatedRoute,
  ) {
    const { id } = this.activeRoute.snapshot.params;
    console.log('id:', id);

    // this.store.dispatch(LikeActions.getLikes({ postId: id }));
    this.postId = id;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.store.dispatch(CommentAction.clearCommentState());
  }

  commentForm = new FormGroup({
    content: new FormControl(''),
  });

  ngOnInit(): void {
    this.likeCount$ = this.likes$.pipe(map((likes) => likes.length));

    this.subscriptions.push(
      this.postDetail$.subscribe((post) => {
        if (post.id) {
          this.store.dispatch(
            LikeActions.getLikes({ postId: post.id.toString() }),
          );

          this.store.dispatch(
            CommentAction.GetComments({ postId: post.id.toString() }),
          );
          this.postDetails = post;
          console.log('postDetails', this.postDetails);
        }
      }),

      this.mine$.subscribe((profile) => {
        if (profile) {
          this.profileMine = profile;
        }
      }),

      this.comments$.subscribe((comments) => {
        if (comments) {
          this.commentList = comments;
        }
      }),

      this.createCommentSuccess$.subscribe((success) => {
        if (success) {
          this.isLoading = false;
          this.store.dispatch(
            CommentAction.GetComments({
              postId: this.postDetails.id.toString(),
            }),
          );
        }
      }),

      this.createLikeSuccess$.subscribe((success) => {
        if (success) {
          this.isLoading = false;
          this.store.dispatch(
            LikeActions.getLikes({ postId: this.postDetails.id.toString() }),
          );
        }
      }),

      this.likes$.subscribe((likes) => {
        if (likes) {
          this.likeList = likes;
          this.isLiked = likes.some(
            (like) => like.uid === this.profileMine.uid,
          );
        }
      }),

      this.createLikeSuccess$.subscribe((success) => {
        if (success) {
          this.store.dispatch(
            LikeActions.getLikes({ postId: this.postDetails.id.toString() }),
          );
        }
      }),

      this.deleteLikeSuccess$.subscribe((success) => {
        if (success) {
          this.store.dispatch(
            LikeActions.getLikes({ postId: this.postDetails.id.toString() }),
          );
        }
      }),
    );

    this.activeRoute.url.subscribe((url) => {
      const urlSegment = url.join('/');
      if (urlSegment.startsWith('detail-post/')) {
        const id = BigInt(urlSegment.split('/')[1]);
        //convert string to bigint

        this.store.dispatch(PostActions.getPostById({ id: id }));
      }
    });

    this.likeCount$.subscribe((likeCount) => {});
  }

  onExit() {
    console.log('exit');

    this.location.back();
    this.commentList = [];
    this.store.dispatch(CommentAction.clearCommentState());
    this.store.dispatch(LikeActions.clearLikeState());
  }

  isLiked = false;

  navigateToProfile() {
    this.router.navigateByUrl(`/profile/${this.postDetails.uid}`).then();
    this.store.dispatch(PostActions.clearMinePost());
    //close dialog
  }

  navigateToCommentProfile(uid: string) {
    this.router
      .navigateByUrl(`/profile/${uid}`)
      .then(() => this.dialogRef.close());
    this.store.dispatch(PostActions.clearMinePost());
  }

  navigateToMineProfile() {
    this.router
      .navigateByUrl(`/profile/${this.profileMine.uid}`)
      .then(() => this.dialogRef.close());
    this.store.dispatch(PostActions.clearMinePost());
  }

  createComment() {
    console.log('comment is empty');

    const comment = this.commentForm.value;
    if (!comment.content) {
      console.log('comment is empty');
      return;
    } else {
      this.isLoading = true;

      this.store.dispatch(
        CommentAction.createComment({
          content: comment.content,
          postId: this.postDetails.id,
          uid: this.profileMine.uid,
        }),
      );
      console.log('comment created');
    }
  }

  createLike() {
    this.isLoading = true;
    if (!this.isLiked) {
      this.store.dispatch(
        LikeActions.createLike({
          like: {
            id: 0,
            postId: this.postDetails.id,
            uid: this.profileMine.uid,
          },
        }),
      );
      this.isLiked = true;
    }
  }

  deleteLike() {
    this.isLoading = true;
    this.store.dispatch(
      LikeActions.deleteLike({ postId: this.postDetails.id.toString() }),
    );
    this.isLiked = false;
  }
}
