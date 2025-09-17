// Elementos del DOM
const tbody = document.querySelector("#inventoryTable tbody");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");

const form = document.getElementById("productForm");
const productIdInput = document.getElementById("productId");
const nombreInput = document.getElementById("nombre");
const categoriaInput = document.getElementById("categoria");
const cantidadInput = document.getElementById("cantidad");
const estadoInput = document.getElementById("estado");
const cancelBtn = document.getElementById("cancelEdit");

let productos = [];

// Cargar productos desde el backend
async function loadData(){
  try{
    const res = await fetch("/productos");
    productos = await res.json();
    renderTable(productos);
    renderChart(productos);
  }catch(err){
    tbody.innerHTML = "<tr><td colspan='5'>❌ Error al cargar datos</td></tr>";
  }
}

// Renderizar tabla
function renderTable(data){
  const search = searchInput.value.toLowerCase();
  const category = filterCategory.value;
  tbody.innerHTML = "";

  data.filter(p => p.nombre.toLowerCase().includes(search) &&
                   (category===""||p.categoria===category))
      .forEach(p=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${p.cantidad}</td>
      <td><span class="${p.estado==="Stock OK"?"alert-ok":"alert-low"}">${p.estado}</span></td>
      <td>
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
      </td>
    `;
    // Eventos de los botones
    tr.querySelector(".edit-btn").addEventListener("click", ()=> editProductForm(p));
    tr.querySelector(".delete-btn").addEventListener("click", ()=> deleteProduct(p.id));
    tbody.appendChild(tr);
  });
}

// Función para eliminar producto
async function deleteProduct(id){
  await fetch(`/productos/${id}`,{method:"DELETE"});
  loadData();
}

// Función para cargar producto en el formulario (editar)
function editProductForm(p){
  productIdInput.value = p.id;
  nombreInput.value = p.nombre;
  categoriaInput.value = p.categoria;
  cantidadInput.value = p.cantidad;
  estadoInput.value = p.estado;
}

// Cancelar edición
cancelBtn.addEventListener("click",()=>{
  form.reset();
  productIdInput.value = "";
});

// Agregar o editar producto
async function addOrEditProduct(e){
  e.preventDefault();
  const id = productIdInput.value;
  const body = {
    nombre: nombreInput.value,
    categoria: categoriaInput.value,
    cantidad: parseInt(cantidadInput.value),
    estado: estadoInput.value
  };

  if(id){ // Editar
    await fetch(`/productos/${id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
  } else { // Agregar
    await fetch("/productos",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
  }

  form.reset();
  productIdInput.value = "";
  loadData();
}

form.addEventListener("submit", addOrEditProduct);

// Eventos de búsqueda y filtro
searchInput.addEventListener("input",()=>renderTable(productos));
filterCategory.addEventListener("change",()=>renderTable(productos));

// Renderizar gráfica de stock por categoría
function renderChart(data){
  const ctx = document.getElementById("chartStock").getContext("2d");
  const catMap = {};
  data.forEach(p=>{
    if(!catMap[p.categoria]) catMap[p.categoria]=0;
    catMap[p.categoria]+=p.cantidad;
  });

  // Si ya existe una gráfica, destruirla
  if(window.stockChart) window.stockChart.destroy();

  window.stockChart = new Chart(ctx,{
    type:"bar",
    data:{
      labels:Object.keys(catMap),
      datasets:[{
        label:"Cantidad total por categoría",
        data:Object.values(catMap),
        backgroundColor:"#00d9ff"
      }]
    },
    options:{plugins:{legend:{display:false}}}
  });
}

// Inicializar carga de datos
loadData();
