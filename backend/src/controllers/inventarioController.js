const inventarioModel=require('../models/inventarioModel');
const responder=require('../utils/response');

const restock=async(req,res,next)=>{
    try{
        const {cantidad}=req.body;
        if(cantidad===undefined) return responder.errorResponse(res,400,'Cantidad requerida');
        const result=await inventarioModel.restock(req.params.idProducto, cantidad);
        if(result.rows.length===0) return responder.errorResponse(res,404,'Producto no encontrado en inventario');
        // Registrar movimiento
        const tipo = cantidad > 0 ? 'Entrada' : 'Salida';
        await inventarioModel.registrarMovimiento(req.params.idProducto, req.usuario.id_usuario, tipo, Math.abs(cantidad), req.body.observacion);
        return responder.successResponse(res,200,'Stock actualizado',result.rows[0]);
    }catch(e){next(e);}
};

const alertas=async(req,res,next)=>{
    try{
        const result=await inventarioModel.alertasStock(req.params.idTienda);
        return responder.successResponse(res,200,'Alertas de stock',result.rows);
    }catch(e){next(e);}
};

module.exports={restock, alertas};
