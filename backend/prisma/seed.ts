import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      email: 'admin@hospital.com',
      phone: '13800000000',
      role: UserRole.admin,
      status: UserStatus.active,
    },
  });
  console.log('Created admin user:', admin.username);

  // Create departments
  const departments = [
    { name: '内科', code: 'IM', description: '内科诊疗' },
    { name: '外科', code: 'SG', description: '外科诊疗' },
    { name: '儿科', code: 'PD', description: '儿童疾病诊疗' },
    { name: '妇产科', code: 'OG', description: '妇产科诊疗' },
    { name: '急诊科', code: 'ER', description: '急诊诊疗' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }
  console.log('Created departments');

  // Create doctor user
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctorUser = await prisma.user.upsert({
    where: { username: 'doctor1' },
    update: {},
    create: {
      username: 'doctor1',
      password: doctorPassword,
      email: 'doctor1@hospital.com',
      phone: '13800000001',
      role: UserRole.doctor,
      status: UserStatus.active,
    },
  });

  // Get internal medicine department
  const imDept = await prisma.department.findUnique({
    where: { code: 'IM' },
  });

  // Create doctor profile
  if (imDept) {
    await prisma.doctor.upsert({
      where: { userId: doctorUser.id },
      update: {},
      create: {
        userId: doctorUser.id,
        departmentId: imDept.id,
        name: '张医生',
        title: '主治医师',
        specialty: '心血管疾病',
        licenseNo: 'DOC20240001',
        introduction: '从事内科临床工作10年，擅长心血管疾病诊治。',
      },
    });
    console.log('Created doctor:', doctorUser.username);
  }

  // Create nurse user
  const nursePassword = await bcrypt.hash('nurse123', 10);
  const nurse = await prisma.user.upsert({
    where: { username: 'nurse1' },
    update: {},
    create: {
      username: 'nurse1',
      password: nursePassword,
      email: 'nurse1@hospital.com',
      phone: '13800000002',
      role: UserRole.nurse,
      status: UserStatus.active,
    },
  });
  console.log('Created nurse user:', nurse.username);

  // Create receptionist user
  const receptionistPassword = await bcrypt.hash('reception123', 10);
  const receptionist = await prisma.user.upsert({
    where: { username: 'reception1' },
    update: {},
    create: {
      username: 'reception1',
      password: receptionistPassword,
      email: 'reception1@hospital.com',
      phone: '13800000003',
      role: UserRole.receptionist,
      status: UserStatus.active,
    },
  });
  console.log('Created receptionist user:', receptionist.username);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
