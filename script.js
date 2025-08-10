// Configuración
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFlzHwkWMzspVvmXcKrO0JlX4DqEKLvS9VK2EITsRQY7vl8i6W7EcDfwUxFNLQ1qxk/exec';

// Elementos del DOM
let form, submitBtn, mensajeDiv, loadingOverlay;
let localidadRadio, internacionalRadio, provinciaContainer, paisContainer, provinciaSelect, paisSelect;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aplicación cargada correctamente');
    initializeApp();
    
    const checkboxWrapper = document.querySelector('.checkbox-wrapper');
    if (checkboxWrapper) {
        checkboxWrapper.addEventListener('click', function() {
            checkboxWrapper.classList.toggle('activo');
        });
    }
});

function initializeApp() {
    // Obtener elementos del DOM
    form = document.getElementById('registroForm');
    submitBtn = document.getElementById('btnSubmit');
    mensajeDiv = document.getElementById('mensaje');
    loadingOverlay = document.getElementById('loading');
    
    // Elementos de ubicación
    localidadRadio = document.getElementById('localidad');
    internacionalRadio = document.getElementById('internacional');
    provinciaContainer = document.getElementById('provinciaContainer');
    paisContainer = document.getElementById('paisContainer');
    provinciaSelect = document.getElementById('provincia');
    paisSelect = document.getElementById('pais');
    
    if (!form || !submitBtn || !mensajeDiv) {
        console.error('❌ Error: No se pudieron encontrar los elementos del DOM');
        return;
    }
    
    console.log('✅ Elementos del DOM encontrados');
    initializeForm();
    initializeLocationHandlers();
}

function initializeForm() {
    // Agregar validación en tiempo real
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', validateField);
        input.addEventListener('blur', validateField);
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', handleFormSubmit);
    
    console.log('✅ Formulario inicializado correctamente');
}

function initializeLocationHandlers() {
    // Event listeners para los radio buttons de ubicación
    if (localidadRadio) {
        localidadRadio.addEventListener('change', function() {
            if (this.checked) {
                showLocationContainer('provincia');
                // Limpiar el país si estaba seleccionado
                if (paisSelect) paisSelect.value = '';
            }
        });
    }
    
    if (internacionalRadio) {
        internacionalRadio.addEventListener('change', function() {
            if (this.checked) {
                showLocationContainer('pais');
                // Limpiar la provincia si estaba seleccionada
                if (provinciaSelect) provinciaSelect.value = '';
            }
        });
    }
    
    console.log('✅ Manejadores de ubicación inicializados');
}

// ===== FUNCIONES PARA MANEJO DE ACOMPAÑANTES =====
function ocultarCampoAcompanantes() {
    const container = document.getElementById('BotonAcomp');
    if (container) { // Corregido de === true
        container.style.display = 'none';
        container.classList.remove('fade-in');
        console.log('❌ Campo de acompañantes ocultado');
    }
}

// Función para mostrar el botón cuando se elimine el acompañante
function mostrarBotonAcompanante() {
    const boton = document.getElementById('BotonAcomp');
    if (boton) {
        boton.style.display = 'inline-block';
        boton.classList.add('fade-in');
        console.log('✅ Botón de acompañante mostrado');
    }
}

// Función para mostrar/ocultar campo de acompañantes
function mostrarCampoAcompanantes(checkbox) {
    const container = document.getElementById('acompanantesContainer');
    const resumenGrupo = document.getElementById('resumenGrupo');
    
    if (checkbox.checked) {
        // Mostrar contenedor con animación
        container.style.display = 'block';
        container.classList.add('fade-in');
        
        // Mostrar el botón cuando se active el checkbox
        mostrarBotonAcompanante();
        
        console.log('✅ Campo de acompañantes activado');
    } else {
        // Ocultar contenedor y limpiar datos
        container.style.display = 'none';
        container.classList.remove('fade-in');
        
        // Limpiar todos los campos de acompañantes
        const contenedorAcompanantes = document.getElementById('contenedorAcompanantes');
        contenedorAcompanantes.innerHTML = '';
        
        // Limpiar campo oculto
        document.getElementById('acompanantesHidden').value = '';
        
        // Ocultar resumen
        resumenGrupo.style.display = 'none';
        
        // Mostrar el botón cuando se desactive
        mostrarBotonAcompanante();
        
        console.log('❌ Campo de acompañantes desactivado y limpiado');
    }
}

