const express=require('express');
const router=express.Router({mergeParams:true});
const protegerRuta=require('../middlewares/authMiddleware');
const ctrl=require('../controllers/ventasController');

router.post('/', protegerRuta, ctrl.registrar);
router.get('/', protegerRuta, ctrl.listar);
router.get('/hoy', protegerRuta, ctrl.ventasHoy);
router.get('/:id', protegerRuta, ctrl.detalle);

module.exports=router;
