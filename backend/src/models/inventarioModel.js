const pool=require('../config/database');

const obtenerPorProducto=async(idProducto)=>{
    return await pool.query(
        `SELECT * FROM inventario WHERE id_producto=$1`, [idProducto]
    );
};

const restock=async(idProducto, cantidad)=>{
    return await pool.query(
        `UPDATE inventario SET stock_actual=GREATEST(0, stock_actual + $1), fecha_actualizacion=NOW()
         WHERE id_producto=$2 RETURNING *`,
        [cantidad, idProducto]
    );
};

const actualizarStockMinimo=async(idProducto, stockMinimo)=>{
    return await pool.query(
        `UPDATE inventario SET stock_minimo=$1, fecha_actualizacion=NOW() WHERE id_producto=$2 RETURNING *`,
        [stockMinimo, idProducto]
    );
};

const alertasStock=async(idTienda)=>{
    return await pool.query(
        `SELECT p.id_producto, p.nombre, p.codigo, p.precio,
                c.nombre AS categoria,
                a.codigo AS anaquel_codigo, a.nombre AS anaquel_nombre,
                i.stock_actual, i.stock_minimo,
                CASE 
                    WHEN i.stock_actual <= 0 THEN 'empty'
                    WHEN i.stock_actual < i.stock_minimo * 0.4 THEN 'critical'
                    WHEN i.stock_actual < i.stock_minimo THEN 'low'
                    ELSE 'ok'
                END AS estado_stock
         FROM productos p
         JOIN inventario i ON p.id_producto=i.id_producto
         LEFT JOIN categorias c ON p.id_categoria=c.id_categoria
         LEFT JOIN anaqueles a ON p.id_anaquel=a.id_anaquel
         WHERE p.id_tienda=$1 AND p.estado=TRUE AND i.stock_actual < i.stock_minimo
         ORDER BY i.stock_actual ASC`,
        [idTienda]
    );
};

const registrarMovimiento=async(idProducto, idUsuario, tipo, cantidad, observacion)=>{
    return await pool.query(
        `INSERT INTO movimientos_inventario (id_producto,id_usuario,tipo_movimiento,cantidad,observacion)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [idProducto, idUsuario, tipo, cantidad, observacion || null]
    );
};

module.exports={obtenerPorProducto, restock, actualizarStockMinimo, alertasStock, registrarMovimiento};
