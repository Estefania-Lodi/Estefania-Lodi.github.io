class Cliente {
    constructor(nombre, apellido, dni, saldo, fechaNacimiento, pin) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.saldo = saldo;
        this.fechaNacimiento = fechaNacimiento;
        this.pin = pin;
    }
}

const arrayClientes = JSON.parse(localStorage.getItem("arrayClientes")) || [];
const menu = document.getElementById("menu");
const formulario = document.getElementById("formulario");
const mensaje = document.getElementById("mensaje");
const documento = document.getElementById("documento");
const resultado = document.getElementById("resultado");

// Función para guardar clientes en el almacenamiento local
function guardarClientesLocalStorage() {
    localStorage.setItem("arrayClientes", JSON.stringify(arrayClientes));
}

// Función para cargar clientes desde el almacenamiento local
function cargarClientesLocalStorage() {
    const clientesGuardados = localStorage.getItem("arrayClientes");
    if (clientesGuardados) {
        arrayClientes.push(...JSON.parse(clientesGuardados));
    }
}

// Cargar clientes desde el almacenamiento local
cargarClientesLocalStorage();

// Mostrar el menú principal
function mostrarMenu() {
    menu.style.display = "block";
    formulario.style.display = "none";
    mensaje.style.display = "none";
    documento.style.display = "none";
}

// Mostrar un mensaje en la pantalla
function mostrarMensaje(texto) {
    resultado.style.display = "block";
    resultado.innerHTML = texto;

    setTimeout(() => {
        resultado.style.display = "none";
    }, 1000);
}

// Mostrar el formulario correspondiente
function mostrarFormulario(accion) {
    menu.style.display = "none";
    formulario.style.display = "block";

    switch (accion) {
        case 'agregar':
            mostrarFormularioAgregar();
            break;
        case 'modificacion':
            mostrarFormularioModificacion();
            break;
        case 'baja':
            mostrarFormularioBaja();
            break;
    }
}

// Mostrar el formulario para agregar un cliente
function mostrarFormularioAgregar() {
    formulario.innerHTML = `
        <h2>Agregar Cliente</h2>
        <input type="text" id="nombre" placeholder="Nombre"><br>
        <input type="text" id="apellido" placeholder="Apellido"><br>
        <input type="number" id="dni" placeholder="DNI"><br>
        <input type="number" id="saldo" placeholder="Saldo"><br>
        <label for="fechaNacimiento">Fecha de Nacimiento:</label>
        <input type="date" id="fechaNacimiento"><br>
        <button onclick="agregarCliente()">Guardar</button>
    `;
}

// Generar un PIN aleatorio
function generarPin() {
    return String(Math.floor(Math.random() * 1000)).padStart(3, '0');
}

// Función para agregar un cliente
function agregarCliente() {
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const dni = parseInt(document.getElementById("dni").value);
    const saldo = parseInt(document.getElementById("saldo").value);
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;

    const pin = generarPin();

    // Validación de datos del cliente
    let primerError = "";

    if (nombre === "" || apellido === "" || fechaNacimiento === "") {
        primerError = "Por favor, completa todas las casillas.";
    } else {
        const regexLetras = /^[a-zA-Z\s]+$/;

        if (!regexLetras.test(nombre) || !regexLetras.test(apellido)) {
            primerError = "Por favor, ingresa solo letras en los campos de nombre y apellido.";
        } else {
            const clienteExistente = arrayClientes.find(cliente => cliente.dni === dni);
            if (clienteExistente) {
                primerError = "Ya existe un cliente con el mismo documento.";
            } else {
                const hoy = new Date();
                const fechaNacimientoDate = new Date(fechaNacimiento);
                const edad = hoy.getFullYear() - fechaNacimientoDate.getFullYear();
                if (edad < 18 || edad > 90) {
                    primerError = "El cliente debe tener entre 18 y 90 años.";
                } else {
                    if (isNaN(dni) || dni < 10000000 || dni > 99999999) {
                        primerError = "El DNI debe tener 8 números.";
                    } else {
                        if (isNaN(saldo) || saldo < 4000 || saldo < 0) {
                            primerError = "El saldo debe ser mayor o igual a 4000 y no puede ser negativo.";
                        }
                    }
                }
            }
        }
    }

    // Mostrar errores si existen
    if (primerError !== "") {
        Toastify({
            text: primerError,
            duration: 5000,
            close: true,
            gravity: "top",
            position: "right"
        }).showToast();
        return;
    }

    // Crear un nuevo cliente y agregarlo al array de clientes
    const cliente = new Cliente(nombre, apellido, dni, saldo, fechaNacimiento, pin);
    arrayClientes.push(cliente);
    guardarClientesLocalStorage();

    // Mostrar mensaje de éxito
    Toastify({
        text: `Cliente agregado exitosamente. PIN: ${pin}`,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right"
    }).showToast();

    mostrarMenu();
}

