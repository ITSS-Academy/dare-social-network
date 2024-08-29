import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authReducer } from './ngrx/auth/auth.reducer';
import { AuthEffects } from './ngrx/auth/auth.effects';
import { provideHttpClient } from '@angular/common/http';
import { profileReducer } from './ngrx/profile/profile.reducer';
import { ProfileEffects } from './ngrx/profile/profile.effects';
import { HttpClientAuth } from './util/http-client-auth';
import { postReducer } from './ngrx/post/post.reducer';
import { PostEffects } from './ngrx/post/post.effects';
import { storageReducer } from './ngrx/storage/storage.reducer';
import { StorageEffects } from './ngrx/storage/storage.effects';
import { SearchReducer } from './ngrx/search/search.reducer';
import { searchEffects } from './ngrx/search/search.effects';
import { CommentEffects } from './ngrx/comment/comment.effects';
import { CommentReducer } from './ngrx/comment/comment.reducer';
import { LikeReducer } from './ngrx/like/like.reducers';
import { LikeEffects } from './ngrx/like/like.effects';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideStore(),
    provideEffects(
      AuthEffects,
      ProfileEffects,
      PostEffects,
      StorageEffects,
      searchEffects,
      CommentEffects,
      LikeEffects,
    ),
    provideState({ name: 'auth', reducer: authReducer }),
    provideState({ name: 'profile', reducer: profileReducer }),
    provideState({ name: 'post', reducer: postReducer }),
    provideState({ name: 'storage', reducer: storageReducer }),
    provideState({ name: 'search', reducer: SearchReducer }),
    provideState({ name: 'comment', reducer: CommentReducer }),
    provideState({ name: 'like', reducer: LikeReducer }),
    provideHttpClient(),
    provideAnimationsAsync(),
    HttpClientAuth,
  ],
};
