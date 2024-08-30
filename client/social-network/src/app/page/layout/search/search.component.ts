import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchService } from '../../../service/search/search.service';
import { PostModel } from '../../../model/post.model';
import { Store } from '@ngrx/store';
import * as SearchActions from '../../../ngrx/search/search.actions';
import * as postActions from '../../../ngrx/post/post.actions';
import { SearchState } from '../../../ngrx/search/search.state';
import { PostState } from '../../../ngrx/post/post.state';
import { ProfileState } from '../../../ngrx/profile/profile.state';
import { Router, RouterLink } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { ShareModule } from '../../../shared/share.module';
import { PostComponent } from '../../../shared/components/post/post.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    PostComponent,
    MaterialModule,
    AsyncPipe,
    NgForOf,
    NgIf,
    RouterLink,
    ShareModule,
    InfiniteScrollDirective,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  posts: PostModel[] = [];
  searchControl = new FormControl();
  subscription: Subscription[] = [];
  isLoading = true;
  isSearching$ = this.store.select('search', 'isSearching');
  searchResult$ = this.store.select('search', 'searchResult');

  constructor(
    private router: Router,
    private store: Store<{
      search: SearchState;
      post: PostState;
      profile: ProfileState;
    }>,
    private searchService: SearchService,
  ) {}

  ngOnInit(): void {
    this.subscription.push(
      this.searchControl.valueChanges
        .pipe(debounceTime(1000))
        .subscribe((query) => {
          this.searchQuery = query.trim();
          this.performSearch();
          this.store.dispatch(
            SearchActions.search({ query: this.searchQuery }),
          );
        }),

      this.searchResult$.subscribe((result) => {
        if (result) {
          this.posts = result.posts;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
    this.store.dispatch(postActions.clearGetPost());
    this.store.dispatch(SearchActions.searchReset());
  }

  performSearch(): void {
    if (this.searchQuery.startsWith('@')) {
      this.searchService
        .searchProfileByUsername(this.searchQuery.substring(0))
        .subscribe((results) => {
          this.posts = results;
          console.log(results);
        });
    }
  }
}
