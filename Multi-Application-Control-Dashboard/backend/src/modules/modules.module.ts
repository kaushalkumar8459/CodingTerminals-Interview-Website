import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { AppModule, AppModuleSchema } from './schemas/module.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AppModule.name, schema: AppModuleSchema }])],
  providers: [ModulesService],
  controllers: [ModulesController],
  exports: [ModulesService],
})
export class ModulesModule {}
