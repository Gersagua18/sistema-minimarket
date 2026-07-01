const successResponse=(res,statusCode,mensaje,data=[])=>{
    return res.status(statusCode).json({
        ok:true,
        mensaje,
        data
    })
};

const errorResponse=(res,statusCode,mensaje,data=[])=>{
    return res.status(statusCode).json({
        ok:false,
        mensaje,
        data
    })
};

module.exports={
    successResponse,
    errorResponse
}