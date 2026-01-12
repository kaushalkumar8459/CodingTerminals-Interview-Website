// New file: backend/src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './../users/schemas/user.schema';
import { RoleType } from '../roles/schemas/role.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));

  console.log('🌱 Starting database seeding...');

  // Check if super admin already exists
  const existingAdmin = await userModel.findOne({ email: 'admin@example.com' });
  
  if (existingAdmin) {
    console.log('✅ Super Admin already exists');
  } else {
    // Create Super Admin
    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
    const superAdmin = new userModel({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: RoleType.SUPER_ADMIN,
      status: 'active',
      emailVerified: true,
      assignedModules: []
    });
    await superAdmin.save();
    console.log('✅ Super Admin created: admin@example.com');
  }

  // Create regular admin if needed
  const existingRegularAdmin = await userModel.findOne({ email: 'editor@example.com' });
  
  if (!existingRegularAdmin) {
    const hashedPassword = await bcrypt.hash('EditorPass123!', 10);
    const regularAdmin = new userModel({
      firstName: 'Editor',
      lastName: 'Admin',
      email: 'editor@example.com',
      password: hashedPassword,
      role: RoleType.ADMIN,
      status: 'active',
      emailVerified: true,
      assignedModules: []
    });
    await regularAdmin.save();
    console.log('✅ Regular Admin created: editor@example.com');
  }

  // Create viewer if needed
  const existingViewer = await userModel.findOne({ email: 'viewer@example.com' });
  
  if (!existingViewer) {
    const hashedPassword = await bcrypt.hash('ViewerPass123!', 10);
    const viewer = new userModel({
      firstName: 'Test',
      lastName: 'Viewer',
      email: 'viewer@example.com',
      password: hashedPassword,
      role: RoleType.VIEWER,
      status: 'active',
      emailVerified: true,
      assignedModules: []
    });
    await viewer.save();
    console.log('✅ Viewer created: viewer@example.com');
  }

  console.log('✨ Database seeding completed!');
  console.log('\n📋 Demo Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔴 Super Admin:');
  console.log('   Email: admin@example.com');
  console.log('   Password: AdminPass123!');
  console.log('\n🔵 Admin:');
  console.log('   Email: editor@example.com');
  console.log('   Password: EditorPass123!');
  console.log('\n⚪ Viewer:');
  console.log('   Email: viewer@example.com');
  console.log('   Password: ViewerPass123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await app.close();
  process.exit(0);
}

bootstrap().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});