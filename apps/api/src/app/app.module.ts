import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { User } from './database/entities/user.entity';
import { Organization } from './database/entities/organization.entity';
import { Task } from './database/entities/task.entity';
import { AuditLog } from './database/entities/audit-log.entity';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Organization, Task, AuditLog],
        synchronize: true,
        logging: false,
        ssl: { rejectUnauthorized: false },
        entityPrefix: 'tha_',
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forFeature([User, AuditLog]), 
    AuthModule,
    TasksModule,
  ],
  controllers: [
    AppController,
    UsersController
  ],
  providers: [
    AppService,
    UsersService
  ],
})
export class AppModule {}