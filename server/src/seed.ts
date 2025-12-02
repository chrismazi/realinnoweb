/**
 * Database Seed Script
 * Populates the database with sample data for development
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@realworks.app' },
    update: {},
    create: {
      email: 'demo@realworks.app',
      password: hashedPassword,
      name: 'Alex Demo',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      settings: {
        create: {
          darkMode: false,
          notifications: true,
          currency: 'USD',
        },
      },
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create sample transactions
  const transactions = [
    { title: 'Salary', amount: 5000, type: 'income', category: 'Salary', icon: 'salary', color: 'bg-green-500' },
    { title: 'Freelance Project', amount: 1200, type: 'income', category: 'Freelance', icon: 'freelance', color: 'bg-blue-500' },
    { title: 'Rent Payment', amount: 1500, type: 'expense', category: 'Housing', icon: 'housing', color: 'bg-teal-500' },
    { title: 'Grocery Shopping', amount: 350, type: 'expense', category: 'Food', icon: 'food', color: 'bg-orange-500' },
    { title: 'Electric Bill', amount: 120, type: 'expense', category: 'Utilities', icon: 'utilities', color: 'bg-yellow-500' },
    { title: 'Netflix', amount: 15.99, type: 'expense', category: 'Entertainment', icon: 'fun', color: 'bg-pink-500', isRecurring: true },
    { title: 'Gym Membership', amount: 50, type: 'expense', category: 'Health', icon: 'health', color: 'bg-purple-500', isRecurring: true },
    { title: 'Coffee Shop', amount: 25, type: 'expense', category: 'Food', icon: 'food', color: 'bg-orange-500' },
    { title: 'Uber Rides', amount: 45, type: 'expense', category: 'Transport', icon: 'transport', color: 'bg-indigo-500' },
    { title: 'Online Shopping', amount: 180, type: 'expense', category: 'Shopping', icon: 'shopping', color: 'bg-purple-500' },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        ...tx,
        type: tx.type as 'income' | 'expense',
        userId: user.id,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
      },
    });
  }

  console.log(`✅ Created ${transactions.length} transactions`);

  // Create savings goals
  const savingsGoals = [
    { name: 'Emergency Fund', current: 5200, target: 10000, color: '#14b8a6', icon: 'shield' },
    { name: 'Dream Vacation', current: 1400, target: 3000, color: '#f59e0b', icon: 'plane' },
    { name: 'New MacBook', current: 800, target: 2500, color: '#6366f1', icon: 'laptop' },
  ];

  for (const goal of savingsGoals) {
    await prisma.savingsGoal.create({
      data: {
        ...goal,
        userId: user.id,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      },
    });
  }

  console.log(`✅ Created ${savingsGoals.length} savings goals`);

  // Create health data
  await prisma.healthData.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      vitalityScore: 72,
      sleepQuality: 7,
      exerciseFreq: 4,
      stressLevel: 3,
      nutritionScore: 6,
    },
  });

  console.log('✅ Created health data');

  // Create mood logs
  const moodLogs = [
    { level: 4, note: 'Productive day at work' },
    { level: 3, note: 'Feeling okay' },
    { level: 5, note: 'Great workout session!' },
    { level: 4, note: 'Good sleep last night' },
    { level: 2, note: 'Stressful meeting' },
    { level: 4, note: 'Nice dinner with friends' },
    { level: 3, note: 'Regular day' },
  ];

  for (let i = 0; i < moodLogs.length; i++) {
    await prisma.moodLog.create({
      data: {
        ...moodLogs[i],
        userId: user.id,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`✅ Created ${moodLogs.length} mood logs`);

  console.log('\n🎉 Seeding completed!\n');
  console.log('Demo credentials:');
  console.log('  Email: demo@realworks.app');
  console.log('  Password: demo123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
