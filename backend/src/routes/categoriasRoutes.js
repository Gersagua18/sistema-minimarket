const express=require('express');
const router=express.Router({mergeParams:true});
const ctrl=require('../controllers/categoriasController');

router.get('/', ctrl.listar);

module.exports=router;
