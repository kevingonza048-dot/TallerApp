const vehicleParts = [
    "Base de Tapa Valijera", "Capot", "Chasis Delantero", "Chasis Trasero", "Defensa Trasera",
    "Deflector de Radiador de Agua", "Electro -Ventilador de Aire Acondicionado", "Electro -Ventilador de Radiador",
    "Embrague de Ventilador", "Espejos", "Faro Delantero", "Faro Trasero", "Frente Exterior",
    "Guardabarro D.D.", "Guardabarro D.I.", "Guardabarro T.D.", "Guardabarro T.I.",
    "Guardapolvo Int. D.D.", "Guardapolvo Int. D.I.", "Marco de Parabrisas Delantero", "Marco de Parabrisas T.",
    "Moldura Exterior", "Paleta/Ventilador de Radiador", "Parabrisa Delantero", "Parabrisa Trasero",
    "Paragolpe Delantero", "Paragolpe Trasero.", "Parante Ant. de Puerta D.D.", "Parante Ant. de Puerta D.I.",
    "Parante de Frente", "Parante Interm. de Puerta D.", "Parante Interm. de Puerta I.", "Parante Trasero",
    "Piso", "Piso Valijera", "Protector Frontal", "Pulido y Lustre", "Puerta D.D.", "Puerta D.I.",
    "Puerta T.D.", "Puerta T.I.", "Tapa Valijera", "Techo", "Torreta de Amortiguador Delantero",
    "Travesaño Interior", "Travesaño Superior", "Zócalo D.", "Zócalo I."
];

let vehiclesDB = JSON.parse(localStorage.getItem('agp_vehicles')) || [];
let trackingDB = JSON.parse(localStorage.getItem('agp_tracking')) || [];

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active-view'));
    document.querySelectorAll('.sidebar a').forEach(link => link.classList.remove('active'));

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

function renderPartsSelector() {
    const container = document.getElementById('parts-selector');
    if (!container) return;
    container.innerHTML = '';
    vehicleParts.forEach((part, index) => {
        container.innerHTML += `
            <div class="part-item">
                <span>${part}</span>
                <div class="part-checks">
                    <label><input type="checkbox" name="part_${index}_ch" data-part="${part}" data-type="ch"> Ch</label>
                    <label><input type="checkbox" name="part_${index}_p" data-part="${part}" data-type="p"> P</label>
                    <label><input type="checkbox" name="part_${index}_e" data-part="${part}" data-type="e"> E</label>
                </div>
            </div>`;
    });
}

