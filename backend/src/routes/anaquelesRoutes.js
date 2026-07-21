const express=require('express');
const router=express.Router({mergeParams:true});
const ctrl=require('../controllers/anaquelesController');

router.get('/', ctrl.listar);
router.get('/:id/productos', ctrl.productos);

module.exports=router;
