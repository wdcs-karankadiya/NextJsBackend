import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { promises } from 'dns';

@Injectable()
export class AppService {
  getHello(): string {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ){

  }
  async create(data: any): Promise<User> {
    return this.userRepository.save(data);
  }
  async findOne(condition: any): Promise<User> {
    return this.userRepository.findOne(condition);
  }
}
