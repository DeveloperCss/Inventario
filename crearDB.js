const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("inventario.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    estado TEXT NOT NULL
  )`);

  const productos = [];

  // Generar 100 repuestos automáticos
  const categorias = ["Motor", "Frenos", "Suspensión", "Eléctrico", "Refrigeración", "Carrocería", "Iluminación", "Transmisión", "Ruedas"];
  for(let i=1;i<=100;i++){
    const cat = categorias[Math.floor(Math.random()*categorias.length)];
    const nombre = `${cat} repuesto #${i}`;
    const cantidad = Math.floor(Math.random()*50)+1;
    const estado = cantidad < 10 ? "Bajo stock" : "Stock OK";
    productos.push([nombre,cat,cantidad,estado]);
  }

  const stmt = db.prepare("INSERT INTO productos (nombre,categoria,cantidad,estado) VALUES (?,?,?,?)");
  for(const p of productos){
    stmt.run(p);
  }
  stmt.finalize();
  console.log("✅ Base de datos inventario.db creada y cargada con 100 repuestos.");
});

db.close();
