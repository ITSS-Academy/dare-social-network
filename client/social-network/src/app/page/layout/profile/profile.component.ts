import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { FollowingComponent } from './following/following.component';
import { FollowersComponent } from './followers/followers.component';
import { MaterialModule } from '../../../shared/material.module';
import { AsyncPipe, NgForOf } from '@angular/common';
import { PostComponent } from '../../../shared/components/post/post.component';
import { PostModel, PostResponse } from '../../../model/post.model';
import { Subscription } from 'rxjs';
import { PostState } from '../../../ngrx/post/post.state';
import { Store } from '@ngrx/store';
import { ProfileState } from '../../../ngrx/profile/profile.state';
import * as PostAction from '../../../ngrx/post/post.actions';
import * as ProfileAction from '../../../ngrx/profile/profile.actions';
import { ProfileModel } from '../../../model/profile.model';
import { ActivatedRoute } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MaterialModule,
    NgForOf,
    PostComponent,
    AsyncPipe,
    InfiniteScrollDirective,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  profileByUid$ = this.store.select('profile', 'profile');
  profileMine$ = this.store.select('profile', 'mine');

  minePosts$ = this.store.select('post', 'minePosts');

  isGettingMinePost$ = this.store.select('post', 'isGettingMinePost');

  minePosts: PostResponse = <PostResponse>{};
  profileMine: ProfileModel = <ProfileModel>{};
  mineUid = '';
  yoursUid = '';
  constructor(
    public dialog: MatDialog,
    private activeRoute: ActivatedRoute,
    public store: Store<{
      post: PostState;
      profile: ProfileState;
    }>,
  ) {
    const { uid } = this.activeRoute.snapshot.params;
    console.log(uid);
    this.store.dispatch(
      PostAction.getMinePost({ uid, pageNumber: 1, limitNumber: 30 }),
    );
    this.store.dispatch(ProfileAction.getById({ uid }));
    this.yoursUid = uid;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.store.dispatch(PostAction.clearMinePost());
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.profileByUid$.subscribe((profile) => {
        if (profile) {
          this.profileMine = profile;
        }
      }),

      this.minePosts$.subscribe((posts) => {
        console.log(posts);
        this.minePosts = posts;
      }),

      this.profileMine$.subscribe((profile) => {
        if (profile?.uid) {
          this.mineUid = profile.uid;
        }
      }),
    );
  }

  openDialog2() {
    this.dialog.open(FollowingComponent);
  }

  openDialog3() {
    this.dialog.open(FollowersComponent);
  }

  openEditProfileDialog(): void {
    const dialogRef = this.dialog.open(EditProfileComponent, {
      data: {
        avatarUrl: this.profileMine.avatarUrl,
        name: this.profileMine.userName,
        bio: this.profileMine.bio,
      },
    });
  }

  posts: PostModel[] = [];

  selectedPost?: PostModel;
}
