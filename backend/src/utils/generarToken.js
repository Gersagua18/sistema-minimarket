const jwt=require('jsonwebtoken');

const generarToken=(usuario)=>{
    const payload = {
        id_usuario: usuario.id_usuario,
        id_rol:usuario.id_rol,
        rol_nombre:usuario.rol_nombre,
        email:usuario.email
    };
    if (usuario.id_tienda) payload.id_tienda = usuario.id_tienda;
    if (usuario.rol_tienda) payload.rol_tienda = usuario.rol_tienda;
    if (usuario.tienda_slug) payload.tienda_slug = usuario.tienda_slug;

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn:process.env.JWT_EXPIRES_IN || '2h'
        }
    );
};

module.exports=generarToken;