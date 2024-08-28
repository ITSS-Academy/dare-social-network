import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { PostComponent } from '../../../shared/components/post/post.component';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { PostState } from '../../../ngrx/post/post.state';
import * as postActions from '../../../ngrx/post/post.actions';
import { Subscription } from 'rxjs';
import { PostModel, PostResponse } from '../../../model/post.model';
import { ProfileState } from '../../../ngrx/profile/profile.state';

import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MaterialModule,
    PostComponent,
    RouterOutlet,
    NgFor,
    NgIf,
    RouterLink,
    InfiniteScrollDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private store: Store<{
      post: PostState;
      profile: ProfileState;
    }>,
  ) {
    this.store.dispatch(
      postActions.getAllPost({
        pageNumber: this.currentPage,
        limitNumber: this.size,
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
    this.store.dispatch(postActions.clearGetPost());
  }

  selector: string = '.scroll-container';
  currentPage = 1;
  size = 30;
  itemsCount = 0;
  subscription: Subscription[] = [];
  getAllPost$ = this.store.select('post', 'posts');
  tempArray: PostModel[] = [];

  ngOnInit(): void {
    this.subscription.push(
      this.getAllPost$.subscribe((posts) => {
        if (posts.pageNumber > 0) {
          console.log(posts.limitNumber);
          this.tempArray = [...this.posts];
          console.log(this.tempArray);
          this.posts = [...this.tempArray, ...posts.data];
          this.itemsCount = posts.limitNumber;
        }
      }),
    );
  }

  posts: PostModel[] = [];

  onScrollDown(ev: any) {
    console.log('scrolled down!!', ev);
    this.currentPage += 1;
    console.log('page', this.currentPage);
    console.log('item', this.itemsCount);

    if (this.currentPage <= this.itemsCount) {
      console.log('get more post');
      console.log(this.currentPage);
      console.log(this.size);
      this.store.dispatch(
        postActions.getAllPost({
          pageNumber: this.currentPage,
          limitNumber: this.size,
        }),
      );
    }
  }
}
