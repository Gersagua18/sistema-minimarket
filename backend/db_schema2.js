const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost', user: 'postgres', password: 'ADMIN',
  database: 'minimarket_db', port: 5432
});

async function main() {
  try {
    const tables = ['alertas_stock','boletas','detalle_ventas','imagenes_productos',
      'movimientos_inventario','reportes_inventario','ventas','sesiones_usuario'];
    for (const t of tables) {
      const cols = await pool.query(
        "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",
        [t]
      );
      console.log(`\n=== ${t} ===`);
      console.log(JSON.stringify(cols.rows, null, 2));
    }
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await pool.end();
  }
}
main();
