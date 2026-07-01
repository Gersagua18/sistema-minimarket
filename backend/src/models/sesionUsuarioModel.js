const pool=require('../config/database');

const crearSesion= async(usuario_id,access_token,refresh_token,ip_address,user_agent,dispositivo,fecha_expiracion)=>{
    return await pool.query(
        `INSERT INTO sesiones_usuario (
            usuario_id,
            access_token,
            refresh_token,
            ip_address,
            user_agent,
            dispositivo,
            fecha_expiracion,
            ultima_actividad,
            activo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, TRUE)
        RETURNING *`,
        [
            usuario_id,
            access_token,
            refresh_token,
            ip_address || null,
            user_agent || null,
            dispositivo || null,
            fecha_expiracion
        ]
    );
};

const obtenerSesionActivaPorToken= async(access_token) => {
    return await pool.query(
        `SELECT *
         FROM sesiones_usuario
         WHERE access_token = $1
           AND activo = TRUE
           AND fecha_expiracion > CURRENT_TIMESTAMP`,
        [access_token]
    );
};

const cerrarSesionPorToken = async (access_token) => {
    return await pool.query(
        `UPDATE sesiones_usuario
         SET activo = FALSE,
             cerrado_manualmente = TRUE,
             ultima_actividad = CURRENT_TIMESTAMP
         WHERE access_token = $1
         RETURNING *`,
        [access_token]
    );
};

const actualizarActividadSesion = async (access_token) => {
    return await pool.query(
        `UPDATE sesiones_usuario
         SET ultima_actividad = CURRENT_TIMESTAMP
         WHERE access_token = $1
           AND activo = TRUE`,
        [access_token]
    );
};

module.exports={
    crearSesion,
    obtenerSesionActivaPorToken,
    cerrarSesionPorToken,
    actualizarActividadSesion
}