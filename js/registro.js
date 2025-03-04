import { insertCiudadano } from './db.js';

// Configuración de Discord (deberás reemplazar estos valores)
const DISCORD_BOT_TOKEN = '1276412652318494765';
const DISCORD_SERVER_ID = '1319565906401034240';

document.addEventListener('DOMContentLoaded', function() {
    // URL del script de Google Apps - REEMPLAZA ESTO con tu URL después de implementar el script
    const SHEET_URL = 'TU_URL_DE_GOOGLE_SCRIPT';
    const form = document.querySelector('.cedula-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const discordUserInput = document.getElementById('discordUser');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    const fotoInput = document.getElementById('fotoPersonaje');
    const preview = document.getElementById('preview');

    function showNotification(message, isSuccess = true) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336';
        notification.style.display = 'block';
        
        // Animar la notificación
        notification.style.animation = 'fadeIn 0.5s';
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.5s';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 500);
        }, 5000);
    }

    // Validación de contraseña mientras el usuario escribe
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strengthDiv = document.querySelector('.password-strength');
        
        // Criterios de validación
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);

        let strength = 0;
        let message = '';

        if (minLength) strength++;
        if (hasUpperCase) strength++;
        if (hasLowerCase) strength++;
        if (hasNumbers) strength++;
        if (hasSpecialChar) strength++;

        // Mostrar mensaje según la fortaleza
        switch(strength) {
            case 0:
            case 1:
                message = '<span style="color: red">Muy débil</span>';
                break;
            case 2:
            case 3:
                message = '<span style="color: orange">Moderada</span>';
                break;
            case 4:
            case 5:
                message = '<span style="color: green">Fuerte</span>';
                break;
        }

        strengthDiv.innerHTML = `Fortaleza: ${message}`;
    });

    // Validación del formato de usuario de Discord
    async function validateDiscordUser(discordTag) {
        const discordRegex = /^.{3,32}#[0-9]{4}$/;
        if (!discordRegex.test(discordTag)) {
            return { valid: false, message: 'Formato inválido. Debe ser Usuario#0000' };
        }

        try {
            // Verificar si el usuario está en el servidor
            const response = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/members/search?query=${encodeURIComponent(discordTag)}`, {
                headers: {
                    'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al verificar usuario de Discord');
            }

            const data = await response.json();
            return {
                valid: data.length > 0,
                message: data.length > 0 ? 'Usuario verificado' : 'Usuario no encontrado en el servidor'
            };
        } catch (error) {
            console.error('Error:', error);
            return { valid: false, message: 'Error al verificar usuario' };
        }
    }

    // Validación de edad (mínimo 18 años)
    function validateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age >= 18;
    }

    // Previsualización de imagen
    fotoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Verificar el tipo de archivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor, sube solo archivos de imagen.');
                this.value = '';
                preview.style.display = 'none';
                return;
            }

            // Verificar el tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen no debe superar los 5MB.');
                this.value = '';
                preview.style.display = 'none';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Manejador del envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validar el formulario
        if (!validarFormulario()) {
            return;
        }

        // Mostrar mensaje de carga
        showNotification('Enviando registro...', true);

        // Crear objeto con los datos del formulario
        const formData = {
            nombres: document.getElementById('nombres').value,
            apellidos: document.getElementById('apellidos').value,
            nacionalidad: document.getElementById('nacionalidad').value,
            fotoPersonaje: preview.src,
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            lugarNacimiento: document.getElementById('lugarNacimiento').value,
            sexo: document.getElementById('sexo').value,
            discordUser: document.getElementById('discordUser').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            showNotification('¡Registro completado! Tus datos se han guardado en el sistema.', true);
            
            // Esperar 2 segundos antes de redireccionar
            setTimeout(() => {
                form.reset();
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al procesar el registro. Por favor, intenta nuevamente.', false);
        }
    });

    // Función de validación
    function validarFormulario() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return false;
        }

        // Validar edad (18+)
        const fechaNacimiento = new Date(document.getElementById('fechaNacimiento').value);
        const edad = calcularEdad(fechaNacimiento);
        if (edad < 18) {
            alert('Debes ser mayor de 18 años para registrarte');
            return false;
        }

        return true;
    }

    function calcularEdad(fechaNacimiento) {
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }
        return edad;
    }
});
