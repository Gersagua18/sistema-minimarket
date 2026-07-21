const dashboardModel=require('../models/dashboardModel');
const responder=require('../utils/response');

const admin=async(req,res,next)=>{
    try{
        const data=await dashboardModel.dashboardAdmin(req.params.idTienda);
        return responder.successResponse(res,200,'Dashboard admin',data);
    }catch(e){next(e);}
};

const trabajador=async(req,res,next)=>{
    try{
        const data=await dashboardModel.dashboardTrabajador(req.params.idTienda, req.usuario.id_usuario);
        return responder.successResponse(res,200,'Dashboard trabajador',data);
    }catch(e){next(e);}
};

const reporteInventario=async(req,res,next)=>{
    try{
        const data=await dashboardModel.reporteInventario(req.params.idTienda);
        return responder.successResponse(res,200,'Reporte inventario',data);
    }catch(e){next(e);}
};

const reporteVentas=async(req,res,next)=>{
    try{
        const {inicio, fin} = req.query;
        if(!inicio || !fin) return responder.errorResponse(res, 400, 'Se requieren fechas de inicio y fin');
        
        const data=await dashboardModel.reporteVentas(req.params.idTienda, inicio, fin);
        return responder.successResponse(res,200,'Reporte de ventas',data);
    }catch(e){next(e);}
};

module.exports={admin, trabajador, reporteInventario, reporteVentas};
