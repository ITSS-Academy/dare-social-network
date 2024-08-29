import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { filter, Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { ProfileState } from '../../../ngrx/profile/profile.state';
import { Store } from '@ngrx/store';
import { AsyncPipe, NgIf } from '@angular/common';
import * as AuthActions from '../../../ngrx/auth/auth.actions';
import * as ProfileActions from '../../../ngrx/profile/profile.actions';
import { AuthService } from '../../../service/auth/auth.service';
import { AuthState } from '../../../ngrx/auth/auth.state';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MaterialModule, AsyncPipe, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  uid = '';
  subscriptions: Subscription[] = [];

  routeSelected: number = -1;
  dataRoutes = [
    { icon: 'home', routeLink: '/home', name: 'Home' },
    { icon: 'search', routeLink: '/search', name: 'Search' },
    { icon: 'edit_square', routeLink: '/creator', name: 'Creator' },
    { icon: 'person', routeLink: `/profile/${this.uid}`, name: 'Profile' },
  ];

  navigationProfile = [
    { icon: 'person', routeLink: `/profile/${this.uid}`, name: 'Profile' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private store: Store<{
      profile: ProfileState;
      auth: AuthState;
    }>,
  ) {}

  profileMine$ = this.store.select('profile', 'mine');

  logout$ = this.store.select('auth', 'logOutSuccess');
  ngOnInit(): void {
    this.subscriptions.push(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => {
          this.updateRouteSelected((event as NavigationEnd).urlAfterRedirects);
        }),

      this.logout$.subscribe((logout) => {
        if (logout == true) {
          this.router.navigate(['/login']).then();
        }
      }),

      this.profileMine$.subscribe((mine) => {
        if (mine) {
          this.uid = mine.uid;
        }
      }),
    );
    this.updateRouteSelected(this.router.url);
  }

  navigate(index: number) {
    if (index === 3) {
      this.router.navigate([`/profile/${this.uid}`]).then(() => {
        this.routeSelected = index;
      });
      return;
    } else {
      this.router.navigate([this.dataRoutes[index].routeLink]).then(() => {
        this.routeSelected = index;
      });
    }
  }

  ngAfterViewInit(): void {
    console.log(this.router.url);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  private updateRouteSelected(url: string): void {
    if (url.includes('home')) {
      this.routeSelected = 0;
    } else if (url.includes('search')) {
      this.routeSelected = 1;
    } else if (url.includes('creator')) {
      this.routeSelected = 2;
    } else if (url.includes('profile')) {
      this.routeSelected = 3;
    } else {
      this.routeSelected = -1;
    }
  }
  logout() {
    this.authService.logout();
    this.store.dispatch(ProfileActions.clearGetState());
  }
  onResize() {}
}
