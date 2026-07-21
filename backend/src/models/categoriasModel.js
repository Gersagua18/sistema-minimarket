const pool=require('../config/database');

const listarPorTienda=async(idTienda)=>{
    return await pool.query(
        `SELECT * FROM categorias WHERE id_tienda=$1 AND estado=TRUE ORDER BY nombre`,
        [idTienda]
    );
};

const obtenerPorId=async(id)=>{
    return await pool.query(`SELECT * FROM categorias WHERE id_categoria=$1`, [id]);
};

const crear=async(nombre, descripcion, idTienda)=>{
    return await pool.query(
        `INSERT INTO categorias (nombre,descripcion,estado,id_tienda) VALUES ($1,$2,TRUE,$3) RETURNING *`,
        [nombre, descripcion, idTienda]
    );
};

module.exports={listarPorTienda, obtenerPorId, crear};
