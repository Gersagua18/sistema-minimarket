const pool=require('../config/database');

const listarPorTienda=async(idTienda, search='', categoria='')=>{
    let q=`SELECT p.id_producto, p.codigo, p.nombre, p.descripcion, p.precio, p.estado,
                  p.id_categoria, c.nombre AS categoria,
                  p.id_anaquel, a.codigo AS anaquel_codigo, a.nombre AS anaquel_nombre,
                  COALESCE(i.stock_actual,0) AS stock_actual,
                  COALESCE(i.stock_minimo,0) AS stock_minimo,
                  p.id_tienda, p.fecha_creacion, p.updated_at
           FROM productos p
           LEFT JOIN categorias c ON p.id_categoria=c.id_categoria
           LEFT JOIN anaqueles a ON p.id_anaquel=a.id_anaquel
           LEFT JOIN inventario i ON p.id_producto=i.id_producto
           WHERE p.id_tienda=$1 AND p.estado=TRUE`;
    const params=[idTienda];
    let idx=2;
    if(search){
        q+=` AND (p.nombre ILIKE $${idx} OR p.codigo ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
    }
    if(categoria){
        q+=` AND c.nombre=$${idx}`;
        params.push(categoria);
        idx++;
    }
    q+=` ORDER BY p.nombre`;
    return await pool.query(q, params);
};

const obtenerPorId=async(idProducto)=>{
    return await pool.query(
        `SELECT p.*, c.nombre AS categoria, a.codigo AS anaquel_codigo, a.nombre AS anaquel_nombre,
                COALESCE(i.stock_actual,0) AS stock_actual, COALESCE(i.stock_minimo,0) AS stock_minimo
         FROM productos p
         LEFT JOIN categorias c ON p.id_categoria=c.id_categoria
         LEFT JOIN anaqueles a ON p.id_anaquel=a.id_anaquel
         LEFT JOIN inventario i ON p.id_producto=i.id_producto
         WHERE p.id_producto=$1`,
        [idProducto]
    );
};

const crear=async(data)=>{
    const {nombre,descripcion,codigo,precio,id_categoria,id_anaquel,id_tienda,stock_actual,stock_minimo}=data;
    const r=await pool.query(
        `INSERT INTO productos (nombre,descripcion,codigo,precio,id_categoria,id_anaquel,estado,id_tienda)
         VALUES ($1,$2,$3,$4,$5,$6,TRUE,$7) RETURNING *`,
        [nombre,descripcion,codigo,precio,id_categoria,id_anaquel,id_tienda]
    );
    const idProd=r.rows[0].id_producto;
    await pool.query(
        `INSERT INTO inventario (id_producto,stock_actual,stock_minimo) VALUES ($1,$2,$3)`,
        [idProd, stock_actual||0, stock_minimo||0]
    );
    return r;
};

const actualizar=async(idProducto, data)=>{
    const {nombre,descripcion,codigo,precio,id_categoria,id_anaquel}=data;
    return await pool.query(
        `UPDATE productos SET nombre=$1,descripcion=$2,codigo=$3,precio=$4,id_categoria=$5,id_anaquel=$6,updated_at=NOW()
         WHERE id_producto=$7 RETURNING *`,
        [nombre,descripcion,codigo,precio,id_categoria,id_anaquel,idProducto]
    );
};

const eliminar=async(idProducto)=>{
    return await pool.query(
        `UPDATE productos SET estado=FALSE, updated_at=NOW() WHERE id_producto=$1 RETURNING *`,
        [idProducto]
    );
};

const moverAnaquel=async(idProducto, idAnaquel)=>{
    return await pool.query(
        `UPDATE productos SET id_anaquel=$1, updated_at=NOW() WHERE id_producto=$2 RETURNING *`,
        [idAnaquel, idProducto]
    );
};

module.exports={listarPorTienda, obtenerPorId, crear, actualizar, eliminar, moverAnaquel};
