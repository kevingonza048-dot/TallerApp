// Tu lista personalizada de piezas (respetando exactamente lo que eliminaste y ordenado)
const vehicleParts = [
    "Base de Tapa Valijera",
    "Capot",
    "Chasis Delantero",
    "Chasis Trasero",
    "Defensa Trasera",
    "Deflector de Radiador de Agua",
    "Electro -Ventilador de Aire Acondicionado",
    "Electro -Ventilador de Radiador",
    "Embrague de Ventilador",
    "Espejos",
    "Faro Delantero",
    "Faro Trasero",
    "Frente Exterior",
    "Guardabarro D.D.",
    "Guardabarro D.I.",
    "Guardabarro T.D.",
    "Guardabarro T.I.",
    "Guardapolvo Int. D.D.",
    "Guardapolvo Int. D.I.",
    "Marco de Parabrisas Delantero",
    "Marco de Parabrisas T.",
    "Moldura Exterior",
    "Paleta/Ventilador de Radiador",
    "Parabrisa Delantero",
    "Parabrisa Trasero",
    "Paragolpe Delantero",
    "Paragolpe Trasero.",
    "Parante Ant. de Puerta D.D.",
    "Parante Ant. de Puerta D.I.",
    "Parante de Frente",
    "Parante Interm. de Puerta D.",
    "Parante Interm. de Puerta I.",
    "Parante Trasero",
    "Piso",
    "Piso Valijera",
    "Protector Frontal",
    "Pulido y Lustre",
    "Puerta D.D.",
    "Puerta D.I.",
    "Puerta T.D.",
    "Puerta T.I.",
    "Tapa Valijera",
    "Techo",
    "Torreta de Amortiguador Delantero",
    "Travesaño Interior",
    "Travesaño Superior",
    "Zócalo D.",
    "Zócalo I."
];

// Almacenamiento local de vehículos y avances fotográficos
let vehiclesDB = JSON.parse(localStorage.getItem('agp_vehicles')) || [
    { plate: "AABY779", model: "Toyota Allion", client: "Gabriel Fleitas", status: "Chapería" },
    { plate: "ABC-1234", model: "Toyota Hilux", client: "Carlos Gómez", status: "Chapería" }
];

let trackingDB = JSON.parse(localStorage.getItem('agp_tracking')) || [];

// Función para cambiar entre vistas
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active-view');
    });
    
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });

    if (viewName === 'home') {
        document.getElementById('view-home').classList.add('active-view');
        document.getElementById('menu-home').classList.add('active');
        renderDashboard();
    } else if (viewName === 'tracking') {
        document.getElementById('view-tracking').classList.add('active-view');
        document.getElementById('menu-tracking').classList.add('active');
        cargarSelectoresSeguimiento();
        renderAvancesList();
    } else if (viewName === 'budget') {
        document.getElementById('view-budget').classList.add('active-view');
        document.getElementById('menu-budget').classList.add('active');
    }
}

// Renderizar la grilla de selección de piezas en el formulario
function renderPartsSelector() {
    const container = document.getElementById('parts-selector');
    if (!container) return;
    
    container.innerHTML = '';
    vehicleParts.forEach((part, index) => {
        const item = document.createElement('div');
        item.className = 'part-item';
        item.innerHTML = `
            <span>${part}</span>
            <div class="part-checks">
                <label><input type="checkbox" name="part_${index}_ch" data-part="${part}" data-type="ch"> Ch</label>
                <label><input type="checkbox" name="part_${index}_p" data-part="${part}" data-type="p"> P</label>
                <label><input type="checkbox" name="part_${index}_e" data-part="${part}" data-type="e"> E</label>
            </div>
        `;
        container.appendChild(item);
    });
}