// Mostrar el formulario para modificar un cliente
function mostrarFormularioModificacion() {
    formulario.innerHTML = `
        <h2>Modificación de Cliente</h2>
        <label for="dniModificacion">Ingrese el DNI del cliente a modificar:</label>
        <input type="number" id="dniModificacion"><br>
        <button onclick="buscarClienteParaModificar()">Buscar</button>
    `;
}

// Buscar un cliente para modificar
function buscarClienteParaModificar() {
    const dni = parseInt(document.getElementById("dniModificacion").value);
    const cliente = arrayClientes.find(cliente => cliente.dni == dni);
    const mensajeError = document.getElementById("mensajeError");

    if (cliente) {
        formulario.innerHTML = `
            <h2>Modificar Cliente</h2>
            <input type="text" id="nombre" placeholder="Nombre" value="${cliente.nombre}"><br>
            <input type="text" id="apellido" placeholder="Apellido" value="${cliente.apellido}"><br>
            <input type="text" id="dni" placeholder="DNI" value="**** ****" readonly><br>
            <input type="number" id="saldo" placeholder="Saldo" value="${cliente.saldo}"><br>
            <label for="fechaNacimiento">Fecha de Nacimiento:</label>
            <input type="date" id="fechaNacimiento" value="${cliente.fechaNacimiento}" disabled><br>
            <button onclick="modificacionCliente(${cliente.dni})">Guardar</button>
            <br>
            <p>Pin: <span id="pinMostrar">${cliente.pin}</span></p>
        `;
        mensajeError.textContent = "";

        // Mostrar mensaje de éxito
        Toastify({
            text: "Cliente encontrado para modificar",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right"
        }).showToast();
    } else {
        // Mostrar mensaje de error si no se encuentra el cliente
        Toastify({
            text: "Cliente no encontrado",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right"
        }).showToast();
    }
}

// Modificar un cliente
function modificacionCliente(dni) {
    const nombreInput = document.getElementById("nombre");
    const apellidoInput = document.getElementById("apellido");
    const saldoInput = document.getElementById("saldo");
    const saldo = parseInt(saldoInput.value);

    const clienteExistente = arrayClientes.find(cliente => cliente.dni == dni);

    if (saldo < 4000) {
        // Mostrar mensaje de error si el saldo es menor a 4000
        Toastify({
            text: "El saldo debe ser mayor o igual a 4000",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right"
        }).showToast();
        return;
    }

    const nombre = nombreInput.value.trim(); // Elimina espacios en blanco al principio y al final del nombre
    const apellido = apellidoInput.value.trim(); // Elimina espacios en blanco al principio y al final del apellido

    // Utiliza expresiones regulares para verificar si el nombre y el apellido contienen solo letras
    if (!/^[a-zA-Z\s]+$/.test(nombre) || !/^[a-zA-Z\s]+$/.test(apellido)) {
        // Mostrar mensaje de error si el nombre o el apellido no contienen solo letras
        Toastify({
            text: "El nombre y el apellido deben contener solo letras",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right"
        }).showToast();
        return;
    }

    // Crear un cliente modificado y reemplazarlo en el array de clientes
    const clienteModificado = new Cliente(nombre, apellido, dni, saldo, clienteExistente.pin, clienteExistente.pin);

    const indice = arrayClientes.findIndex(cliente => cliente.dni == dni);
    if (indice !== -1) {
        arrayClientes[indice] = clienteModificado;
        guardarClientesLocalStorage();

        // Mostrar mensaje de éxito
        Toastify({
            text: "Cliente modificado exitosamente",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right"
        }).showToast();
    } else {
        // Mostrar mensaje de error si el cliente no se encuentra
        Toastify({
            text: "Cliente no encontrado",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right"
        }).showToast();
    }
    mostrarMenu();
}