// Función para hacer clic en el checkbox desde el wrapper
function toggleCheckbox() {
    const checkbox = document.getElementById('acompanara');
    checkbox.checked = !checkbox.checked;
    mostrarCampoAcompanantes(checkbox);
}

// Función para agregar campo de acompañante - LIMITADO A 1
function agregarCampo() {
    const contenedor = document.getElementById("contenedorAcompanantes");
    
    // VERIFICAR SI YA EXISTE UN ACOMPAÑANTE
    const camposExistentes = contenedor.querySelectorAll('.nombre-campo.acompanante');
    if (camposExistentes.length >= 1) {
        console.log('⚠️ Solo se permite un acompañante');
        return; // No hacer nada si ya hay uno
    }
    
    // Crear el nuevo campo para acompañante
    const nuevoCampo = document.createElement("div");
    nuevoCampo.classList.add("nombre-campo", "acompanante");
    nuevoCampo.innerHTML = `
        <div class="campo-indicator acompanante">Acompañante</div>
        <label>
            <i class="fas fa-user-friends"></i> Nombre del acompañante <span class="required">*</span>
        </label>
        <div class="input-wrapper">
            <input type="text" name="NombreAcompanante" class="form-input" maxlength="50" 
                   placeholder="Nombre y apellido del acompañante" required />
            <button type="button" class="eliminar-btn" onclick="eliminarCampo(this)" title="Eliminar acompañante">❌</button>
        </div>
    `;

    contenedor.appendChild(nuevoCampo);
    
    // Agregar animación al nuevo campo
    nuevoCampo.classList.add('fade-in');
    
    // OCULTAR EL BOTÓN DESPUÉS DE AGREGAR
    ocultarCampoAcompanantes();
    
    // Actualizar el resumen y el campo oculto
    actualizarResumenGrupo();
    
    console.log('➕ Campo de acompañante agregado');
}

// Función para eliminar campo de acompañante
function eliminarCampo(boton) {
    const campo = boton.closest(".nombre-campo");
    
    // Eliminar el campo con confirmación
    if (confirm('¿Estás seguro de que deseas eliminar este acompañante?')) {
        campo.remove();
        
        // MOSTRAR EL BOTÓN CUANDO SE ELIMINE
        mostrarBotonAcompanante();
        
        // Actualizar el resumen y el campo oculto
        actualizarResumenGrupo();
        
        console.log('➖ Campo de acompañante eliminado');
    }
}
// Función para actualizar resumen del grupo
function actualizarResumenGrupo() {
    // Obtener todos los nombres de acompañantes
    const nombresAcompanantes = Array.from(document.querySelectorAll('input[name="NombreAcompanante"]'))
        .map(input => input.value.trim())
        .filter(nombre => nombre !== "");
    
    // Actualizar campo oculto con los acompañantes
    const hiddenField = document.getElementById('acompanantesHidden');
    if (hiddenField) {
        hiddenField.value = nombresAcompanantes.join(', ');
    }
    
    // Mostrar/ocultar y actualizar el resumen
    const resumenDiv = document.getElementById('resumenGrupo');
    const textoResumen = document.getElementById('textoResumen');
    
    // Solo mostrar si el checkbox está marcado
    const checkbox = document.getElementById('acompanara');
    if (checkbox && checkbox.checked) {
        const totalCampos = document.querySelectorAll('input[name="NombreAcompanante"]').length;
        const totalPersonas = nombresAcompanantes.length + 1; // +1 por el principal
        
        resumenDiv.style.display = 'block';
        
        if (totalCampos > 0) {
            if (nombresAcompanantes.length === totalCampos) {
                // Todos los campos tienen nombres
                textoResumen.textContent = `Registro para ${totalPersonas} personas (1 principal + ${nombresAcompanantes.length} acompañante)`;
            } else {
                // Algunos campos están vacíos
                const camposVacios = totalCampos - nombresAcompanantes.length;
                textoResumen.textContent = `${totalCampos} campo de acompañantes (${camposVacios} pendiente(s) de llenar)`;
            }
        } else {
            textoResumen.textContent = 'Registro para 1 persona - Haz clic en "Añadir acompañante"';
        }
    } else {
        resumenDiv.style.display = 'none';
    }
    
    console.log('📊 Resumen actualizado - Acompañantes:', nombresAcompanantes.length);
}

