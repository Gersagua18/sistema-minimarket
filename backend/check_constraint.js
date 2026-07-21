const {Pool}=require('pg');
const p=new Pool({host:'localhost',user:'postgres',password:'ADMIN',database:'minimarket_db',port:5432});
p.query("SELECT conname, pg_get_constraintdef(c.oid) as def FROM pg_constraint c WHERE conrelid='tienda_usuario'::regclass")
.then(r=>{console.log(JSON.stringify(r.rows,null,2));p.end()})
.catch(e=>{console.error(e.message);p.end()});
