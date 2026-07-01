const jwt=require('jsonwebtoken');

const generarToken=(usuario)=>{
    return jwt.sign(
        {
            id: usuario.id,
            rol_id:usuario.rol_id,
            rol_nombre:usuario.rol_nombre,
            email:usuario.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn:process.env.JWT_EXPIRES_IN || '2h'
        }
    );
};

module.exports=generarToken;