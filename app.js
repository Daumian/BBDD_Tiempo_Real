// Configuración de la hoja de Google
const SHEET_ID = '1X2IUvOGHRFWh_ws4pAiThTlfetQgoKTbsEqooVhsRDg';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

async function obtenerDatos() {
    try {
        const response = await fetch(url);
        
        // Verificamos si la respuesta es correcta
        if (!response.ok) throw new Error("No se pudo obtener respuesta de Google");

        const text = await response.text();
        
        // CORRECCIÓN CLAVE: Buscamos el inicio y fin del JSON dinámicamente
        const inicio = text.indexOf('{');
        const fin = text.lastIndexOf('}') + 1;
        const jsonString = text.substring(inicio, fin);
        
        const jsonData = JSON.parse(jsonString);
        const filas = jsonData.table.rows;
        
        const contenedor = document.getElementById('contenedor-objetos');
        if (!contenedor) return; // Seguridad por si el DOM no está listo
        
        contenedor.innerHTML = ''; 
            
        
        filas.forEach(fila => {
            // Validamos que existan las celdas antes de acceder a .v
            const nombre = (fila.c && fila.c[0]) ? fila.c[0].v : 'Sin nombre';
            const estadoRaw = (fila.c && fila.c[1]) ? fila.c[1].v : 'Desconocido'; 
            
            const div = document.createElement('div');
            div.className = 'fila-objeto';
            
            const claseEstado = normalizarEstado(String(estadoRaw)); 

            div.innerHTML = `
                <span class="nombre">${nombre}</span>
                <div class="estado-container">
                    <button class="btn-accion ${claseEstado}" onclick="alert('Click en ${nombre}')">
                        ${estadoRaw}
                    </button>
                </div>
            `;
            contenedor.appendChild(div);
        });



   } catch (error) {
       console.error("Error cargando la hoja:", error);
       const contenedor = document.getElementById('contenedor-objetos');
       if (contenedor) {
           contenedor.innerHTML = `<p style="color:red;">Error: ${error.message}. <br> Revisa que la hoja sea pública.</p>`;
       }
   }
}

/**
 * Convierte el texto de la hoja de cálculo en una clase CSS
 */
function normalizarEstado(texto) {
    if (!texto || typeof texto !== 'string') return 'desconocido';
    
    const t = texto.toLowerCase().trim();
    // Priorizamos "no disponible" antes que "disponible" para evitar falsos positivos
    if (t.includes('no disponible')) return 'no-disponible';
    if (t.includes('disponible')) return 'disponible';
    if (t.includes('incompleto')) return 'incompleto';
    return 'desconocido';
}

// Ejecutar al cargar la página
obtenerDatos();

// Refrescar automáticamente cada 30 segundos
setInterval(obtenerDatos, 30000);