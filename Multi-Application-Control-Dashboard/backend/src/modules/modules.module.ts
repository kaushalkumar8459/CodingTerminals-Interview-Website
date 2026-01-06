import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule as AppModuleEntity, ModuleSchema } from './schemas/module.schema';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: AppModuleEntity.name, schema: ModuleSchema }])],
  providers: [ModulesService],
  controllers: [ModulesController],
  exports: [ModulesService],
})
export class ModulesModule {}
