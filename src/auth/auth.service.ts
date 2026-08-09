import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

type SignInData = { userId: string; username: string };
type AuthResult = { accessToken: string };

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async login(input: LoginDto): Promise<AuthResult> {
    const user = await this.getUser(input);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private async getUser(signInData: LoginDto): Promise<SignInData | null> {
    const user = await this.usersService.findUserByUsername(
      signInData.username,
    );

    if (
      user &&
      (await this.validatePassword(signInData.password, user.passwordHash))
    ) {
      return {
        userId: user.id,
        username: user.username,
      };
    }

    return null;
  }

  private async validatePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    const isValid = await compare(password, passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }

  private async generateToken(user: SignInData): Promise<AuthResult> {
    const accessToken = await this.jwtService.signAsync({ sub: user.userId });

    return { accessToken };
  }
}
