const express=require('express');
const router=express.Router();
const protegerRuta=require('../middlewares/authMiddleware');
const ctrl=require('../controllers/tiendasController');

router.get('/', ctrl.listar);
router.post('/', protegerRuta, ctrl.crearTienda);
router.get('/mis-tiendas', protegerRuta, ctrl.misTiendas);
router.get('/:id', ctrl.obtener);
router.get('/slug/:slug', ctrl.obtenerPorSlug);

module.exports=router;
