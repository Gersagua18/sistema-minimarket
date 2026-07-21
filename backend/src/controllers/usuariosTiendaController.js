const tiendaUsuarioModel=require('../models/tiendaUsuarioModel');
const usuariosModel=require('../models/usuariosModel');
const bcrypt=require('bcrypt');
const responder=require('../utils/response');

const listar=async(req,res,next)=>{
    try{
        const result=await tiendaUsuarioModel.listarPorTienda(req.params.idTienda);
        return responder.successResponse(res,200,'Usuarios de tienda',result.rows);
    }catch(e){next(e);}
};

const agregar=async(req,res,next)=>{
    try{
        const {email, rol_tienda, admin_password}=req.body;
        if(!email || !rol_tienda) return responder.errorResponse(res,400,'Email y rol requeridos');

        // Verificar contraseña del admin
        const adminUser=await usuariosModel.obtenerUsuarioPorID(req.usuario.id_usuario);
        if(adminUser.rows.length===0) return responder.errorResponse(res,401,'No autorizado');
        const passOk=await bcrypt.compare(admin_password, adminUser.rows[0].password_hash);
        if(!passOk) return responder.errorResponse(res,401,'Contraseña de administrador incorrecta');

        // Buscar usuario por email
        const userRes=await usuariosModel.obtenerUsuarioPorEmail(email);
        if(userRes.rows.length===0) return responder.errorResponse(res,404,'Usuario no encontrado. Debe registrarse primero.');

        const idUsuario=userRes.rows[0].id_usuario;
        const result=await tiendaUsuarioModel.agregar(req.params.idTienda, idUsuario, rol_tienda);
        return responder.successResponse(res,201,'Usuario agregado a la tienda',result.rows[0]);
    }catch(e){
        if(e.code==='23505') return responder.errorResponse(res,409,'Este usuario ya pertenece a la tienda');
        next(e);
    }
};

const eliminar=async(req,res,next)=>{
    try{
        const {admin_password}=req.body;
        // Verificar contraseña del admin
        const adminUser=await usuariosModel.obtenerUsuarioPorID(req.usuario.id_usuario);
        const passOk=await bcrypt.compare(admin_password, adminUser.rows[0].password_hash);
        if(!passOk) return responder.errorResponse(res,401,'Contraseña de administrador incorrecta');

        const result=await tiendaUsuarioModel.eliminar(req.params.idTienda, req.params.id);
        if(result.rows.length===0) return responder.errorResponse(res,404,'Relación no encontrada');
        return responder.successResponse(res,200,'Usuario eliminado de la tienda',result.rows[0]);
    }catch(e){next(e);}
};

const crearEmpleado = async (req, res, next) => {
    try {
        const { username, password, rol_tienda, admin_password } = req.body;
        if (!username || !password || !rol_tienda) {
            return responder.errorResponse(res, 400, 'Faltan datos (username, password, rol_tienda)');
        }

        // Verificar contraseña del admin
        const adminUser = await usuariosModel.obtenerUsuarioPorID(req.usuario.id_usuario);
        if (adminUser.rows.length === 0) return responder.errorResponse(res, 401, 'No autorizado');
        const passOk = await bcrypt.compare(admin_password, adminUser.rows[0].password_hash);
        if (!passOk) return responder.errorResponse(res, 401, 'Contraseña de administrador incorrecta');

        const emailVirtual = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@t${req.params.idTienda}.local`;

        // Obtener rol_id de Trabajador
        const rolRes = await usuariosModel.ObtenerRolPorNombre('Trabajador');
        const idRol = rolRes.rows.length > 0 ? rolRes.rows[0].id_rol : 2;

        const password_hash = await bcrypt.hash(password, 10);

        const db = require('../config/database');
        await db.query('BEGIN');

        let newUserId;
        try {
            const userCheck = await db.query('SELECT id_usuario FROM usuarios WHERE email = $1', [emailVirtual]);
            
            if (userCheck.rows.length > 0) {
                newUserId = userCheck.rows[0].id_usuario;
                
                // Actualizar la contraseña a la nueva
                await db.query('UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2', [password_hash, newUserId]);
                
                // Verificar si ya está en la tienda actualmente
                const storeCheck = await db.query('SELECT id FROM tienda_usuario WHERE id_tienda = $1 AND id_usuario = $2', [req.params.idTienda, newUserId]);
                if (storeCheck.rows.length > 0) {
                    await db.query('ROLLBACK');
                    return responder.errorResponse(res, 409, 'El nombre de usuario ya está asignado a esta tienda');
                }
            } else {
                const newUser = await db.query(
                    `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario`,
                    [idRol, username, '(Empleado)', emailVirtual, password_hash]
                );
                newUserId = newUser.rows[0].id_usuario;
            }

            await db.query(
                `INSERT INTO tienda_usuario (id_tienda, id_usuario, rol_tienda) VALUES ($1, $2, $3)`,
                [req.params.idTienda, newUserId, rol_tienda]
            );

            await db.query('COMMIT');
            return responder.successResponse(res, 201, 'Empleado creado exitosamente', { id_usuario: newUserId, username, rol_tienda });
        } catch (e) {
            await db.query('ROLLBACK');
            throw e;
        }
    } catch (e) {
        next(e);
    }
};

module.exports={listar, agregar, eliminar, crearEmpleado};
