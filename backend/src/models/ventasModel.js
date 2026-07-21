const pool=require('../config/database');

const registrarVenta=async(client, idTrabajador, idTienda, total, metodoPago)=>{
    return await client.query(
        `INSERT INTO ventas (id_trabajador, fecha, total, metodo_pago, estado, id_tienda)
         VALUES ($1, NOW(), $2, $3, 'Registrada', $4) RETURNING *`,
        [idTrabajador, total, metodoPago || 'Efectivo', idTienda]
    );
};

const registrarDetalle=async(client, idVenta, idProducto, cantidad, precioUnitario)=>{
    const subtotal = cantidad * precioUnitario;
    return await client.query(
        `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [idVenta, idProducto, cantidad, precioUnitario, subtotal]
    );
};

const descontarStock=async(client, idProducto, cantidad)=>{
    return await client.query(
        `UPDATE inventario SET stock_actual=GREATEST(0, stock_actual - $1), fecha_actualizacion=NOW()
         WHERE id_producto=$2 RETURNING *`,
        [cantidad, idProducto]
    );
};

const generarBoleta=async(client, idVenta, total, impuesto)=>{
    const numRes = await client.query(`SELECT COUNT(*)+1 AS num FROM boletas`);
    const numero = `B001-${String(numRes.rows[0].num).padStart(6,'0')}`;
    return await client.query(
        `INSERT INTO boletas (id_venta, numero, total, impuesto)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [idVenta, numero, total, impuesto]
    );
};

const listarPorTienda=async(idTienda, limit=50, offset=0)=>{
    return await pool.query(
        `SELECT v.*, 
                CONCAT(u.nombre,' ',u.apellido) AS trabajador,
                b.numero AS boleta_numero
         FROM ventas v
         LEFT JOIN usuarios u ON v.id_trabajador=u.id_usuario
         LEFT JOIN boletas b ON v.id_venta=b.id_venta
         WHERE v.id_tienda=$1
         ORDER BY v.fecha DESC
         LIMIT $2 OFFSET $3`,
        [idTienda, limit, offset]
    );
};

const obtenerDetalle=async(idVenta)=>{
    return await pool.query(
        `SELECT dv.*, p.nombre AS producto_nombre, p.codigo AS producto_codigo
         FROM detalle_ventas dv
         JOIN productos p ON dv.id_producto=p.id_producto
         WHERE dv.id_venta=$1`,
        [idVenta]
    );
};

const ventasDelDia=async(idTienda)=>{
    return await pool.query(
        `SELECT v.*, CONCAT(u.nombre,' ',u.apellido) AS trabajador
         FROM ventas v
         LEFT JOIN usuarios u ON v.id_trabajador=u.id_usuario
         WHERE v.id_tienda=$1 AND v.fecha::date = CURRENT_DATE
         ORDER BY v.fecha DESC`,
        [idTienda]
    );
};

const ventasPorTrabajador=async(idTienda, idTrabajador)=>{
    return await pool.query(
        `SELECT v.*, b.numero AS boleta_numero
         FROM ventas v
         LEFT JOIN boletas b ON v.id_venta=b.id_venta
         WHERE v.id_tienda=$1 AND v.id_trabajador=$2
         ORDER BY v.fecha DESC
         LIMIT 50`,
        [idTienda, idTrabajador]
    );
};

module.exports={registrarVenta, registrarDetalle, descontarStock, generarBoleta, listarPorTienda, obtenerDetalle, ventasDelDia, ventasPorTrabajador};
