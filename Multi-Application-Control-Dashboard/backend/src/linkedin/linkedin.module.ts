import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LinkedInService } from './linkedin.service';
import { LinkedInController } from './linkedin.controller';
import { LinkedInPost, LinkedInPostSchema } from './schemas/linkedin-post.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: LinkedInPost.name, schema: LinkedInPostSchema }])],
  providers: [LinkedInService],
  controllers: [LinkedInController],
  exports: [LinkedInService],
})
export class LinkedInModule {}
