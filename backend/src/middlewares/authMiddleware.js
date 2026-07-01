const jwt=require('jsonwebtoken');

const sesionUsuarioModel=require('../models/sesionUsuarioModel');
const usuarioModel=require('../models/usuariosModel');

const {UnauthorizedError}=require('../utils/errors');

const protegerRuta=async (req,res,next)=>{
    try{
        const authHeader=req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Token no proporcionado');
        }

        const token=authHeader.split(' ')[1];
        
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        const sesionResultado=await sesionUsuarioModel.obtenerSesionActivaPorToken(token);
        if (sesionResultado.rows.length===0) {
            throw new UnauthorizedError('Sesión inválida o expirada');
        }
  
        const usuarioResultado=await usuarioModel.obtenerUsuarioPorID(decoded.id);
        
        if (usuarioResultado.rows.length===0) {
            throw new UnauthorizedError('Usuario no encontrado');
        }

        const usuario=usuarioResultado.rows[0];

        if (!usuario.activo) {
            throw new UnauthorizedError('Usuario inactivo');
        }

        await sesionUsuarioModel.actualizarActividadSesion(token);

        req.usuario=usuario;
        req.token=token;

        next();

    }catch(error){
        console.error("Error en authMiddleware:", error.message || error);
        next(new UnauthorizedError('Token inválido o expirado'));
    }
};

module.exports = protegerRuta;