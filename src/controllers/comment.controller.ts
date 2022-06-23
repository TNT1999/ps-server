import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {post, requestBody, response} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Comment} from '../models';
import {CommentRepository} from '../repositories';

export class CommentController {
  constructor(
    @repository(CommentRepository) public commentRepository: CommentRepository,
  ) {}

  @authenticate('jwt')
  @post('comment')
  @response(200, {
    description: 'Reply comment',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Comment,
        },
      },
    },
  })
  async postComment(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody() comment: Partial<Comment>,
  ): Promise<Comment> {
    const userId = currentUserProfile[securityId];
    const isAdmin = currentUserProfile.roles.includes('admin');
    comment.userId = userId;
    comment.isAdmin = isAdmin;
    const savedComment = await this.commentRepository.create(comment);
    return savedComment;
  }
}
