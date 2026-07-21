const pool=require('../config/database');

const listarPorTienda=async(idTienda)=>{
    return await pool.query(
        `SELECT a.*, 
                COUNT(p.id_producto) FILTER (WHERE p.estado=TRUE) AS total_productos
         FROM anaqueles a
         LEFT JOIN productos p ON a.id_anaquel=p.id_anaquel
         WHERE a.id_tienda=$1 AND a.estado=TRUE
         GROUP BY a.id_anaquel
         ORDER BY a.codigo`,
        [idTienda]
    );
};

const obtenerPorId=async(id)=>{
    return await pool.query(`SELECT * FROM anaqueles WHERE id_anaquel=$1`, [id]);
};

const crear=async(data)=>{
    const {codigo,nombre,ubicacion,descripcion,idTienda}=data;
    return await pool.query(
        `INSERT INTO anaqueles (codigo,nombre,ubicacion,descripcion,estado,id_tienda) 
         VALUES ($1,$2,$3,$4,TRUE,$5) RETURNING *`,
        [codigo,nombre,ubicacion,descripcion,idTienda]
    );
};

const productosDeAnaquel=async(idAnaquel)=>{
    return await pool.query(
        `SELECT p.*, c.nombre AS categoria,
                COALESCE(i.stock_actual,0) AS stock_actual,
                COALESCE(i.stock_minimo,0) AS stock_minimo
         FROM productos p
         LEFT JOIN categorias c ON p.id_categoria=c.id_categoria
         LEFT JOIN inventario i ON p.id_producto=i.id_producto
         WHERE p.id_anaquel=$1 AND p.estado=TRUE
         ORDER BY p.nombre`,
        [idAnaquel]
    );
};

module.exports={listarPorTienda, obtenerPorId, crear, productosDeAnaquel};
