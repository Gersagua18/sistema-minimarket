const pool=require('../config/database');

const listarPorTienda=async(idTienda)=>{
    return await pool.query(
        `SELECT tu.id, tu.id_tienda, tu.id_usuario, tu.rol_tienda, tu.activo, tu.created_at,
                u.nombre, u.apellido, u.email, u.telefono, u.avatar_url, u.ultimo_login,
                r.nombre AS rol_sistema
         FROM tienda_usuario tu
         JOIN usuarios u ON tu.id_usuario=u.id_usuario
         JOIN roles r ON u.id_rol=r.id_rol
         WHERE tu.id_tienda=$1
         ORDER BY tu.rol_tienda, u.nombre`,
        [idTienda]
    );
};

const agregar=async(idTienda, idUsuario, rolTienda)=>{
    return await pool.query(
        `INSERT INTO tienda_usuario (id_tienda, id_usuario, rol_tienda, activo)
         VALUES ($1,$2,$3,TRUE) RETURNING *`,
        [idTienda, idUsuario, rolTienda]
    );
};

const eliminar=async(idTienda, idUsuario)=>{
    return await pool.query(
        `DELETE FROM tienda_usuario WHERE id_tienda=$1 AND id_usuario=$2 RETURNING *`, [idTienda, idUsuario]
    );
};

const verificarPropietario=async(idTienda, idUsuario)=>{
    return await pool.query(
        `SELECT * FROM tienda_usuario WHERE id_tienda=$1 AND id_usuario=$2 AND rol_tienda='Propietario'`,
        [idTienda, idUsuario]
    );
};

const obtenerRelacion=async(idTienda, idUsuario)=>{
    return await pool.query(
        `SELECT tu.*, u.nombre, u.apellido, u.email, r.nombre AS rol_sistema
         FROM tienda_usuario tu
         JOIN usuarios u ON tu.id_usuario=u.id_usuario
         JOIN roles r ON u.id_rol=r.id_rol
         WHERE tu.id_tienda=$1 AND tu.id_usuario=$2`,
        [idTienda, idUsuario]
    );
};

module.exports={listarPorTienda, agregar, eliminar, verificarPropietario, obtenerRelacion};
