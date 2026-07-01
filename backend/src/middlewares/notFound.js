const {NotFoundError}=require('../utils/errors');

const notFound=(req, res, next) => {
    next(new NotFoundError('Ruta no encontrada'));
};

module.exports=notFound;