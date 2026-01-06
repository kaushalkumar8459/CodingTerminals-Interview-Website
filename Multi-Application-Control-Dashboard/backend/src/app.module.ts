import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ModulesModule } from './modules/modules.module';
import { BlogModule } from './blog/blog.module';
import { LinkedInModule } from './linkedin/linkedin.module';
import { YouTubeModule } from './youtube/youtube.module';
import { StudyNotesModule } from './study-notes/study-notes.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ModulesModule,
    BlogModule,
    LinkedInModule,
    YouTubeModule,
    StudyNotesModule,
    AnalyticsModule,
    AuditLogsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
