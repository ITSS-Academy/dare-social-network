import { Injectable } from '@angular/core';
import { HttpClientAuth } from '../../util/http-client-auth';
import { LikeModel } from '../../model/like.model';

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  constructor(private httpClient: HttpClientAuth) {}

  createLike(like: LikeModel) {
    console.log(like);
    return this.httpClient.post('like', like);
  }

  getLikes(postId: string) {
    console.log(postId);
    return this.httpClient.get(`like/${postId}`);
  }

  deleteLike(postId: string) {
    return this.httpClient.delete(`like/${postId}`);
  }

  getLikeCount(postId: string) {
    return this.httpClient.get(`like/count/${postId}`);
  }
}
