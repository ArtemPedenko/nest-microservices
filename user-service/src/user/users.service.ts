import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('POST_SERVICE') private postClient: ClientProxy,
  ) {}

  async create(user: User): Promise<User> {
    user.postIds = [];
    const newUser = await this.usersRepository.save(user);
    this.postClient.emit('user_created', newUser);
    return newUser;
  }

  async addPost(userId: number, postId: number): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.postIds.push(postId);
    return this.usersRepository.save(user);
  }

  async removePost(userId: number, postId: number): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.postIds = user.postIds.filter((id) => id !== postId);
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
    this.postClient.emit('user_deleted', id);
  }

  async deactivate(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async activate(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.isActive = true;
    return this.usersRepository.save(user);
  }
}
