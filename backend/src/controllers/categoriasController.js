const categoriasModel=require('../models/categoriasModel');
const responder=require('../utils/response');

const listar=async(req,res,next)=>{
    try{
        const result=await categoriasModel.listarPorTienda(req.params.idTienda);
        return responder.successResponse(res,200,'Categorías obtenidas',result.rows);
    }catch(e){next(e);}
};

module.exports={listar};
