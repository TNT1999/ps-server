import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {FilterBuilder, repository} from '@loopback/repository';
import {get, param, post, requestBody, response} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Review, ReviewRelations} from '../models';
import {ProductRepository, ReviewRepository} from '../repositories';

export class ReviewController {
  constructor(
    @repository(ReviewRepository) public reviewRepository: ReviewRepository,
    @repository(ProductRepository) public productRepository: ProductRepository,
  ) {}

  @authenticate('jwt')
  @post('review')
  @response(200, {
    description: 'Post review product',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Review,
        },
      },
    },
  })
  async postReview(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody() review: Review,
  ): Promise<Review> {
    const userId = currentUserProfile[securityId];
    review.userId = userId;
    review.reviewer.id = userId;
    const savedReview = await this.reviewRepository.create(review);
    const product = await this.productRepository.findById(review.productId);
    const reviewCount = product.reviewCount ?? 0;
    const ratingValue = product.ratingValue ?? 0;
    await this.productRepository.updateById(review.productId, {
      reviewCount: reviewCount + 1,
      ratingValue:
        (ratingValue * reviewCount + review.reviewValue) / (reviewCount + 1),
    });
    return savedReview;
  }

  @get('reviews')
  @response(200, {
    description: 'Get review product by page',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: Review,
        },
      },
    },
  })
  async getReview(
    @param.query.string('pid') pid: string,
    @param.query.number('page') page: number,
  ): Promise<(Review & ReviewRelations)[]> {
    if (page <= 0) {
      return [];
    }
    const filterBuilder = new FilterBuilder<Review>();
    const reviewPerPage = 5;
    const filter = filterBuilder
      .where({productId: pid})
      .limit(reviewPerPage)
      .offset((page - 1) * reviewPerPage)
      .order('createdAt DESC')
      .build();

    const reviews = await this.reviewRepository.find(filter);
    return reviews;
  }
}
