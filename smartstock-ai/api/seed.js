/**
 * Seed script: เติมข้อมูลผู้ใช้เริ่มต้นและสินค้าลง SQLite
 * รันครั้งแรกเมื่อฐานข้อมูลยังว่างเปล่า
 */
const { initDatabase, createTables, migrateColumns, get, run, all } = require('./db');
const bcrypt = require('bcrypt');

const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', shop_name: 'ร้านกาแฟสด' },
  { username: 'user2', password: 'user2pass', shop_name: 'ร้านขนมปังอบ' },
];

const PRODUCTS_BY_USER = {
  admin: [
    { name: 'กาแฟอาราบิก้า (1kg)', quantity: 15, daily_sales: 4.2, reorder_point: 20, price_per_unit: 450, location: 'โซน A', cost_per_unit: 270 },
    { name: 'นมสดพาสเจอร์ไรส์ (ลิตร)', quantity: 8, daily_sales: 6.5, reorder_point: 30, price_per_unit: 42, location: 'โซน B', cost_per_unit: 25 },
    { name: 'น้ำตาลทรายขาว (5kg)', quantity: 50, daily_sales: 2.0, reorder_point: 15, price_per_unit: 120, location: 'โซน A', cost_per_unit: 72 },
    { name: 'ถ้วยกาแฟกระดาษ (100ใบ)', quantity: 200, daily_sales: 25, reorder_point: 100, price_per_unit: 85, location: 'โซน C', cost_per_unit: 51 },
    { name: 'ชาเขียวมัทฉะ (500g)', quantity: 5, daily_sales: 1.8, reorder_point: 8, price_per_unit: 380, location: 'โซน A', cost_per_unit: 228 },
    { name: 'น้ำเชื่อมวานิลลา (700ml)', quantity: 12, daily_sales: 3.0, reorder_point: 10, price_per_unit: 165, location: 'โซน B', cost_per_unit: 99 },
    { name: 'ผงโกโก้premium (1kg)', quantity: 30, daily_sales: 1.5, reorder_point: 12, price_per_unit: 320, location: 'โซน A', cost_per_unit: 192 },
    { name: 'ฝาปิดแก้วพร้อมรู (100ใบ)', quantity: 150, daily_sales: 22, reorder_point: 80, price_per_unit: 65, location: 'โซน C', cost_per_unit: 39 },
    { name: 'น้ำแร่ธรรมชาติ (แพ็ค6)', quantity: 40, daily_sales: 8.0, reorder_point: 25, price_per_unit: 55, location: 'โซน B', cost_per_unit: 33 },
    { name: 'ขนมครอสซันต์เนย (ชิ้น)', quantity: 18, daily_sales: 7.5, reorder_point: 20, price_per_unit: 35, location: 'โซน B', cost_per_unit: 21 },
  ],
  user2: [
    { name: 'แป้งสาลีอเนกประสงค์ (5kg)', quantity: 25, daily_sales: 3.0, reorder_point: 10, price_per_unit: 180, location: 'โซน A', cost_per_unit: 110 },
    { name: 'เนยจืด (1kg)', quantity: 10, daily_sales: 2.5, reorder_point: 8, price_per_unit: 320, location: 'โซน B', cost_per_unit: 200 },
    { name: 'ช็อกโกแลตชิพ (500g)', quantity: 35, daily_sales: 4.0, reorder_point: 15, price_per_unit: 150, location: 'โซน A', cost_per_unit: 85 },
    { name: 'กล่องกระดาษใส่ขนม (50ใบ)', quantity: 100, daily_sales: 10, reorder_point: 40, price_per_unit: 95, location: 'โซน C', cost_per_unit: 50 },
    { name: 'ไข่ไก่ (ฟอง)', quantity: 60, daily_sales: 12, reorder_point: 30, price_per_unit: 5, location: 'โซน B', cost_per_unit: 3 },
    { name: 'น้ำตาลไอซิ่ง (1kg)', quantity: 20, daily_sales: 1.5, reorder_point: 8, price_per_unit: 55, location: 'โซน A', cost_per_unit: 33 },
    { name: 'แป้งเค้กสำเร็จรูป (1kg)', quantity: 40, daily_sales: 5.0, reorder_point: 15, price_per_unit: 90, location: 'โซน A', cost_per_unit: 55 },
    { name: 'ถุงซิปล็อคขนาดกลาง (100ใบ)', quantity: 80, daily_sales: 6.0, reorder_point: 30, price_per_unit: 45, location: 'โซน C', cost_per_unit: 25 },
  ],
};

async function seed() {
  initDatabase();
  await createTables();
  await migrateColumns();

  const userCount = await get('SELECT COUNT(*) as total FROM users');
  if (userCount.total > 0) {
    console.log('⏭️  Users already exist, skipping seed');

    // Still seed products for users who don't have any
    const users = await all('SELECT id, username FROM users');
    for (const user of users) {
      const productCount = await get('SELECT COUNT(*) as total FROM inventory WHERE user_id = ?', [user.id]);
      if (productCount.total === 0 && PRODUCTS_BY_USER[user.username]) {
        console.log(`🌱 Seeding products for ${user.username}...`);
        for (const p of PRODUCTS_BY_USER[user.username]) {
          await run(
            `INSERT INTO inventory (user_id, name, quantity, daily_sales, reorder_point, price_per_unit, location, cost_per_unit)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.id, p.name, p.quantity, p.daily_sales, p.reorder_point, p.price_per_unit, p.location, p.cost_per_unit]
          );
        }
        console.log(`✅ Seeded ${PRODUCTS_BY_USER[user.username].length} products for ${user.username}`);
      }
    }
    process.exit(0);
  }

  console.log('🌱 Creating default users and seeding products...');

  for (const userData of DEFAULT_USERS) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const result = await run(
      'INSERT INTO users (username, password_hash, shop_name) VALUES (?, ?, ?)',
      [userData.username, passwordHash, userData.shop_name]
    );
    const userId = result.id;

    console.log(`  👤 Created user: ${userData.username} (id: ${userId})`);

    const products = PRODUCTS_BY_USER[userData.username] || [];
    for (const p of products) {
      await run(
        `INSERT INTO inventory (user_id, name, quantity, daily_sales, reorder_point, price_per_unit, location, cost_per_unit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, p.name, p.quantity, p.daily_sales, p.reorder_point, p.price_per_unit, p.location, p.cost_per_unit]
      );
    }
    console.log(`  📦 Seeded ${products.length} products for ${userData.username}`);
  }

  console.log(`\n✅ Seed complete: ${DEFAULT_USERS.length} users, ${Object.values(PRODUCTS_BY_USER).flat().length} total products`);
  console.log('\n🔐 Default credentials:');
  for (const u of DEFAULT_USERS) {
    console.log(`   ${u.username} / ${u.password}  (${u.shop_name})`);
  }
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
