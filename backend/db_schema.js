const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'ADMIN',
  database: 'minimarket_db',
  port: 5432
});

async function main() {
  try {
    // Get all tables
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    console.log("=== TABLES ===");
    console.log(JSON.stringify(tables.rows, null, 2));

    // Get columns for each table
    for (const t of tables.rows) {
      const cols = await pool.query(
        "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",
        [t.table_name]
      );
      console.log(`\n=== ${t.table_name} ===`);
      console.log(JSON.stringify(cols.rows, null, 2));
    }

    // Get foreign keys
    const fks = await pool.query(`
      SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    `);
    console.log("\n=== FOREIGN KEYS ===");
    console.log(JSON.stringify(fks.rows, null, 2));

    // Get sample data counts
    for (const t of tables.rows) {
      const count = await pool.query(`SELECT COUNT(*) as count FROM "${t.table_name}"`);
      console.log(`${t.table_name}: ${count.rows[0].count} rows`);
    }
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await pool.end();
  }
}

main();