// Mostrar el formulario para dar de baja un cliente
function mostrarFormularioBaja() {
    formulario.innerHTML = `
        <h2>Baja de Cliente</h2>
        <label for="dniBaja">Ingrese el DNI del cliente a dar de baja:</label>
        <input type="number" id="dniBaja"><br>
        <button onclick="confirmarBajaCliente()">Dar de Baja</button>
    `;
}

// Confirmar la baja de un cliente
function confirmarBajaCliente() {
    const dni = parseInt(document.getElementById("dniBaja").value);
    const cliente = arrayClientes.find(cliente => cliente.dni == dni);

    if (cliente) {
        formulario.innerHTML = `
            <h2>Confirmar Baja de Cliente</h2>
            <p>Por favor, ingrese el PIN para confirmar la baja:</p>
            <label for="confirmarPinBaja">Ingrese el PIN para confirmar:</label>
            <input type="password" id="confirmarPinBaja"><br>
            <button onclick="realizarBajaCliente(${cliente.dni})">Confirmar Baja</button>
        `;
        mostrarMensajeBusquedaCliente("");
    } else {
        // Mostrar mensaje de error si no se encuentra el cliente
        Toastify({
            text: "Cliente no encontrado",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right"
        }).showToast();
    }
}

// Realizar la baja de un cliente
function realizarBajaCliente(dni) {
    const confirmarPin = document.getElementById("confirmarPinBaja").value;
    const cliente = arrayClientes.find(cliente => cliente.dni == dni);

    if (cliente) {
        // Comprueba si el PIN ingresado coincide con el PIN del cliente
        if (cliente.pin === confirmarPin) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: '¿Quieres dar de baja al cliente?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const indice = arrayClientes.findIndex(cliente => cliente.dni == dni);
                    if (indice !== -1) {
                        arrayClientes.splice(indice, 1);
                        guardarClientesLocalStorage();

                        // Mostrar mensaje de éxito
                        Toastify({
                            text: "Cliente eliminado correctamente",
                            duration: 3000,
                            close: true,
                            gravity: "top",
                            position: "right"
                        }).showToast();

                        mostrarMenu();
                    }
                }
            });
        } else {
            // Mostrar mensaje de error si el PIN es incorrecto
            Toastify({
                text: "PIN incorrecto",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right"
            }).showToast();
        }
    } else {
        // Mostrar mensaje de error si no se encuentra el cliente
        Toastify({
            text: "Cliente no encontrado",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right"
        }).showToast();
    }
}

// Función para cargar clientes desde el servidor
function cargarClientesServidor() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const clientesNuevos = [
                new Cliente("Juan", "Perez", 12345678, 5000, "1990-01-15", generarPin()),
                new Cliente("María", "González", 87654321, 6000, "1985-03-25", generarPin()),
            ];
            if (clientesNuevos.length > 0) {
                resolve(clientesNuevos);
            } else {
                reject("No se pudieron cargar los clientes");
            }
        }, 2000);
    });
}

// Cargar clientes desde el servidor y actualizar el almacenamiento local
function cargarClientesLocalStorage() {
    cargarClientesServidor()
      .then((clientesNuevos) => {
        const clientesUnicos = arrayClientes.concat(clientesNuevos.filter(clienteNuevo => !arrayClientes.some(clienteExistente => clienteExistente.dni === clienteNuevo.dni)));
        
        arrayClientes.length = 0; 
        arrayClientes.push(...clientesUnicos); 

        guardarClientesLocalStorage();
        Toastify({
            text: "Clientes cargados exitosamente desde el servidor",
            duration: 3000, 
            close: true,
            gravity: "top",
            position: "right",
        }).showToast();
      })
      .catch((error) => {
        Toastify({
            text: "Error al cargar clientes desde el servidor: " + error,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
        }).showToast();
      });
}