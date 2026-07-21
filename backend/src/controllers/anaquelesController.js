const anaquelesModel=require('../models/anaquelesModel');
const responder=require('../utils/response');

const listar=async(req,res,next)=>{
    try{
        const result=await anaquelesModel.listarPorTienda(req.params.idTienda);
        return responder.successResponse(res,200,'Anaqueles obtenidos',result.rows);
    }catch(e){next(e);}
};

const productos=async(req,res,next)=>{
    try{
        const result=await anaquelesModel.productosDeAnaquel(req.params.id);
        return responder.successResponse(res,200,'Productos del anaquel',result.rows);
    }catch(e){next(e);}
};

module.exports={listar, productos};
