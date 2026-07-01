const errorHandler=(error, req, res, next)=>{
    const statusCode=error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        error: error.errorName || error.name || 'InternalServerError',
        message: error.message || 'Error interno del servidor'
    });
};

module.exports = errorHandler;