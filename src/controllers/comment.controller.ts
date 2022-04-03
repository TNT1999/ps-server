import {repository} from '@loopback/repository';
import {post, requestBody, response} from '@loopback/rest';
import {Comment} from '../models';
import {CommentRepository} from '../repositories';

export class CommentController {
  constructor(
    @repository(CommentRepository) public commentRepository: CommentRepository,
  ) {}

  @post('comment')
  @response(200, {
    description: 'Post comment',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Comment,
        },
      },
    },
  })
  async postComment(
    @requestBody()
    requestBody: {
      productId: string;
      content: string;
      slug: string;
      userId: string;
      author: object;
      replyToCommentId: string;
    },
  ): Promise<Comment> {
    const comment = await this.commentRepository.create({
      productId: requestBody.productId,
      content: requestBody.content,
      userId: requestBody.userId,
      slug: requestBody.slug,
      author: requestBody.author,
      replyToCommentId: requestBody.replyToCommentId,
    });
    return comment;
  }

  @post('comment/reply')
  @response(200, {
    description: 'Reply comment',
    content: {
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async postReplyComment(
    @requestBody()
    requestBody: {
      productId: string;
      content: string;
      user: object;
      slug: string;
      replyToCommentId: string;
    },
  ) {
    const comment = await this.commentRepository.create({
      productId: requestBody.productId,
      content: requestBody.content,
      userId: '6230856f41651770d48038c4',
      slug: requestBody.slug,
      replyToCommentId: requestBody.replyToCommentId,
    });
    return 'Success';
  }

  // @get('comment/{slug}')
  // @response(200, {
  //   description: 'Reply comment',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'string',
  //       },
  //     },
  //   },
  // })
  // async getReplies(@param.path.string('slug') slug: string) {
  //   const comment = await this.commentRepository.create({
  //     productId: requestBody.productId,
  //     content: requestBody.content,
  //     userId: '6230856f41651770d48038c4',
  //     slug: requestBody.slug,
  //     replyToCommentId: requestBody.replyToCommentId,
  //   });
  //   return 'Success';
  // }
}