// Guardar nuevo vehículo desde el Panel Principal
function guardarNuevoVehiculo(e) {
    e.preventDefault();
    const plate = document.getElementById('plate').value.trim().toUpperCase();
    const model = document.getElementById('model').value.trim();
    const client = document.getElementById('client').value.trim();
    const status = document.getElementById('status').value;

    if (!plate || !model || !client) return;

    // Verificar si ya existe
    if(vehiclesDB.some(v => v.plate === plate)) {
        alert("⚠️ Ya existe un vehículo registrado con esta chapa.");
        return;
    }

    vehiclesDB.push({ plate, model, client, status });
    localStorage.setItem('agp_vehicles', JSON.stringify(vehiclesDB));

    document.getElementById('vehicle-form').reset();
    renderDashboard();
    alert("✅ Vehículo registrado correctamente.");
}

// Renderizar tabla y tarjetas del Panel Principal con botón de enlace único
function renderDashboard() {
    const tbody = document.getElementById('vehicle-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    let readyCount = 0;
    let processCount = 0;

    // Determinar la URL base para el enlace del cliente (funciona en GitHub Pages o local)
    const baseUrl = window.location.href.includes('github.io') 
        ? window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + 'cliente.html' 
        : 'file:///E:/TallerApp/cliente.html';

    vehiclesDB.forEach((v, idx) => {
        if (v.status === 'Listo') readyCount++;
        else processCount++;

        const linkCliente = `${baseUrl}?chapa=${v.plate}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${v.plate}</strong></td>
            <td>${v.model}</td>
            <td>${v.client}</td>
            <td><span class="badge ${v.status === 'Listo' ? 'info' : 'warning'}">${v.status}</span></td>
            <td>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <input type="text" readonly value="${linkCliente}" style="width: 160px; padding: 4px; background: #121212; border: 1px solid #444; color: #fff; font-size: 10px; border-radius: 4px;" id="table-link-${v.plate}">
                    <button onclick="copiarEnlaceTabla('${v.plate}')" style="background: #27ae60; border: none; color: #fff; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">📋 Copiar</button>
                    <button onclick="eliminarVehiculo(${idx})" style="background: #e74c3c; border: none; color: #fff; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">❌</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (document.getElementById('dash-total')) document.getElementById('dash-total').innerText = vehiclesDB.length;
    if (document.getElementById('dash-process')) document.getElementById('dash-process').innerText = processCount;
    if (document.getElementById('dash-ready')) document.getElementById('dash-ready').innerText = readyCount;
}

function copiarEnlaceTabla(plate) {
    const input = document.getElementById(`table-link-${plate}`);
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value);
    alert("📋 ¡Enlace único copiado al portapapeles! Ya puedes enviarlo por WhatsApp al cliente.");
}

function eliminarVehiculo(index) {
    if (confirm("¿Deseas eliminar este vehículo?")) {
        vehiclesDB.splice(index, 1);
        localStorage.setItem('agp_vehicles', JSON.stringify(vehiclesDB));
        renderDashboard();
    }
}

// Cargar selectores de seguimiento
function cargarSelectoresSeguimiento() {
    const select = document.getElementById('t-plate-select');
    if (!select) return;

    select.innerHTML = '';
    if (vehiclesDB.length === 0) {
        select.innerHTML = '<option value="">No hay vehículos registrados</option>';
        return;
    }

    vehiclesDB.forEach(v => {
        const option = document.createElement('option');
        option.value = v.plate;
        option.textContent = `${v.plate} — ${v.model} (${v.client})`;
        select.appendChild(option);
    });
}

// Guardar actualización de seguimiento con foto
function actualizarAvanceFoto(e) {
    e.preventDefault();
    const plate = document.getElementById('t-plate-select').value;
    const status = document.getElementById('t-status-select').value;
    const comment = document.getElementById('t-comment').value.trim();
    const fileInput = document.getElementById('t-photo-input');

    if (!plate) {
        alert("Selecciona un vehículo válido.");
        return;
    }

    const vIndex = vehiclesDB.findIndex(v => v.plate === plate);
    if (vIndex !== -1) {
        vehiclesDB[vIndex].status = status;
        localStorage.setItem('agp_vehicles', JSON.stringify(vehiclesDB));
    }

    const today = new Date().toLocaleString('es-PY');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            const photoBase64 = evt.target.result;
            guardarRegistroSeguimiento({ plate, status, comment, photo: photoBase64, date: today });
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        // Mantener foto anterior si ya existía para esta chapa
        let existingTracking = trackingDB.find(t => t.plate === plate);
        let photoAnterior = existingTracking ? existingTracking.photo : null;
        guardarRegistroSeguimiento({ plate, status, comment, photo: photoAnterior, date: today });
    }
}

function guardarRegistroSeguimiento(registro) {
    trackingDB.unshift(registro);
    localStorage.setItem('agp_tracking', JSON.stringify(trackingDB));

    document.getElementById('tracking-form').reset();
    renderAvancesList();
    renderDashboard();
    alert("📸 ¡Avance y estado actualizados correctamente para el cliente!");
}

// Renderizar historial de fotos y estados de seguimiento
function renderAvancesList() {
    const container = document.getElementById('tracking-list');
    if (!container) return;

    container.innerHTML = '';
    if (trackingDB.length === 0) {
        container.innerHTML = '<p style="color: #aaa;">No hay avances fotográficos registrados aún.</p>';
        return;
    }

    trackingDB.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'tracking-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong style="color:#3498db; font-size:16px;">🚗 Chapa: ${item.plate}</strong>
                <span style="font-size:11px; color:#aaa;">${item.date}</span>
            </div>
            <p style="margin: 4px 0;"><strong>Estado:</strong> <span class="badge info">${item.status}</span></p>
            ${item.comment ? `<p style="margin: 6px 0; font-size: 13px; color: #ddd;"><em>"${item.comment}"</em></p>` : ''}
            ${item.photo ? `<img src="${item.photo}" class="tracking-img" alt="Foto de avance">` : ''}
            <div style="text-align:right; margin-top:8px;">
                <button onclick="eliminarAvance(${index})" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:12px;">🗑️ Eliminar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function eliminarAvance(index) {
    if (confirm("¿Deseas eliminar este registro de avance?")) {
        trackingDB.splice(index, 1);
        localStorage.setItem('agp_tracking', JSON.stringify(trackingDB));
        renderAvancesList();
    }
}

// Convertir números a letras para el monto total en Guaraníes
function numberToWordsGuarani(amount) {
    if (isNaN(amount) || amount <= 0) return "Cero Guaraníes";
    
    const units = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const teens = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    const tens = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const hundreds = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecentos"];

    function convertGroup(n) {
        let output = "";
        if (n === 100) return "cien";
        
        if (n >= 100) {
            output += hundreds[Math.floor(n / 100)] + " ";
            n %= 100;
        }
        if (n >= 10 && n <= 19) {
            output += teens[n - 10] + " ";
            n = 0;
        } else if (n >= 20) {
            if (n === 20) output += "veinte ";
            else if (n > 20 && n < 30) output += "veinti" + units[n % 10] + " ";
            else {
                output += tens[Math.floor(n / 10)];
                if (n % 10 > 0) output += " y " + units[n % 10];
                output += " ";
            }
            n = 0;
        }
        if (n > 0) {
            output += units[n] + " ";
        }
        return output.trim();
    }

    let num = Math.floor(amount);
    let result = "";

    if (num >= 1000000) {
        let millions = Math.floor(num / 1000000);
        result += (millions === 1 ? "un millón " : convertGroup(millions) + " millones ");
        num %= 1000000;
    }

    if (num >= 1000) {
        let thousands = Math.floor(num / 1000);
        result += (thousands === 1 ? "mil " : convertGroup(thousands) + " mil ");
        num %= 1000;
    }

    if (num > 0) {
        result += convertGroup(num);
    }

    return (result.trim() + " guaraníes").toUpperCase();
}

// Función principal para generar y descargar el PDF
function generatePDF() {
    const client = document.getElementById('b-client').value;
    const vehicle = document.getElementById('b-vehicle').value;
    const plate = document.getElementById('b-plate').value;
    const insurance = document.getElementById('b-insurance').value;
    const
