import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { Organization } from '../database/entities/organization.entity';
import { UserRole } from '@Simple Task Management/data';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }

  private async verifyTurnstile(token: string): Promise<boolean> {
    const formData = new URLSearchParams();
    formData.append('secret', this.configService.get<string>('CLOUDFLARE_SECRET_KEY') || '');
    formData.append('response', token);

    try {
      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async register(email: string, pass: string, orgName: string, turnstileToken: string) {
    if (!turnstileToken) throw new BadRequestException('Security token is missing');

    const isHuman = await this.verifyTurnstile(turnstileToken);
    if (!isHuman) throw new UnauthorizedException('Security check failed');

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('User already exists');

    const org = this.orgRepo.create({ name: orgName, type: 'CORPORATE' });
    await this.orgRepo.save(org);

    const hashedPassword = await bcrypt.hash(pass, 10);

    const user = this.userRepo.create({
      email,
      passwordHash: hashedPassword,
      role: UserRole.OWNER,
      organization: org
    });

    const savedUser = await this.userRepo.save(user);

    const payload = {
      email: savedUser.email,
      sub: savedUser.id,
      role: savedUser.role,
      organizationId: savedUser.organization.id
    };

    const result: Partial<User> = { ...savedUser };
    delete result.passwordHash;

    return {
      accessToken: this.jwtService.sign(payload),
      user: result
    };
  }

  async login(email: string, pass: string, turnstileToken: string) {
    if (!turnstileToken) throw new BadRequestException('Security token is missing');

    const isHuman = await this.verifyTurnstile(turnstileToken);
    if (!isHuman) throw new UnauthorizedException('Security check failed');

    const user = await this.userRepo.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(pass, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      organizationId: user.organization.id
    };

    const result: Partial<User> = { ...user };
    delete result.passwordHash;

    return {
      accessToken: this.jwtService.sign(payload),
      user: result
    };
  }

  async createDemoUser(email: string, pass: string, organizationId: string, role: UserRole) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) return existing;

    const hashedPassword = await bcrypt.hash(pass, 10);

    const user = this.userRepo.create({
      email,
      passwordHash: hashedPassword,
      role,
      organization: { id: organizationId } as Organization
    });

    return this.userRepo.save(user);
  }
}