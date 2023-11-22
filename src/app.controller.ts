  import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
  import { AppService } from './app.service';
  import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';


  @Controller('api')
  export class AppController {
    constructor(
      private readonly appService: AppService,
      private jwtService: JwtService

      ) {}

    @Get()
    getHello(): string {
      return 'Hello from AppService!';
    }
    @Post('register')
    async register(
      @Body('name') name: string,
      @Body('email') email: string,
      @Body('password') password: string,
      ){
        const hashedPassword =  await bcrypt.hash(password,12);
        return this.appService.create({
          name,
          email,
          password: hashedPassword
        });
    }
    @Post('login')
    async login(
      @Body('email') email: string,
      @Body('password') password: string,
      @Res({passthrough: true}) response: Response
      ){
        
        const user =  await this.appService.findOne({
          select: {},
          where:  { email },
        });
        console.log(user);
        if(!user){
          throw new BadRequestException('Invalid credential');
        }

        if(!await bcrypt.compare(password, user.password)){
          throw new BadRequestException('Invalid Password');

        }
        const jwt =  await this.jwtService.signAsync({id: user.id});
        
        response.cookie('jwt', jwt, {httpOnly: true})
        // response.cookie('jwt',jwt, {httponly: true});
       
        return {
          response: 'Login Success'
        };
    }

    @Get('user')
     async user(@Req() request: Request){
      try {
        const cookie = request.cookies['jwt'];
        const data = await this.jwtService.verifyAsync(cookie);
        
        const user = await this.appService.findOne({   where:  {id: data['id']}});
        console.log(user);
       const {password, ...result} = user;
        return result;
  
      } catch (error) {
        throw new UnauthorizedException();
      }
     
     }

     @Post('logout')
      async logout(@Res({passthrough: true}) response: Response){
        response.clearCookie('jwt');
        return{
          message: "Logout Success"
        }
      }
  }
