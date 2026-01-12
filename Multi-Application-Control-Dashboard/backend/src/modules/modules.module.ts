import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { AppModule, AppModuleSchema } from './schemas/module.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppModule.name, schema: AppModuleSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  providers: [ModulesService],
  controllers: [ModulesController],
  exports: [ModulesService],
})
export class ModulesModule { }