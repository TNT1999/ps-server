import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {post, requestBody, response} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Review} from '../models';
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
    const updatedProduct = await this.productRepository.updateById(
      review.productId,
      {
        reviewCount: (product.reviewCount ?? 0) + 1,
        ratingValue:
          ((product.ratingValue ?? 0) * (product.reviewCount ?? 0) +
            review.reviewValue) /
          ((product.reviewCount ?? 0) + 1),
      },
    );
    return savedReview;
  }
}
