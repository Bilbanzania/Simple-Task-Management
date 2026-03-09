import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UserRole } from '@Simple Task Management/data';
import { JwtAuthGuard } from './jwt-auth.guard';

interface RegisterDto {
  email: string;
  password: string;
  organizationName: string;
  turnstileToken: string;
}

interface LoginDto {
  email: string;
  password: string;
  turnstileToken: string;
}

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    organizationId: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password, body.organizationName, body.turnstileToken);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password, body.turnstileToken);
  }
  
  @Post('seed-demo')
  @UseGuards(JwtAuthGuard)
  async seedDemoUsers(@Request() req: AuthenticatedRequest) {
    const { organizationId } = req.user;

    await this.authService.createDemoUser(
      'admin@demo.com',
      'password123',
      organizationId,
      UserRole.ADMIN
    );

    await this.authService.createDemoUser(
      'viewer@demo.com',
      'password123',
      organizationId,
      UserRole.VIEWER
    );

    return {
      message: 'Demo users created successfully!',
      accounts: [
        { email: 'admin@demo.com', role: 'ADMIN' },
        { email: 'viewer@demo.com', role: 'VIEWER' },
      ],
    };
  }
}