const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = new Pool({
  host: 'localhost', user: 'postgres', password: 'ADMIN',
  database: 'minimarket_db', port: 5432
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── 1. Más anaqueles (ya existen A-01, A-02, A-03 con ids 1,2,3) ──
    const anaquelesNuevos = [
      ['A-04', 'Anaquel Snacks',    'Pasillo 4', 'Anaquel destinado a snacks y golosinas', 1],
      ['B-01', 'Anaquel Bebidas 2', 'Pasillo 1', 'Segundo anaquel de bebidas',             1],
      ['B-02', 'Anaquel Abarrotes 2','Pasillo 2', 'Segundo anaquel de abarrotes',           1],
      ['C-01', 'Anaquel Limpieza 2','Pasillo 3', 'Segundo anaquel de limpieza',            1],
    ];
    const anaquelIds = {};
    // Guardar los IDs existentes
    anaquelIds['A-01'] = 1; anaquelIds['A-02'] = 2; anaquelIds['A-03'] = 3;
    
    for (const a of anaquelesNuevos) {
      const r = await client.query(
        `INSERT INTO anaqueles (codigo, nombre, ubicacion, descripcion, estado, id_tienda)
         VALUES ($1,$2,$3,$4,TRUE,$5) RETURNING id_anaquel`,
        a
      );
      anaquelIds[a[0]] = r.rows[0].id_anaquel;
    }
    console.log('Anaqueles insertados:', anaquelIds);

    // ── 2. Más productos + inventario ──
    // Ya existen 4 productos (ids 1-4). Agregar 24 más para llegar a 28
    const productos = [
      // [nombre, descripcion, codigo, precio, id_categoria, codigo_anaquel, stock, stock_minimo]
      // Limpieza (cat 3) → A-03 y C-01
      ['Detergente Tal Tal 1kg', 'Detergente en polvo 1kg', 'PROD-005', 12.50, 3, 'A-03', 24, 8],
      ['Lejía Clorox 1L',        'Lejía concentrada 1L',    'PROD-006',  7.90, 3, 'A-03',  4, 6],
      ['Jabón Bolívar x3',       'Pack 3 jabones bolívar',  'PROD-007',  5.50, 3, 'A-03',  0, 5],
      ['Esponja Scotch Brite',   'Esponja multiusos',       'PROD-008',  3.20, 3, 'A-03', 18, 6],
      ['Papel Higiénico Elite x4','Pack 4 rollos elite',    'PROD-009',  9.90, 3, 'C-01',  2, 10],
      ['Suavitel 1L',            'Suavizante de ropa 1L',   'PROD-010', 14.90, 3, 'C-01', 11, 5],
      ['Lavavajilla Sapolio',    'Lavavajilla 500g',        'PROD-011',  6.50, 3, 'C-01',  9, 5],
      ['Limpiavidrios Vistony',  'Limpiavidrios spray',     'PROD-012',  8.00, 3, 'C-01', 15, 4],
      // Abarrotes (cat 2) → A-02 y B-02
      ['Arroz Costeño 5kg',     'Bolsa de arroz 5kg',       'PROD-013', 28.00, 2, 'A-02', 32, 10],
      ['Azúcar Rubia 1kg',      'Bolsa de azúcar rubia',    'PROD-014',  4.80, 2, 'A-02',  5, 12],
      ['Aceite Primor 1L',      'Aceite vegetal 1L',        'PROD-015', 11.90, 2, 'A-02', 22, 8],
      ['Fideos Don Vittorio',   'Fideos spaghetti 500g',    'PROD-016',  3.90, 2, 'A-02',  1, 10],
      ['Sal Marina 1kg',        'Sal de mesa 1kg',          'PROD-017',  2.50, 2, 'B-02', 40, 8],
      ['Atún Florida',          'Lata de atún en aceite',   'PROD-018',  5.90, 2, 'B-02', 14, 6],
      ['Leche Gloria 400g',     'Leche evaporada 400g',     'PROD-019',  4.20, 2, 'B-02',  0, 12],
      ['Café Altomayo 200g',    'Café instantáneo 200g',    'PROD-020', 16.50, 2, 'B-02',  7, 4],
      // Bebidas (cat 1) → A-01 y B-01
      ['Coca Cola 1.5L',        'Gaseosa coca cola 1.5L',   'PROD-021',  7.50, 1, 'A-01', 28, 12],
      ['Inca Kola 1.5L',        'Gaseosa inca kola 1.5L',   'PROD-022',  7.50, 1, 'A-01',  9, 12],
      ['Cerveza Pilsen 6 pack', 'Pack 6 cervezas pilsen',   'PROD-023', 32.00, 1, 'B-01',  3, 6],
      ['Frugos Durazno 1L',     'Jugo de durazno 1L',       'PROD-024',  5.50, 1, 'B-01', 12, 6],
      ['Red Bull Lata',         'Bebida energizante lata',  'PROD-025',  8.90, 1, 'B-01',  0, 6],
      ['Gatorade 500ml',        'Bebida isotónica 500ml',   'PROD-026',  4.50, 1, 'B-01', 19, 6],
      ['Sporade Tropical',      'Bebida rehidratante',      'PROD-027',  4.00, 1, 'A-01',  6, 6],
      // Snacks (cat 4) → A-04
      ['Chocolate Sublime',     'Barra de chocolate',       'PROD-028',  3.50, 4, 'A-04',  8, 12],
      ['Lays Clásicas',         'Papas fritas clásicas',    'PROD-029',  4.90, 4, 'A-04', 21, 8],
      ['Doritos Nacho',         'Tortillas sabor nacho',    'PROD-030',  4.90, 4, 'A-04',  2, 8],
    ];

    for (const p of productos) {
      const [nombre, desc, codigo, precio, id_cat, cod_anaquel, stock, stock_min] = p;
      const id_anaquel = anaquelIds[cod_anaquel];
      const r = await client.query(
        `INSERT INTO productos (nombre, descripcion, codigo, precio, id_categoria, id_anaquel, estado, id_tienda)
         VALUES ($1,$2,$3,$4,$5,$6,TRUE,1) RETURNING id_producto`,
        [nombre, desc, codigo, precio, id_cat, id_anaquel]
      );
      const idProd = r.rows[0].id_producto;
      await client.query(
        `INSERT INTO inventario (id_producto, stock_actual, stock_minimo) VALUES ($1,$2,$3)`,
        [idProd, stock, stock_min]
      );
    }
    console.log(`${productos.length} productos insertados con inventario`);

    // ── 3. Usuarios de tienda (trabajadores) ──
    // Crear 2 trabajadores con bcrypt hash
    const passHash = await bcrypt.hash('trabajador123', 10);
    
    const trab1 = await client.query(
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, telefono, activo)
       VALUES (2, 'Marco', 'Salas', 'marco@minimarket.com', $1, '999888777', TRUE) RETURNING id_usuario`,
      [passHash]
    );
    const trab2 = await client.query(
      `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, telefono, activo)
       VALUES (2, 'Ana', 'Torres', 'ana@minimarket.com', $1, '999888666', TRUE) RETURNING id_usuario`,
      [passHash]
    );
    
    // Asignar a tienda 1 (rol_tienda: Propietario|Administrador|Cajero|Reposicion)
    await client.query(
      `INSERT INTO tienda_usuario (id_tienda, id_usuario, rol_tienda, activo) VALUES (1, $1, 'Cajero', TRUE)`,
      [trab1.rows[0].id_usuario]
    );
    await client.query(
      `INSERT INTO tienda_usuario (id_tienda, id_usuario, rol_tienda, activo) VALUES (1, $1, 'Reposicion', TRUE)`,
      [trab2.rows[0].id_usuario]
    );
    console.log('Trabajadores creados:', trab1.rows[0].id_usuario, trab2.rows[0].id_usuario);

    // ── 4. Ventas de ejemplo (7 días) ──
    // Obtener todos los productos de la tienda
    const allProds = await client.query(`SELECT id_producto, precio FROM productos WHERE id_tienda=1`);
    const prodList = allProds.rows;
    const trabajadores = [1, trab1.rows[0].id_usuario, trab2.rows[0].id_usuario];
    
    const now = Date.now();
    const DAY = 86400000;
    let ventaCount = 0;
    
    for (let d = 6; d >= 0; d--) {
      const numVentas = 4 + Math.floor(Math.random() * 6); // 4-9 ventas por día
      for (let i = 0; i < numVentas; i++) {
        const fecha = new Date(now - d * DAY - Math.random() * DAY);
        const idTrabajador = trabajadores[Math.floor(Math.random() * trabajadores.length)];
        
        // 1-3 productos aleatorios
        const shuffled = [...prodList].sort(() => Math.random() - 0.5);
        const items = shuffled.slice(0, 1 + Math.floor(Math.random() * 3));
        
        let subtotalVenta = 0;
        const detalles = items.map(p => {
          const qty = 1 + Math.floor(Math.random() * 4);
          const sub = Number(p.precio) * qty;
          subtotalVenta += sub;
          return { id_producto: p.id_producto, cantidad: qty, precio_unitario: Number(p.precio), subtotal: sub };
        });
        
        const totalConIgv = subtotalVenta * 1.18;
        
        const vRes = await client.query(
          `INSERT INTO ventas (id_trabajador, fecha, total, metodo_pago, estado, id_tienda)
           VALUES ($1, $2, $3, 'Efectivo', 'Registrada', 1) RETURNING id_venta`,
          [idTrabajador, fecha, totalConIgv.toFixed(2)]
        );
        const idVenta = vRes.rows[0].id_venta;
        
        for (const det of detalles) {
          await client.query(
            `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
             VALUES ($1,$2,$3,$4,$5)`,
            [idVenta, det.id_producto, det.cantidad, det.precio_unitario, det.subtotal]
          );
        }
        
        // Boleta
        const numBoleta = `B001-${String(ventaCount + 1).padStart(6, '0')}`;
        await client.query(
          `INSERT INTO boletas (id_venta, numero, total, impuesto)
           VALUES ($1,$2,$3,$4)`,
          [idVenta, numBoleta, totalConIgv.toFixed(2), (subtotalVenta * 0.18).toFixed(2)]
        );
        
        ventaCount++;
      }
    }
    console.log(`${ventaCount} ventas insertadas con detalles y boletas`);

    await client.query('COMMIT');
    console.log('\n✅ Seed completado exitosamente');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error:', e.message);
    console.error(e.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