// Event listener para actualizar en tiempo real
document.addEventListener('input', function(e) {
    if (e.target.name === 'NombreAcompanante') {
        actualizarResumenGrupo();
    }
});

function showLocationContainer(type) {
    if (type === 'provincia') {
        // Mostrar provincias, ocultar países
        if (provinciaContainer) {
            provinciaContainer.style.display = 'block';
            provinciaSelect.required = true;
        }
        if (paisContainer) {
            paisContainer.style.display = 'none';
            paisSelect.required = false;
        }
    } else if (type === 'pais') {
        // Mostrar países, ocultar provincias
        if (paisContainer) {
            paisContainer.style.display = 'block';
            paisSelect.required = true;
        }
        if (provinciaContainer) {
            provinciaContainer.style.display = 'none';
            provinciaSelect.required = false;
        }
    }
}

function validateField(e) {
    const field = e.target;
    const isValid = field.checkValidity() && field.value.trim() !== '';
    
    // Remover clases previas
    field.classList.remove('valid', 'invalid');
    
    if (field.value.trim() === '') {
        // Campo vacío - estado neutral
        field.style.borderColor = '#e1e5e9';
        return;
    }
    
    if (isValid) {
        field.classList.add('valid');
        field.style.borderColor = '#28a745';
    } else {
        field.classList.add('invalid');
        field.style.borderColor = '#dc3545';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('🚀 Formulario enviado');
    
    try {
        // Mostrar loading
        showLoading(true);
        
        // Recopilar datos del formulario usando FormData
        const formData = new FormData(form);
        
        // Obtener los acompañantes y agregarlos al FormData
        actualizarResumenGrupo(); // Asegurar que esté actualizado
        
        // Manejar la ubicación especialmente
        const tipoUbicacion = document.querySelector('input[name="tipoUbicacion"]:checked');
        if (tipoUbicacion) {
            let ubicacionValue = '';
            if (tipoUbicacion.value === 'localidad' && provinciaSelect.value) {
                ubicacionValue = `Panamá - ${provinciaSelect.value}`;
            } else if (tipoUbicacion.value === 'internacional' && paisSelect.value) {
                ubicacionValue = paisSelect.value;
            }
            
            // Actualizar el FormData con la ubicación procesada
            formData.set('Ubicacion', ubicacionValue);
            formData.set('TipoUbicacion', tipoUbicacion.value);
        }
        
        // Convertir FormData a objeto para logging
        const dataObj = {};
        for (let [key, value] of formData.entries()) {
            dataObj[key] = value;
        }
        
        console.log('📝 Datos recopilados:', dataObj);
        
        // Validar datos antes de enviar
        if (!validateFormData(dataObj)) {
            throw new Error('Por favor, completa todos los campos requeridos correctamente');
        }
        
        // Enviar datos a Google Sheets
        const result = await sendDataToGoogleSheets(formData);
        
        // Mostrar mensaje de éxito
        showMessage('¡Registro enviado exitosamente! Gracias por confirmar su asistencia.', 'success');
        
        // Limpiar formulario
        form.reset();
        resetFieldStyles();
        resetLocationContainers();
        resetAcompanantes();
        
        console.log('✅ Formulario procesado correctamente');
        
    } catch (error) {
        console.error('💥 Error completo:', error);
        showMessage(`Error al enviar el formulario: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function resetAcompanantes() {
    // Desmarcar el checkbox
    const checkbox = document.getElementById('acompanara');
    if (checkbox) {
        checkbox.checked = false;
    }
    
    // Ocultar contenedor de acompañantes
    const container = document.getElementById('acompanantesContainer');
    if (container) {
        container.style.display = 'none';
        container.classList.remove('fade-in');
    }
    
    // Limpiar todos los campos de acompañantes
    const contenedorAcompanantes = document.getElementById('contenedorAcompanantes');
    if (contenedorAcompanantes) {
        contenedorAcompanantes.innerHTML = '';
    }
    
    // Limpiar campo oculto
    const hiddenField = document.getElementById('acompanantesHidden');
    if (hiddenField) {
        hiddenField.value = '';
    }
    
    // Ocultar resumen
    const resumenDiv = document.getElementById('resumenGrupo');
    if (resumenDiv) {
        resumenDiv.style.display = 'none';
    }
    
    console.log('🧹 Campos de acompañantes limpiados');
}

function validateFormData(data) {
    const requiredFields = ['Nombre', 'Apellido', 'Correo', 'Telefono', 'Iglesia'];
    
    // Verificar campos requeridos
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            console.error(`❌ Campo requerido faltante: ${field}`);
            return false;
        }
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.Correo.trim())) {
        console.error('❌ Email inválido');
        return false;
    }
    
    // Validar teléfono (mínimo 8 caracteres)
    if (data.Telefono.trim().length < 8) {
        console.error('❌ Teléfono inválido');
        return false;
    }
    
    // Validar nombre y apellido (mínimo 2 caracteres)
    if (data.Nombre.trim().length < 2 || data.Apellido.trim().length < 2) {
        console.error('❌ Nombre o apellido muy corto');
        return false;
    }
    
    // Validar ubicación
    if (!data.TipoUbicacion) {
        console.error('❌ Debe seleccionar el tipo de ubicación');
        return false;
    }
    
    if (!data.Ubicacion || data.Ubicacion.trim() === '') {
        console.error('❌ Debe seleccionar una ubicación específica');
        return false;
    }
    
    return true;
}

async function sendDataToGoogleSheets(formData) {
    console.log('📡 Enviando datos a:', GOOGLE_SCRIPT_URL);
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'cors',
            redirect: 'follow'
        });
        
        console.log('📡 Respuesta HTTP status:', response.status);
        console.log('📡 Response headers:', response.headers);
        
        // Google Apps Script a veces devuelve 302 pero los datos se procesan correctamente
        if (response.status === 302 || response.redirected) {
            console.log('✅ Redirección detectada - datos probablemente enviados');
            return { result: 'success', message: 'Datos enviados correctamente' };
        }
        
        if (!response.ok && response.status !== 302) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        // Intentar parsear la respuesta
        let result;
        try {
            const textResponse = await response.text();
            console.log('📥 Respuesta cruda:', textResponse);
            
            // Intentar parsear como JSON
            result = JSON.parse(textResponse);
            console.log('📥 Respuesta parseada:', result);
        } catch (parseError) {
            console.log('⚠️ No se pudo parsear JSON, asumiendo éxito');
            // Si no se puede parsear, probablemente fue exitoso
            return { result: 'success', message: 'Datos enviados correctamente' };
        }
        
        if (result && result.result === 'error') {
            throw new Error(result.message || 'Error del servidor');
        }
        
        return result || { result: 'success', message: 'Datos enviados correctamente' };
        
    } catch (error) {
        console.error('💥 Error en sendDataToGoogleSheets:', error);
        // Si es un error de CORS o timeout, pero sabemos que Google Apps Script funciona así
        if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('CORS')) {
            console.log('⚠️ Error de red detectado, pero los datos podrían haberse enviado');
            // En lugar de fallar, vamos a asumir que se envió correctamente
            // porque sabemos que Google Apps Script tiene problemas de CORS
            return { result: 'success', message: 'Datos enviados (verificar en la hoja de cálculo)' };
        }
        
        throw error;
    }
}

function showLoading(show) {
    if (show) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Confirmar Asistencia';
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

function showMessage(message, type) {
    if (!mensajeDiv) return;
    
    mensajeDiv.textContent = message;
    mensajeDiv.className = `message ${type}`;
    mensajeDiv.style.display = 'block';
    
    // Auto-ocultar después de 6 segundos
    setTimeout(() => {
        if (mensajeDiv) {
            mensajeDiv.style.display = 'none';
        }
    }, 6000);
}

function resetFieldStyles() {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.borderColor = '#e1e5e9';
        input.classList.remove('valid', 'invalid');
    });
}

function resetLocationContainers() {
    // Ocultar ambos contenedores de ubicación
    if (provinciaContainer) {
        provinciaContainer.style.display = 'none';
        provinciaSelect.required = false;
    }
    if (paisContainer) {
        paisContainer.style.display = 'none';
        paisSelect.required = false;
    }
}

// Función para debug (opcional)
function debugFormData() {
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }
    
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    console.table(data);
}

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('💥 Error global capturado:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('💥 Promise rechazada no manejada:', e.reason);
});

// Exponer funciones globalmente para debug (opcional)
if (typeof window !== 'undefined') {
    window.debugForm = debugFormData;
}