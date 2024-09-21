import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  async create(postData: {
    title: string;
    content: string;
    authorId: number;
  }): Promise<Post> {
    const post = await this.postsRepository.save(postData);
    this.userClient.emit('post_created', {
      userId: post.authorId,
      postId: post.id,
    });
    return post;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    posts: (Post & {
      author: { id: number; firstName: string; lastName: string };
    })[];
    _meta: {
      totalItems: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    const [posts, total] = await this.postsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await firstValueFrom(
          this.userClient.send('get_user', post.authorId),
        );
        return {
          ...post,
          author: {
            id: author.id,
            firstName: author.firstName,
            lastName: author.lastName,
          },
        };
      }),
    );

    return {
      posts: postsWithAuthors,
      _meta: {
        totalItems: total,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: number): Promise<Post | null> {
    return this.postsRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (post) {
      await this.postsRepository.remove(post);
      this.userClient.emit('post_deleted', {
        userId: post.authorId,
        postId: post.id,
      });
    }
  }

  async removeByAuthor(authorId: number): Promise<void> {
    await this.postsRepository.delete({ authorId });
  }

  async findByAuthor(authorId: number): Promise<Post[]> {
    return this.postsRepository.find({ where: { authorId } });
  }
}
