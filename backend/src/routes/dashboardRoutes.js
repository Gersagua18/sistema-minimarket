const express=require('express');
const router=express.Router({mergeParams:true});
const protegerRuta=require('../middlewares/authMiddleware');
const ctrl=require('../controllers/dashboardController');

router.get('/admin', protegerRuta, ctrl.admin);
router.get('/trabajador', protegerRuta, ctrl.trabajador);
router.get('/reportes/inventario', protegerRuta, ctrl.reporteInventario);
router.get('/reportes/ventas', protegerRuta, ctrl.reporteVentas);

module.exports=router;
