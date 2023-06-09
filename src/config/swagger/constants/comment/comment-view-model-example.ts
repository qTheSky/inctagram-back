import { LikeStatus } from '../../../../modules/shared/classes/like.model';
import { CommentViewModel } from '../../../../modules/comments/api/models/view/comment.view.model';

export const commentViewModelExample: CommentViewModel = {
  id: 'string',
  content: 'string',
  commentatorInfo: { userId: 'string', userLogin: 'string' },
  createdAt: '2023-03-13T12:42:19.885Z',
  likesInfo: {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: LikeStatus.NONE,
  },
};
