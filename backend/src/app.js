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
app.use(notFound);
app.use(errorHandler);

module.exports=app;