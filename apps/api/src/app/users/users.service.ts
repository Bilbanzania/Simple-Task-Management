import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { Organization } from '../database/entities/organization.entity';
import { AuditLog } from '../database/entities/audit-log.entity'; 
import { UserRole } from '@Simple Task Management/data';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AuditLog) 
    private auditRepo: Repository<AuditLog>,
  ) {}

  private async logAction(actorId: string, organizationId: string, action: string, details: string) {
    await this.auditRepo.insert({
      action,
      details,
      organizationId,
      actorId, 
    });
    this.logger.log(`[AUDIT] ${action}: ${details}`);
  }

  async findAllByOrg(organizationId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { organization: { id: organizationId } },
      select: ['id', 'email', 'role', 'createdAt'], 
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(email: string, pass: string, organizationId: string, role: UserRole, actorId: string): Promise<User> {
    const existing = await this.findOne(email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);

    const newUser = this.usersRepository.create({
      email,
      passwordHash: hashedPassword,
      role,
      organization: { id: organizationId } as Organization 
    });

    const savedUser = await this.usersRepository.save(newUser);

    await this.logAction(actorId, organizationId, 'CREATE_USER', `Created user account for ${email} with role ${role}`);

    return savedUser;
  }

  async delete(id: string, organizationId: string, actorId: string) {
    const userToDelete = await this.usersRepository.findOne({ where: { id, organization: { id: organizationId } } });
    
    const result = await this.usersRepository.delete({ 
      id, 
      organization: { id: organizationId } 
    });

    if (userToDelete) {
      await this.logAction(actorId, organizationId, 'DELETE_USER', `Deleted user account for ${userToDelete.email}`);
    }

    return result;
  }
}