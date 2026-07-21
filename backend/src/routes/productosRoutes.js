const express=require('express');
const router=express.Router({mergeParams:true});
const protegerRuta=require('../middlewares/authMiddleware');
const ctrl=require('../controllers/productosController');

router.get('/', ctrl.listar);                    // GET /api/tiendas/:idTienda/productos
router.get('/:id', ctrl.obtener);                // GET /api/tiendas/:idTienda/productos/:id
router.post('/', protegerRuta, ctrl.crear);      // POST /api/tiendas/:idTienda/productos
router.put('/:id', protegerRuta, ctrl.actualizar); // PUT /api/tiendas/:idTienda/productos/:id
router.delete('/:id', protegerRuta, ctrl.eliminar); // DELETE /api/tiendas/:idTienda/productos/:id
router.put('/:id/mover', protegerRuta, ctrl.mover); // PUT /api/tiendas/:idTienda/productos/:id/mover

module.exports=router;
