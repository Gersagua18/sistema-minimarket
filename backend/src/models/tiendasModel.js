const pool=require('../config/database');

const listar=async()=>{
    return await pool.query(
        `SELECT t.*, 
                COUNT(DISTINCT tu.id_usuario) AS total_usuarios,
                COUNT(DISTINCT a.id_anaquel) AS total_anaqueles,
                COUNT(DISTINCT p.id_producto) FILTER (WHERE p.estado=TRUE) AS total_productos
         FROM tiendas t
         LEFT JOIN tienda_usuario tu ON t.id_tienda=tu.id_tienda AND tu.activo=TRUE
         LEFT JOIN anaqueles a ON t.id_tienda=a.id_tienda AND a.estado=TRUE
         LEFT JOIN productos p ON t.id_tienda=p.id_tienda
         WHERE t.estado=TRUE
         GROUP BY t.id_tienda
         ORDER BY t.nombre`
    );
};

const obtenerPorId=async(id)=>{
    return await pool.query(
        `SELECT t.*, 
                COUNT(DISTINCT tu.id_usuario) AS total_usuarios,
                COUNT(DISTINCT a.id_anaquel) AS total_anaqueles,
                COUNT(DISTINCT p.id_producto) FILTER (WHERE p.estado=TRUE) AS total_productos
         FROM tiendas t
         LEFT JOIN tienda_usuario tu ON t.id_tienda=tu.id_tienda AND tu.activo=TRUE
         LEFT JOIN anaqueles a ON t.id_tienda=a.id_tienda AND a.estado=TRUE
         LEFT JOIN productos p ON t.id_tienda=p.id_tienda
         WHERE t.id_tienda=$1
         GROUP BY t.id_tienda`,
        [id]
    );
};

const obtenerPorSlug=async(slug)=>{
    return await pool.query(
        `SELECT * FROM tiendas WHERE slug=$1 AND estado=TRUE`, [slug]
    );
};

const tiendasPorUsuario=async(idUsuario)=>{
    return await pool.query(
        `SELECT t.*, tu.rol_tienda,
                COUNT(DISTINCT a.id_anaquel) AS total_anaqueles,
                COUNT(DISTINCT p.id_producto) FILTER (WHERE p.estado=TRUE) AS total_productos,
                (SELECT COUNT(*) FROM tienda_usuario tu2 WHERE tu2.id_tienda=t.id_tienda AND tu2.activo=TRUE) AS total_usuarios
         FROM tiendas t
         JOIN tienda_usuario tu ON t.id_tienda=tu.id_tienda
         LEFT JOIN anaqueles a ON t.id_tienda=a.id_tienda AND a.estado=TRUE
         LEFT JOIN productos p ON t.id_tienda=p.id_tienda
         WHERE tu.id_usuario=$1 AND tu.activo=TRUE AND t.estado=TRUE
         GROUP BY t.id_tienda, tu.rol_tienda
         ORDER BY t.nombre`,
        [idUsuario]
    );
};

const crear = async (tiendaData, shelves, products, currentUserId, adminData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert Tienda
        const slug = tiendaData.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const resTienda = await client.query(
            `INSERT INTO tiendas (nombre, slug, direccion) VALUES ($1, $2, $3) RETURNING id_tienda`,
            [tiendaData.nombre, slug, tiendaData.direccion]
        );
        const idTienda = resTienda.rows[0].id_tienda;

        // 2. Link current user as PROPIETARIO
        await client.query(
            `INSERT INTO tienda_usuario (id_tienda, id_usuario, rol_tienda) VALUES ($1, $2, 'Propietario')`,
            [idTienda, currentUserId]
        );

        // 3. Create Admin User (if different from current user)
        if (adminData && adminData.email) {
            // Find if email already exists
            const existingUser = await client.query(`SELECT id_usuario FROM usuarios WHERE email=$1`, [adminData.email]);
            let adminUserId;
            if (existingUser.rows.length > 0) {
                adminUserId = existingUser.rows[0].id_usuario;
            } else {
                // Determine id_rol (Assuming 2 is Trabajador/Admin level, or fetch it)
                const rolRes = await client.query(`SELECT id_rol FROM roles WHERE nombre_rol='Trabajador' LIMIT 1`);
                const idRol = rolRes.rows.length > 0 ? rolRes.rows[0].id_rol : 2;
                
                const newUser = await client.query(
                    `INSERT INTO usuarios (id_rol, nombre, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id_usuario`,
                    [idRol, adminData.nombre, adminData.email, adminData.password_hash]
                );
                adminUserId = newUser.rows[0].id_usuario;
            }
            
            // If the admin user is not the current user, link them as ADMINISTRADOR
            if (adminUserId !== currentUserId) {
                await client.query(
                    `INSERT INTO tienda_usuario (id_tienda, id_usuario, rol_tienda) VALUES ($1, $2, 'Administrador') ON CONFLICT DO NOTHING`,
                    [idTienda, adminUserId]
                );
            }
        }

        // 4. Create Shelves
        if (shelves && shelves.length > 0) {
            for (const shelf of shelves) {
                await client.query(
                    `INSERT INTO anaqueles (id_tienda, codigo, nombre) VALUES ($1, $2, $3)`,
                    [idTienda, shelf.id, shelf.label]
                );
            }
        }

        // 5. Create Default Products
        if (products && products.length > 0) {
            // First we need to map shelf labels to newly inserted shelf IDs
            const insertedShelves = await client.query(`SELECT id_anaquel, codigo FROM anaqueles WHERE id_tienda=$1`, [idTienda]);
            const shelfMap = {};
            for (const s of insertedShelves.rows) {
                shelfMap[s.codigo] = s.id_anaquel;
            }

            // Also we need a generic category
            let defaultCat = await client.query(`SELECT id_categoria FROM categorias WHERE id_tienda=$1 LIMIT 1`, [idTienda]);
            if (defaultCat.rows.length === 0) {
                const resCat = await client.query(`INSERT INTO categorias (id_tienda, nombre) VALUES ($1, 'General') RETURNING id_categoria`, [idTienda]);
                defaultCat = { rows: [{ id_categoria: resCat.rows[0].id_categoria }] };
            }

            for (const p of products) {
                // p.shelfLabel matched 'N1', 'N2' which is now stored in codigo (shelf.id)
                // Wait, in frontend payload p.shelfLabel is 'N1' etc. That matches the shelf.id (which is codigo)!
                const targetShelfId = shelfMap[p.shelfLabel] || null;
                await client.query(
                    `INSERT INTO productos (id_tienda, id_categoria, id_anaquel, nombre, codigo, precio)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [idTienda, defaultCat.rows[0].id_categoria, targetShelfId, p.name, p.barcode || '000000', p.price || 0]
                );
            }
        }

        await client.query('COMMIT');
        return idTienda;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports={listar, obtenerPorId, obtenerPorSlug, tiendasPorUsuario, crear};
