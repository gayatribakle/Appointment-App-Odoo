const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const bcrypt = require('bcrypt');

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Admin user
  const hashedPassword = await bcrypt.hash('admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@booking.com' },
    update: {},
    create: {
      name: 'Demo Admin',
      email: 'admin@booking.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Admin user created: admin@booking.com / admin@123');

  // 2. Demo users
  const demoUsers = [
    { name: 'John Doe', email: 'john.doe@email.com', role: 'CUSTOMER', status: 'ACTIVE' },
    { name: 'Jane Smith', email: 'jane.smith@email.com', role: 'CUSTOMER', status: 'ACTIVE' },
    { name: 'Sarah Williams', email: 'sarah.w@email.com', role: 'CUSTOMER', status: 'BLOCKED' },
    { name: 'Tom Brown', email: 'tom.brown@email.com', role: 'CUSTOMER', status: 'ACTIVE' },
    { name: 'Emily Davis', email: 'emily.d@email.com', role: 'CUSTOMER', status: 'ACTIVE' },
  ];
  for (const u of demoUsers) {
    const pw = await bcrypt.hash('password123', 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: pw },
    });
  }
  console.log('✅ Demo users created');

  // 3. Demo providers
  const providers = [
    { name: 'Dr. Amanda Chen', email: 'a.chen@clinic.com', specialty: 'General Medicine', status: 'AVAILABLE', appointments: 142 },
    { name: 'Dr. Marcus Roberts', email: 'm.roberts@clinic.com', specialty: 'Cardiology', status: 'AVAILABLE', appointments: 198 },
    { name: 'Dr. Jessica Park', email: 'j.park@clinic.com', specialty: 'Pediatrics', status: 'BUSY', appointments: 167 },
    { name: 'Dr. David Kumar', email: 'd.kumar@clinic.com', specialty: 'Dermatology', status: 'AVAILABLE', appointments: 89 },
    { name: 'Dr. Sophie Martinez', email: 's.martinez@clinic.com', specialty: 'Orthopedics', status: 'OFF_DUTY', appointments: 213 },
    { name: 'Dr. James Wilson', email: 'j.wilson@clinic.com', specialty: 'Neurology', status: 'AVAILABLE', appointments: 176 },
  ];
  for (const p of providers) {
    await prisma.provider.upsert({
      where: { email: p.email },
      update: {},
      create: p,
    });
  }
  console.log('✅ Demo providers created');

  // 4. Demo appointments
  const appointments = [
    { customer: 'John Doe', provider: 'Dr. Amanda Chen', service: 'General Checkup', date: '2026-05-05', time: '10:00', duration: '30 min', status: 'CONFIRMED' },
    { customer: 'Jane Smith', provider: 'Dr. Marcus Roberts', service: 'Cardiology Consultation', date: '2026-05-05', time: '11:30', duration: '45 min', status: 'CONFIRMED' },
    { customer: 'Tom Brown', provider: 'Dr. Jessica Park', service: 'Pediatric Visit', date: '2026-05-06', time: '14:00', duration: '30 min', status: 'PENDING' },
    { customer: 'Sarah Williams', provider: 'Dr. David Kumar', service: 'Skin Consultation', date: '2026-05-07', time: '09:00', duration: '30 min', status: 'CANCELLED' },
    { customer: 'Emily Davis', provider: 'Dr. James Wilson', service: 'Neurology Checkup', date: '2026-05-08', time: '10:30', duration: '45 min', status: 'CONFIRMED' },
  ];
  for (const a of appointments) {
    await prisma.appointment.create({ data: a });
  }
  console.log('✅ Demo appointments created');

  // 5. Time slots
  const slots = [
    { name: 'Morning Session', startTime: '08:00', endTime: '12:00', maxBookings: 10, duration: 30, active: true },
    { name: 'Afternoon Session', startTime: '13:00', endTime: '17:00', maxBookings: 15, duration: 30, active: true },
    { name: 'Evening Session', startTime: '17:00', endTime: '20:00', maxBookings: 8, duration: 45, active: false },
  ];
  for (const s of slots) {
    await prisma.timeSlot.create({ data: s });
  }
  console.log('✅ Demo time slots created');

  // 6. Default system settings
  await prisma.systemSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  console.log('✅ System settings initialized');

  console.log('\n🎉 Database seeded successfully!');
  console.log('   Admin login: admin@booking.com / admin@123');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => process.exit(0));
