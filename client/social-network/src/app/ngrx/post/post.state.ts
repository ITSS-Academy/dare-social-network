import { PostModel } from '../../model/post.model';
import { HttpErrorResponseModel } from '../../model/http-error-response.model';
import {PostDataModel} from "../../model/post-data.model";

export interface PostState {
  posts: PostModel[];
  postDetail: PostModel;
  minePosts: PostModel[];
  postData: PostDataModel[],

  isCreating: boolean;
  isCreateSuccess: boolean;
  createErrorMessage: HttpErrorResponseModel;

  isUpdating: boolean;
  isUpdateSuccess: boolean;
  updateErrorMessage: HttpErrorResponseModel;

  isGettingMinePost: boolean;
  isGetMinePostSuccess: boolean;
  isGetMinePostFailure: boolean;
  getErrorMessage: HttpErrorResponseModel;

  isGettingPostDetail: boolean;
  isGetPostDetailSuccess: boolean;
  getErrorMessageById: HttpErrorResponseModel;

  isGettingAllPosts: boolean;
  isGetAllPostsSuccess: boolean;
  isGetAllPostsFailure: boolean;
}
