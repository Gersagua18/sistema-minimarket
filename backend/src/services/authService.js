const bcrypt=require('bcrypt');
const crypto=require('crypto');

const usuarioModel=require('../models/usuariosModel');
const sesionUsuarioModel=require('../models/sesionUsuarioModel');
const generarToken=require('../utils/generarToken');

const{
    MissingFieldError,
    InvalidValueError,
    ConflictError,
    UnauthorizedError,
    NotFoundError
} = require('../utils/errors');

const registrarUsuario=async({
    nombre,
    apellido,
    email,
    password,
    telefono,
    dni,
    rol_nombre='Cliente'
})=>{
    if(!nombre) throw new MissingFieldError('nombre');
    if(!apellido) throw new MissingFieldError('apellido');
    if(!email) throw new MissingFieldError('email');
    if(!password) throw new MissingFieldError('password');
    
    if (!email.includes('@')) {
        throw new InvalidValueError('email', 'debe tener un formato válido');
    }

    if (password.length<6) {
        throw new InvalidValueError('password', 'debe tener mínimo 6 caracteres');
    }
    
    const usuarioExiste=await usuarioModel.obtenerUsuarioPorEmail(email);
    if (usuarioExiste.rows.length>0) {
        throw new ConflictError('El email ya está registrado');
    }
    
    const rolResultado=await usuarioModel.ObtenerRolPorNombre(rol_nombre);
    if (rolResultado.rows.length===0) {
        throw new NotFoundError(`El rol '${rol_nombre}' no existe o está inactivo`);
    }

    const rol=rolResultado.rows[0];
    
    const password_hash=await bcrypt.hash(password,10);
    const resultado=await usuarioModel.crearUsuario(
        rol.id_rol,
        nombre,
        apellido,
        email,
        password_hash,
        dni,
        telefono,
    );
    return resultado.rows[0]
};

const login=async({email,password,ip_address,user_agent,dispositivo }) => {
    if (!email) throw new MissingFieldError('email');
    if (!password) throw new MissingFieldError('password');

    const resultado=await usuarioModel.obtenerUsuarioPorEmail(email);

    if(resultado.rows.length===0){
        throw new UnauthorizedError('Credenciales incorrectas');
    }

    const usuario=resultado.rows[0];

    if(!usuario.estado){
        throw new UnauthorizedError('Usuario inactivo');
    }

    const passwordCorrecta=await bcrypt.compare(
        password,
        usuario.password_hash
    );

    if(!passwordCorrecta){
        throw new UnauthorizedError('Credenciales incorrectas');
    }

    const accessToken=generarToken(usuario);
    const refreshToken=crypto.randomBytes(64).toString('hex');

    const horasExpiracion=Number(process.env.JWT_EXPIRES_HOURS) || 2;
    const fechaExpiracion=new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + horasExpiracion);

    await sesionUsuarioModel.crearSesion(
        usuario.id_usuario,
        accessToken,
        refreshToken,
        ip_address,
        user_agent,
        dispositivo,
        fechaExpiracion
    );

    await usuarioModel.actualizarUltimoLogin(usuario.id);

    return {
        usuario: {
            id: usuario.id,
            rol_id: usuario.rol_id,
            rol_nombre: usuario.rol_nombre,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            avatar_url: usuario.avatar_url,
            activo: usuario.activo
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '2h'
    };
};

const logout=async (accessToken) => {
    if(!accessToken) {
        throw new UnauthorizedError('Token no proporcionado');
    }
    const resultado=await sesionUsuarioModel.cerrarSesionPorToken(accessToken);

    if(resultado.rows.length===0) {
        throw new UnauthorizedError('Sesión no encontrada o ya cerrada');
    }

    return resultado.rows[0];
};

module.exports = {
    registrarUsuario,
    login,
    logout
};