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
        telefono,
        null,
        true
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

    if(!usuario.activo){
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

    await usuarioModel.actualizarUltimoLogin(usuario.id_usuario);

    return {
        usuario: {
            id: usuario.id_usuario,
            rol_id: usuario.id_rol,
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

const loginTienda=async({slug, email, password, ip_address, user_agent, dispositivo}) => {
    if (!slug) throw new MissingFieldError('slug');
    if (!email) throw new MissingFieldError('email');
    if (!password) throw new MissingFieldError('password');

    // 1. Obtener la tienda
    const tiendasModel = require('../models/tiendasModel');
    const tiendaRes = await tiendasModel.obtenerPorSlug(slug);
    if (tiendaRes.rows.length === 0) {
        throw new NotFoundError('La tienda no existe');
    }
    const tienda = tiendaRes.rows[0];
    if (!tienda.estado) {
        throw new UnauthorizedError('La tienda se encuentra inactiva');
    }

    // Email Virtual: Si el usuario ingresó un nombre simple sin '@', es un empleado de esta tienda
    let finalEmail = email;
    if (!email.includes('@')) {
        const usernameLimpio = email.toLowerCase().replace(/[^a-z0-9]/g, '');
        finalEmail = `${usernameLimpio}@t${tienda.id_tienda}.local`;
    }


    // 2. Obtener usuario (usando finalEmail)
    const resultado = await usuarioModel.obtenerUsuarioPorEmail(finalEmail);
    if(resultado.rows.length===0){
        throw new UnauthorizedError('Credenciales incorrectas');
    }
    const usuario = resultado.rows[0];
    if(!usuario.activo){
        throw new UnauthorizedError('Usuario inactivo');
    }

    // 3. Validar password
    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
    if(!passwordCorrecta){
        throw new UnauthorizedError('Credenciales incorrectas');
    }

    // 4. Verificar que el usuario pertenece a esta tienda
    const { Pool } = require('pg');
    const pool = new Pool({
        host: 'localhost',
        user: 'postgres',
        password: 'ADMIN',
        database: 'minimarket_db',
        port: 5432
    }); // O usar db_schema pool
    
    // Mejor usar el config centralizado
    const db = require('../config/database');
    const relacionRes = await db.query(
        `SELECT rol_tienda, activo FROM tienda_usuario WHERE id_tienda=$1 AND id_usuario=$2`,
        [tienda.id_tienda, usuario.id_usuario]
    );

    if (relacionRes.rows.length === 0) {
        throw new UnauthorizedError('El usuario no tiene acceso a esta tienda');
    }
    
    const relacion = relacionRes.rows[0];
    if (!relacion.activo) {
        throw new UnauthorizedError('Tu acceso a esta tienda ha sido revocado');
    }

    // Inyectar datos de la tienda al usuario para el JWT
    usuario.id_tienda = tienda.id_tienda;
    usuario.rol_tienda = relacion.rol_tienda;
    usuario.tienda_slug = tienda.slug;

    // Generar tokens
    const accessToken = generarToken(usuario);
    const refreshToken = crypto.randomBytes(64).toString('hex');

    const horasExpiracion = Number(process.env.JWT_EXPIRES_HOURS) || 2;
    const fechaExpiracion = new Date();
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

    await usuarioModel.actualizarUltimoLogin(usuario.id_usuario);

    return {
        usuario: {
            id: usuario.id_usuario,
            rol_id: usuario.id_rol,
            rol_nombre: usuario.rol_nombre,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            avatar_url: usuario.avatar_url,
            activo: usuario.activo,
            // Datos tienda
            id_tienda: tienda.id_tienda,
            rol_tienda: relacion.rol_tienda,
            tienda_slug: tienda.slug,
            tienda_nombre: tienda.nombre
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '2h'
    };
};

module.exports = {
    registrarUsuario,
    login,
    loginTienda,
    logout
};