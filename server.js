const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./inventario.db", (err)=>{
  if(err) console.error("❌ Error BD:",err.message);
  else console.log("✅ Conectado a inventario.db");
});

// Obtener productos
app.get("/productos",(req,res)=>{
  db.all("SELECT * FROM productos",[],(err,rows)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json(rows);
  });
});

// Agregar producto
app.post("/productos",(req,res)=>{
  const {nombre,categoria,cantidad,estado} = req.body;
  db.run("INSERT INTO productos(nombre,categoria,cantidad,estado) VALUES(?,?,?,?)",
    [nombre,categoria,cantidad,estado],
    function(err){
      if(err) return res.status(500).json({error:err.message});
      res.json({id:this.lastID});
    });
});

// Editar producto
app.put("/productos/:id",(req,res)=>{
  const {id} = req.params;
  const {nombre,categoria,cantidad,estado} = req.body;
  db.run("UPDATE productos SET nombre=?,categoria=?,cantidad=?,estado=? WHERE id=?",
    [nombre,categoria,cantidad,estado,id],
    function(err){
      if(err) return res.status(500).json({error:err.message});
      res.json({updated:true});
    });
});

// Eliminar producto
app.delete("/productos/:id",(req,res)=>{
  const {id} = req.params;
  db.run("DELETE FROM productos WHERE id=?",[id],function(err){
    if(err) return res.status(500).json({error:err.message});
    res.json({deleted:true});
  });
});

app.listen(PORT,()=>console.log(`🚀 Servidor en http://localhost:${PORT}`));
