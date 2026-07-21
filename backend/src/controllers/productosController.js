const productosModel=require('../models/productosModel');
const responder=require('../utils/response');

const listar=async(req,res,next)=>{
    try{
        const {idTienda}=req.params;
        const {search,categoria}=req.query;
        const result=await productosModel.listarPorTienda(idTienda, search, categoria);
        return responder.successResponse(res,200,'Productos obtenidos',result.rows);
    }catch(e){next(e);}
};

const obtener=async(req,res,next)=>{
    try{
        const result=await productosModel.obtenerPorId(req.params.id);
        if(result.rows.length===0) return responder.errorResponse(res,404,'Producto no encontrado');
        return responder.successResponse(res,200,'Producto obtenido',result.rows[0]);
    }catch(e){next(e);}
};

const crear=async(req,res,next)=>{
    try{
        const data={...req.body, id_tienda: req.params.idTienda};
        const result=await productosModel.crear(data);
        return responder.successResponse(res,201,'Producto creado',result.rows[0]);
    }catch(e){next(e);}
};

const actualizar=async(req,res,next)=>{
    try{
        const result=await productosModel.actualizar(req.params.id, req.body);
        if(result.rows.length===0) return responder.errorResponse(res,404,'Producto no encontrado');
        return responder.successResponse(res,200,'Producto actualizado',result.rows[0]);
    }catch(e){next(e);}
};

const eliminar=async(req,res,next)=>{
    try{
        const result=await productosModel.eliminar(req.params.id);
        if(result.rows.length===0) return responder.errorResponse(res,404,'Producto no encontrado');
        return responder.successResponse(res,200,'Producto eliminado',result.rows[0]);
    }catch(e){next(e);}
};

const mover=async(req,res,next)=>{
    try{
        const {id_anaquel}=req.body;
        const result=await productosModel.moverAnaquel(req.params.id, id_anaquel);
        return responder.successResponse(res,200,'Producto movido',result.rows[0]);
    }catch(e){next(e);}
};

module.exports={listar, obtener, crear, actualizar, eliminar, mover};
