const express=require('express');
const cors=require('cors');

const notFound=require('./middlewares/notFound');
const errorHandler=require('./middlewares/errorHandler')
const authRoutes = require('./routes/authRoutes');

const app=express();

app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.json({
        mensaje:"API funcionando Correctamente"
    });
});
app.use('/api/auth', authRoutes);

// Nuevas rutas
const tiendasRoutes = require('./routes/tiendasRoutes');
const productosRoutes = require('./routes/productosRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const anaquelesRoutes = require('./routes/anaquelesRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const usuariosTiendaRoutes = require('./routes/usuariosTiendaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/tiendas', tiendasRoutes);
app.use('/api/tiendas/:idTienda/productos', productosRoutes);
app.use('/api/tiendas/:idTienda/categorias', categoriasRoutes);
app.use('/api/tiendas/:idTienda/anaqueles', anaquelesRoutes);
app.use('/api/tiendas/:idTienda/inventario', inventarioRoutes);
app.use('/api/tiendas/:idTienda/ventas', ventasRoutes);
app.use('/api/tiendas/:idTienda/usuarios', usuariosTiendaRoutes);
app.use('/api/tiendas/:idTienda/dashboard', dashboardRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports=app;