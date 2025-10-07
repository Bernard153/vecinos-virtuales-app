// ========== INICIALIZACIÓN DE LA APLICACIÓN ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Vecinos Virtuales V2 - Iniciando...');
    
    // Verificar aceptación de términos y condiciones
    const termsAccepted = JSON.parse(localStorage.getItem('termsAccepted') || 'null');
    
    if (!termsAccepted || !termsAccepted.accepted) {
        // Redirigir a página de términos
        console.log('⚠️ Términos no aceptados. Redirigiendo...');
        window.location.href = 'terminos.html';
        return;
    }
    
    // Mostrar pantalla de carga
    VV.utils.showScreen('loading-screen');
    
    // Verificar usuario existente
    setTimeout(() => {
        if (VV.auth.checkExistingUser()) {
            // Usuario ya registrado
            VV.auth.startApp();
        } else {
            // Nuevo usuario
            VV.utils.showScreen('location-screen');
            VV.auth.requestGeolocation();
        }
    }, 1500);
    
    console.log('✅ Aplicación inicializada correctamente');
});

console.log('✅ Módulo APP cargado');
