const express=require('express');
const router=express.Router({mergeParams:true});
const protegerRuta=require('../middlewares/authMiddleware');
const ctrl=require('../controllers/usuariosTiendaController');

router.get('/', protegerRuta, ctrl.listar);
router.post('/', protegerRuta, ctrl.agregar);
router.post('/crear-empleado', protegerRuta, ctrl.crearEmpleado);
router.delete('/:id', protegerRuta, ctrl.eliminar);

module.exports=router;
