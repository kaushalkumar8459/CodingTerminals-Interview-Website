import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YouTubeService } from './youtube.service';
import { YouTubeController } from './youtube.controller';
import { YouTubePost, YouTubePostSchema } from './schemas/youtube-post.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: YouTubePost.name, schema: YouTubePostSchema }])],
  providers: [YouTubeService],
  controllers: [YouTubeController],
  exports: [YouTubeService],
})
export class YouTubeModule {}
