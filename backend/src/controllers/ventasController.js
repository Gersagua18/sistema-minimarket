const pool=require('../config/database');
const ventasModel=require('../models/ventasModel');
const responder=require('../utils/response');

const registrar=async(req,res,next)=>{
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        const {items, metodo_pago}=req.body;
        if(!items || !items.length) return responder.errorResponse(res,400,'Se requieren items');

        const idTrabajador=req.usuario.id_usuario;
        const idTienda=req.params.idTienda;

        // Calcular totales
        let subtotal=0;
        for(const it of items){
            subtotal += it.cantidad * it.precio_unitario;
        }
        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        // Crear venta
        const venta=await ventasModel.registrarVenta(client, idTrabajador, idTienda, total.toFixed(2), metodo_pago);
        const idVenta=venta.rows[0].id_venta;

        // Detalles y descontar stock
        for(const it of items){
            await ventasModel.registrarDetalle(client, idVenta, it.id_producto, it.cantidad, it.precio_unitario);
            await ventasModel.descontarStock(client, it.id_producto, it.cantidad);
        }

        // Boleta
        const boleta=await ventasModel.generarBoleta(client, idVenta, total.toFixed(2), igv.toFixed(2));

        await client.query('COMMIT');
        return responder.successResponse(res,201,'Venta registrada',{
            venta: venta.rows[0],
            boleta: boleta.rows[0],
            subtotal: subtotal.toFixed(2),
            igv: igv.toFixed(2),
            total: total.toFixed(2)
        });
    }catch(e){
        await client.query('ROLLBACK');
        next(e);
    }finally{
        client.release();
    }
};

const listar=async(req,res,next)=>{
    try{
        const {limit,offset}=req.query;
        const result=await ventasModel.listarPorTienda(req.params.idTienda, limit||50, offset||0);
        return responder.successResponse(res,200,'Ventas obtenidas',result.rows);
    }catch(e){next(e);}
};

const detalle=async(req,res,next)=>{
    try{
        const result=await ventasModel.obtenerDetalle(req.params.id);
        return responder.successResponse(res,200,'Detalle de venta',result.rows);
    }catch(e){next(e);}
};

const ventasHoy=async(req,res,next)=>{
    try{
        const result=await ventasModel.ventasDelDia(req.params.idTienda);
        return responder.successResponse(res,200,'Ventas del día',result.rows);
    }catch(e){next(e);}
};

module.exports={registrar, listar, detalle, ventasHoy};
