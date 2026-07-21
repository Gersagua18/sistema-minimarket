const pool=require('../config/database');

const obtenerUsuarioPorEmail=async(email)=>{
    return await pool.query(
        `SELECT
            u.id_usuario,
            u.id_rol,
            r.nombre AS rol_nombre,
            u.nombre,
            u.apellido,
            u.telefono,
            u.email,
            u.password_hash,
            u.activo,
            u.created_at,
            u.updated_at,
            u.ultimo_login
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol=r.id_rol
        WHERE u.email=$1`,
        [email]
    );
};

const obtenerUsuarioPorID=async(id)=>{
    return await pool.query(
        `SELECT
            u.id_usuario,
            u.id_rol,
            r.nombre AS rol_nombre,
            u.nombre,
            u.apellido,
            u.telefono,
            u.email,
            u.password_hash,
            u.avatar_url,
            u.activo,
            u.ultimo_login,
            u.created_at,
            u.updated_at
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol=r.id_rol
        WHERE u.id_usuario=$1`,
        [id]
    );
}

const ObtenerRolPorNombre=async(nombreRol)=>{
    return await pool.query(
        `SELECT id_rol,nombre,descripcion,estado
        FROM roles
        WHERE nombre=$1 AND estado=TRUE`,
        [nombreRol]
    );
};

const crearUsuario=async(id_rol,nombre,apellido,email,password_hash,telefono,avatar_url,activo)=>{
    return await pool.query(
        `INSERT INTO usuarios (id_rol,nombre,apellido,email,password_hash,telefono,avatar_url,activo) 
        VALUES($1,$2,$3,$4,$5,$6,$7,TRUE)
        RETURNING
            id_rol,
            nombre,
            apellido,
            email,
            telefono,
            avatar_url,
            activo,
            created_at,
            updated_at`,
        [id_rol,nombre,apellido,email,password_hash,telefono || null,avatar_url || null]
    );
};

const actualizarUltimoLogin=async(id)=>{
    return await pool.query(
        `UPDATE usuarios
        SET ultimo_login=NOW(),
            updated_at=NOW()
        WHERE id_usuario=$1`,
        [id]
    );
};

module.exports={
    obtenerUsuarioPorEmail,
    obtenerUsuarioPorID,
    ObtenerRolPorNombre,
    crearUsuario,
    actualizarUltimoLogin
}