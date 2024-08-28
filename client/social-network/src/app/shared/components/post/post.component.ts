import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MaterialModule } from '../../material.module';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { IdToAvatarPipe } from '../../pipes/id-to-avatar.pipe';
import { IdToNamePipe } from '../../pipes/id-to-name.pipe';
import { Store } from '@ngrx/store';
import { ProfileState } from '../../../ngrx/profile/profile.state';
import { ProfileModel } from '../../../model/profile.model';
import { filter, Subscription } from 'rxjs';
import { PostModel } from '../../../model/post.model';
import { NavigationEnd, Router } from '@angular/router';
import * as ProfileActions from '../../../ngrx/profile/profile.actions';
import * as PostActions from '../../../ngrx/post/post.actions';
import { PostLoaderSkeletonComponent } from '../post-loader-skeleton/post-loader-skeleton.component';
import { MatDialog } from '@angular/material/dialog';
import { DetailPostComponent } from '../../../page/detail-post/detail-post.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    MaterialModule,
    NgForOf,
    NgIf,
    IdToAvatarPipe,
    AsyncPipe,
    IdToNamePipe,
    PostLoaderSkeletonComponent,
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
})
export class PostComponent implements OnInit {
  private routerSubscription: Subscription | null = null;
  constructor(
    private route: Router,
    private store: Store<{
      profile: ProfileState;
    }>,
    private location: Location,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.routerSubscription = this.route.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.dialog.closeAll();
      });
  }

  profiles = <ProfileModel>{};

  @Input() post: PostModel = <PostModel>{};
  @Output() imageClick = new EventEmitter<void>();

  onImageClick() {
    this.route.navigateByUrl(`/detail-post/${this.post.id}`).then();
    // this.store.dispatch(PostActions.getPostById({ id: this.post.id }));
  }

  openPostDetail() {
    const dialogRef = this.dialog.open(DetailPostComponent, {
      maxWidth: '100%',
      maxHeight: '100%',
      closeOnNavigation: true,
    });
    this.store.dispatch(PostActions.getPostById({ id: this.post.id }));

    this.location.go(`/detail-post/${this.post.id}`);

    //close dialog

    const currentUrl = this.route.url;
    // console.log('post', post);

    //change url to detail. change url but dont change page
    dialogRef.afterClosed().subscribe(() => {
      this.location.go(currentUrl);
    });
  }

  deletePost() {
    this.store.dispatch(PostActions.deletePost({ id: this.post.id }));
    console.log('delete post');
  }
}
