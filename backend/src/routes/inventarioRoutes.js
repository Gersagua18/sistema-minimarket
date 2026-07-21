const express=require('express');
const router=express.Router({mergeParams:true});
const protegerRuta=require('../middlewares/authMiddleware');
const ctrl=require('../controllers/inventarioController');

router.put('/productos/:idProducto/restock', protegerRuta, ctrl.restock);
router.get('/alertas', protegerRuta, ctrl.alertas);

module.exports=router;
