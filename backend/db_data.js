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
    // Get data from tables with actual rows
    const tables = ['roles','usuarios','tiendas','tienda_usuario','categorias','anaqueles','productos','inventario'];
    for (const t of tables) {
      const data = await pool.query(`SELECT * FROM "${t}"`);
      console.log(`\n=== ${t} (${data.rows.length} rows) ===`);
      console.log(JSON.stringify(data.rows, null, 2));
    }
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await pool.end();
  }
}

main();
