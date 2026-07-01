const authService=require('../services/authService');
const responder=require('../utils/response');

const registrarUsuario=async (req,res,next)=>{
    try {
        const usuario=await authService.registrarUsuario(req.body);
        return responder.successResponse(res,201,'Usuario registrado correctamente',usuario);
    } catch (error) {
        next(error);
    }
};

const login=async (req,res,next)=>{
    try {
        const {email,password,dispositivo}=req.body;

        const resultado=await authService.login({
            email,
            password,
            dispositivo,
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });
        return responder.successResponse(res,200,'Login correcto',resultado);

    } catch (error) {
        next(error);
    }
};

const logout=async (req,res,next)=>{
    try {
        const authHeader=req.headers.authorization;
        const accessToken=authHeader ? authHeader.split(' ')[1] : null;

        await authService.logout(accessToken);
        return responder.successResponse(res,200,'Sesión cerrada correctamente');

    } catch (error) {
        next(error);
    }
};

module.exports = {
    registrarUsuario,
    login,
    logout
};