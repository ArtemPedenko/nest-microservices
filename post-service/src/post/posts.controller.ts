import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { PostsService } from './post.service';
import { Post as PostEntity } from './post.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @Body() postData: { title: string; content: string; authorId: number },
  ): Promise<PostEntity> {
    return this.postsService.create(postData);
  }

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.postsService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PostEntity | null> {
    return this.postsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.postsService.remove(+id);
  }

  @EventPattern('user_deleted')
  handleUserDeleted(userId: number) {
    return this.postsService.removeByAuthor(userId);
  }

  @Get('author/:authorId')
  findByAuthor(@Param('authorId') authorId: string): Promise<PostEntity[]> {
    return this.postsService.findByAuthor(+authorId);
  }
}
