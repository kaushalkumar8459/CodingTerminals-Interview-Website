// Converted from seed.ts to seed.js for Node.js execution
require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./../app.module');
const { Model } = require('mongoose');
const { getModelToken } = require('@nestjs/mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./../users/schemas/user.schema');
const { AppModule: ModuleModel } = require('./../modules/schemas/module.schema');
const { RoleType } = require('../roles/schemas/role.schema');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get(getModelToken(User.name));
  const moduleModel = app.get(getModelToken('AppModule'));

  console.log('🌱 Starting database seeding...');

  // Fetch all modules
  const allModules = await moduleModel.find({}, '_id');
  const allModuleIds = allModules.map((m) => m._id);

  // Check if super admin already exists
  const existingAdmin = await userModel.findOne({ email: 'admin@example.com' });
  if (existingAdmin) {
    // Update assignedModules if not already set
    if (!existingAdmin.assignedModules || existingAdmin.assignedModules.length !== allModuleIds.length) {
      existingAdmin.assignedModules = allModuleIds;
      await existingAdmin.save();
      console.log('✅ Super Admin assigned all modules');
    } else {
      console.log('✅ Super Admin already exists with all modules');
    }
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
      assignedModules: allModuleIds
    });
    await superAdmin.save();
    console.log('✅ Super Admin created with all modules: admin@example.com');
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
