import { 
  Controller, Get, Post, Delete, Body, Param, UseGuards, Request, 
  ForbiddenException, BadRequestException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '@Simple Task Management/data';

interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getMyTeam(@Request() req) {
    return this.usersService.findAllByOrg(req.user.organizationId);
  }

  @Post()
  async createTeamMember(@Request() req, @Body() body: CreateUserDto) {
    const currentUser = req.user;

    if (currentUser.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only Owners can add new team members.');
    }

    return this.usersService.create(
      body.email, 
      body.password, 
      currentUser.organizationId, 
      body.role,
      currentUser.userId
    );
  }

  @Delete(':id')
  async deleteTeamMember(@Request() req, @Param('id') id: string) {
    const currentUser = req.user;

    if (currentUser.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only Owners can remove team members.');
    }

    if (currentUser.userId === id) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    return this.usersService.delete(id, currentUser.organizationId, currentUser.userId);
  }
}