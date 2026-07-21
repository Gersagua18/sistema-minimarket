const tiendasModel=require('../models/tiendasModel');
const responder=require('../utils/response');

const listar=async(req,res,next)=>{
    try{
        const result=await tiendasModel.listar();
        return responder.successResponse(res,200,'Tiendas obtenidas',result.rows);
    }catch(e){next(e);}
};

const obtener=async(req,res,next)=>{
    try{
        const result=await tiendasModel.obtenerPorId(req.params.id);
        if(result.rows.length===0) return responder.errorResponse(res,404,'Tienda no encontrada');
        return responder.successResponse(res,200,'Tienda obtenida',result.rows[0]);
    }catch(e){next(e);}
};

const misTiendas=async(req,res,next)=>{
    try{
        const result=await tiendasModel.tiendasPorUsuario(req.usuario.id_usuario);
        return responder.successResponse(res,200,'Mis tiendas',result.rows);
    }catch(e){next(e);}
};

const obtenerPorSlug=async(req,res,next)=>{
    try{
        const result=await tiendasModel.obtenerPorSlug(req.params.slug);
        if(result.rows.length===0) return responder.errorResponse(res,404,'Tienda no encontrada');
        return responder.successResponse(res,200,'Tienda obtenida',result.rows[0]);
    }catch(e){next(e);}
};

const crearTienda=async(req,res,next)=>{
    try{
        const { tiendaData, adminData, shelves, products } = req.body;
        const currentUserId = req.usuario.id_usuario;
        
        let processedAdminData = null;
        if (adminData && adminData.email && adminData.password) {
            const bcrypt = require('bcrypt');
            const password_hash = await bcrypt.hash(adminData.password, 10);
            processedAdminData = {
                nombre: adminData.nombre,
                email: adminData.email,
                password_hash
            };
        }

        const idTienda = await tiendasModel.crear(tiendaData, shelves, products, currentUserId, processedAdminData);
        
        return responder.successResponse(res,201,'Tienda creada correctamente',{ id_tienda: idTienda });
    }catch(e){next(e);}
};

module.exports={listar, obtener, misTiendas, obtenerPorSlug, crearTienda};