function guardarNuevoVehiculo(e) {
    e.preventDefault();
    const plate = document.getElementById('plate').value.trim().toUpperCase();
    const model = document.getElementById('model').value.trim();
    const client = document.getElementById('client').value.trim();
    const status = document.getElementById('status').value;

    if (!plate || !model || !client) return;

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

function renderDashboard() {
    const tbody = document.getElementById('vehicle-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    let readyCount = 0, processCount = 0;

    const baseUrl = "https://kevingonza048-dot.github.io/TallerApp/cliente.html";

    vehiclesDB.forEach((v, idx) => {
        if (v.status === 'Listo') readyCount++;
        else processCount++;

        const avs = trackingDB.filter(t => t.plate.toUpperCase() === v.plate.toUpperCase());
        const ultimoEstado = avs.length > 0 ? avs[0].status : v.status;
        const ultimaFoto = avs.length > 0 && avs[0].photo ? avs[0].photo : "";
        const ultimoComentario = avs.length > 0 && avs[0].comment ? avs[0].comment : "Vehículo en proceso en el taller.";

        // Incluimos los datos y la foto optimizada directo en el enlace
        const linkCliente = `${baseUrl}?chapa=${encodeURIComponent(v.plate)}&estado=${encodeURIComponent(ultimoEstado)}&comentario=${encodeURIComponent(ultimoComentario)}&foto=${encodeURIComponent(ultimaFoto)}`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${v.plate}</strong></td>
                <td>${v.model}</td>
                <td>${v.client}</td>
                <td><span class="badge ${v.status === 'Listo' ? 'info' : 'warning'}">${v.status}</span></td>
                <td>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <input type="text" readonly value="${linkCliente}" style="width: 180px; padding: 4px; background: #121212; border: 1px solid #444; color: #fff; font-size: 10px; border-radius: 4px;" id="table-link-${v.plate}">
                        <button onclick="copiarEnlaceTabla('${v.plate}')" style="background: #27ae60; border: none; color: #fff; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">📋 Copiar</button>
                        <button onclick="eliminarVehiculo(${idx})" style="background: #e74c3c; border: none; color: #fff; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">❌</button>
                    </div>
                </td>
            </tr>`;
    });

    if (document.getElementById('dash-total')) document.getElementById('dash-total').innerText = vehiclesDB.length;
    if (document.getElementById('dash-process')) document.getElementById('dash-process').innerText = processCount;
    if (document.getElementById('dash-ready')) document.getElementById('dash-ready').innerText = readyCount;
}

function copiarEnlaceTabla(plate) {
    const input = document.getElementById(`table-link-${plate}`);
    input.select();
    navigator.clipboard.writeText(input.value);
    alert("📋 ¡Enlace inteligente copiado! Ahora abrirá la foto en cualquier teléfono.");
}

function eliminarVehiculo(index) {
    if (confirm("¿Deseas eliminar este vehículo?")) {
        vehiclesDB.splice(index, 1);
        localStorage.setItem('agp_vehicles', JSON.stringify(vehiclesDB));
        renderDashboard();
    }
}

function cargarSelectoresSeguimiento() {
    const select = document.getElementById('t-plate-select');
    if (!select) return;
    select.innerHTML = '';
    if (vehiclesDB.length === 0) {
        select.innerHTML = '<option value="">No hay vehículos registrados</option>';
        return;
    }
    vehiclesDB.forEach(v => {
        select.innerHTML += `<option value="${v.plate}">${v.plate} — ${v.model} (${v.client})</option>`;
    });
}

function actualizarAvanceFoto(e) {
    e.preventDefault();
    const plate = document.getElementById('t-plate-select').value;
    const status = document.getElementById('t-status-select').value;
    const comment = document.getElementById('t-comment').value.trim();
    const fileInput = document.getElementById('t-photo-input');

    if (!plate) return;

    const vIndex = vehiclesDB.findIndex(v => v.plate === plate);
    if (vIndex !== -1) {
        vehiclesDB[vIndex].status = status;
        localStorage.setItem('agp_vehicles', JSON.stringify(vehiclesDB));
    }

    const today = new Date().toLocaleString('es-PY');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 300; // Tamaño súper optimizado para enlaces web
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedPhoto = canvas.toDataURL('image/jpeg', 0.5);
                guardarRegistroSeguimiento({ plate, status, comment, photo: compressedPhoto, date: today });
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        guardarRegistroSeguimiento({ plate, status, comment, photo: null, date: today });
    }
}

function guardarRegistroSeguimiento(registro) {
    trackingDB.unshift(registro);
    localStorage.setItem('agp_tracking', JSON.stringify(trackingDB));
    document.getElementById('tracking-form').reset();
    renderAvancesList();
    renderDashboard();
    alert("📸 ¡Foto y avance guardados correctamente!");
}

function renderAvancesList() {
    const container = document.getElementById('tracking-list');
    if (!container) return;
    container.innerHTML = '';
    if (trackingDB.length === 0) {
        container.innerHTML = '<p style="color: #aaa;">No hay avances fotográficos registrados aún.</p>';
        return;
    }
    trackingDB.forEach((item, index) => {
        container.innerHTML += `
            <div class="tracking-card">
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
            </div>`;
    });
}

function eliminarAvance(index) {
    if (confirm("¿Deseas eliminar este registro?")) {
        trackingDB.splice(index, 1);
        localStorage.setItem('agp_tracking', JSON.stringify(trackingDB));
        renderAvancesList();
        renderDashboard();
    }
}

function numberToWordsGuarani(amount) {
    if (isNaN(amount) || amount <= 0) return "Cero Guaraníes";
    const units = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const teens = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    const tens = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const hundreds = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecentos"];

    function convertGroup(n) {
        let output = "";
        if (n === 100) return "cien";
        if (n >= 100) { output += hundreds[Math.floor(n / 100)] + " "; n %= 100; }
        if (n >= 10 && n <= 19) { output += teens[n - 10] + " "; n = 0; }
        else if (n >= 20) {
            if (n === 20) output += "veinte ";
            else if (n > 20 && n < 30) output += "veinti" + units[n % 10] + " ";
            else { output += tens[Math.floor(n / 10)]; if (n % 10 > 0) output += " y " + units[n % 10]; output += " "; }
            n = 0;
        }
        if (n > 0) output += units[n] + " ";
        return output.trim();
    }

    let num = Math.floor(amount), result = "";
    if (num >= 1000000) { let m = Math.floor(num / 1000000); result += (m === 1 ? "un millón " : convertGroup(m) + " millones "); num %= 1000000; }
    if (num >= 1000) { let th = Math.floor(num / 1000); result += (th === 1 ? "mil " : convertGroup(th) + " mil "); num %= 1000; }
    if (num > 0) result += convertGroup(num);
    return (result.trim() + " guaraníes").toUpperCase();
}

function generatePDF() {
    const client = document.getElementById('b-client').value;
    const vehicle = document.getElementById('b-vehicle').value;
    const plate = document.getElementById('b-plate').value;
    const insurance = document.getElementById('b-insurance').value;
    const claim = document.getElementById('b-claim').value;
    const detail = document.getElementById('b-detail').value;
    const observations = document.getElementById('b-observations').value;
    const parts = document.getElementById('b-parts').value;
    const total = document.getElementById('b-total').value;

    document.getElementById('pdf-client').innerText = client;
    document.getElementById('pdf-vehicle').innerText = vehicle;
    document.getElementById('pdf-plate').innerText = plate;
    document.getElementById('pdf-insurance').innerText = insurance;
    document.getElementById('pdf-claim').innerText = claim;
    document.getElementById('pdf-date').innerText = new Date().toLocaleDateString('es-PY');

    const detailBox = document.getElementById('pdf-detail-box');
    if (detail.trim() !== "") { document.getElementById('pdf-detail').innerText = detail; detailBox.style.display = 'block'; }
    else { detailBox.style.display = 'none'; }

    document.getElementById('pdf-observations').innerText = observations;
    document.getElementById('pdf-parts').innerText = parts;

    if (total) {
        const totalNum = parseFloat(total);
        document.getElementById('pdf-total').innerText = '₲ ' + totalNum.toLocaleString('es-PY');
        document.getElementById('pdf-total-words').innerText = numberToWordsGuarani(totalNum);
    } else {
        document.getElementById('pdf-total').innerText = '₲ 0';
        document.getElementById('pdf-total-words').innerText = 'CERO GUARANÍES';
    }

    const partsTableBody = document.getElementById('pdf-parts-table-body');
    partsTableBody.innerHTML = '';
    vehicleParts.forEach((part, index) => {
        const ch = document.querySelector(`input[name="part_${index}_ch"]`)?.checked;
        const p = document.querySelector(`input[name="part_${index}_p"]`)?.checked;
        const e = document.querySelector(`input[name="part_${index}_e"]`)?.checked;
        if (ch || p || e) {
            partsTableBody.innerHTML += `
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; color: #000 !important;">${part}</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: center; color: #000 !important;">${ch ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: center; color: #000 !important;">${p ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: center; color: #000 !important;">${e ? 'X' : ''}</td>
                </tr>`;
        }
    });

    const element = document.getElementById('pdf-template');
    element.style.display = 'block';
    html2pdf().set({
        margin: 0.3,
        filename: `Presupuesto_${client || 'Asegurado'}_${plate || 'AGP'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save().then(() => { element.style.display = 'none'; });
}

window.onload = () => {
    renderPartsSelector();
    renderDashboard();
};
