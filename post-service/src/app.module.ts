import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './post/posts.module';
import { Post } from './post/post.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'test-user',
      password: 'dawawdawd',
      database: 'test-base',
      entities: [Post],
      synchronize: true,
    }),
    PostsModule,
  ],
})
export class AppModule {}
