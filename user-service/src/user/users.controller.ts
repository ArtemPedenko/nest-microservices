import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { EventPattern } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() userData: { firstName: string; lastName: string },
  ): Promise<User> {
    const user = new User();
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.isActive = true;
    return this.usersService.create(user);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<User> {
    return this.usersService.deactivate(+id);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<User> {
    return this.usersService.activate(+id);
  }

  @EventPattern('post_created')
  handlePostCreated(data: { userId: number; postId: number }) {
    return this.usersService.addPost(data.userId, data.postId);
  }

  @EventPattern('post_deleted')
  handlePostDeleted(data: { userId: number; postId: number }) {
    return this.usersService.removePost(data.userId, data.postId);
  }
}
