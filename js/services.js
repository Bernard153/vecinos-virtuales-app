// ========== MÓDULO SERVICIOS ==========

VV.services = {
    // Servicios por defecto (disponibles en todos los barrios)
    defaultServices: [
        { id: 'emergency-1', serviceName: '🚑 Ambulancia', category: 'Emergencia', description: 'Servicio de emergencias médicas', providerName: 'SAME', contact: '107', availability: '24/7', price: 'Gratuito', rating: 5, isDefault: true, isEmergency: true },
        { id: 'emergency-2', serviceName: '🚒 Bomberos', category: 'Emergencia', description: 'Servicio de bomberos', providerName: 'Bomberos', contact: '100', availability: '24/7', price: 'Gratuito', rating: 5, isDefault: true, isEmergency: true },
        { id: 'emergency-3', serviceName: '👮 Policía', category: 'Emergencia', description: 'Servicio policial', providerName: 'Policía', contact: '911', availability: '24/7', price: 'Gratuito', rating: 5, isDefault: true, isEmergency: true },
        { id: 'default-1', serviceName: 'Plomería de Emergencia', category: 'Plomería', description: 'Servicio de plomería 24/7', providerName: 'Servicio Municipal', contact: '911', availability: '24/7', price: 'Según trabajo', rating: 5, isDefault: true },
        { id: 'default-2', serviceName: 'Electricidad', category: 'Electricidad', description: 'Instalaciones y reparaciones eléctricas', providerName: 'Servicio Municipal', contact: '911', availability: 'Lun-Vie 8-18hs', price: 'Según trabajo', rating: 5, isDefault: true },
        { id: 'default-3', serviceName: 'Recolección de Residuos', category: 'Limpieza', description: 'Servicio de recolección de basura', providerName: 'Municipalidad', contact: '147', availability: 'Según calendario', price: 'Gratuito', rating: 5, isDefault: true }
    ],
    
    // Obtener servicios de emergencia personalizados
    getEmergencyServices() {
        const saved = localStorage.getItem('emergencyServices');
        return saved ? JSON.parse(saved) : [];
    },
    
    // Guardar servicios de emergencia
    saveEmergencyServices(services) {
        localStorage.setItem('emergencyServices', JSON.stringify(services));
    },
    
    // Cargar servicios
    load() {
        const container = document.getElementById('services-list');
        
        // Combinar servicios por defecto con servicios del barrio
        const neighborhoodServices = VV.data.services.filter(s => 
            !s.neighborhood || s.neighborhood === VV.data.neighborhood
        );
        
        // Combinar servicios de emergencia personalizados
        const customEmergency = VV.services.getEmergencyServices();
        
        const allServices = [...VV.services.defaultServices, ...customEmergency, ...neighborhoodServices];
        
        container.innerHTML = allServices.map(service => `
            <div class="service-card">
                <div class="card-header">
                    <h3>${service.serviceName}${service.isDefault ? ' <span style="font-size: 0.7rem; color: var(--primary-blue);">★ OFICIAL</span>' : ''}</h3>
                    <div style="display: flex; align-items: center; gap: 0.25rem; color: var(--warning-orange);">
                        ${VV.services.generateStars(service.rating || 5)}
                        <span style="margin-left: 0.25rem; font-weight: 600;">${service.rating || 5}</span>
                    </div>
                </div>
                <p><strong>Proveedor:</strong> ${service.providerName}</p>
                <p><strong>Categoría:</strong> ${service.category}</p>
                <p style="color: var(--gray-700); margin: 0.5rem 0;">${service.description}</p>
                <div style="margin: 1rem 0; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                    <p style="margin-bottom: 0.5rem;"><i class="fas fa-clock"></i> ${service.availability}</p>
                    <p style="margin-bottom: 0.5rem;"><i class="fas fa-phone"></i> ${service.contact}</p>
                    ${service.price ? `<p><i class="fas fa-dollar-sign"></i> ${service.price}</p>` : ''}
                </div>
                <button class="btn-primary" onclick="VV.services.contact('${service.contact}')" style="width: 100%;">
                    <i class="fas fa-phone"></i> Contactar
                </button>
            </div>
        `).join('');
    },
    
    // Generar estrellas
    generateStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
        if (half) stars += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < 5 - Math.ceil(rating); i++) stars += '<i class="far fa-star"></i>';
        
        return stars;
    },
    
    // Mostrar formulario
    showForm(serviceId = null) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const service = serviceId ? VV.data.services.find(s => s.id === serviceId) : null;
        const isEdit = service !== null;
        
        let overlay = document.getElementById('service-form-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'service-form-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="modal-form">
                <h3><i class="fas fa-${isEdit ? 'edit' : 'briefcase'}"></i> ${isEdit ? 'Editar' : 'Ofrecer'} Servicio</h3>
                <form id="service-form">
                    <div class="form-group">
                        <label>Nombre del servicio *</label>
                        <input type="text" id="service-name" value="${service?.serviceName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Categoría *</label>
                        <select id="service-category" required>
                            <option value="">Seleccionar</option>
                            <option value="Plomería" ${service?.category === 'Plomería' ? 'selected' : ''}>Plomería</option>
                            <option value="Electricidad" ${service?.category === 'Electricidad' ? 'selected' : ''}>Electricidad</option>
                            <option value="Carpintería" ${service?.category === 'Carpintería' ? 'selected' : ''}>Carpintería</option>
                            <option value="Limpieza" ${service?.category === 'Limpieza' ? 'selected' : ''}>Limpieza</option>
                            <option value="Jardinería" ${service?.category === 'Jardinería' ? 'selected' : ''}>Jardinería</option>
                            <option value="Tecnología" ${service?.category === 'Tecnología' ? 'selected' : ''}>Tecnología</option>
                            <option value="Educación" ${service?.category === 'Educación' ? 'selected' : ''}>Educación</option>
                            <option value="Otros" ${service?.category === 'Otros' ? 'selected' : ''}>Otros</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Descripción *</label>
                        <textarea id="service-description" rows="3" required>${service?.description || ''}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Teléfono *</label>
                            <input type="tel" id="service-contact" value="${service?.contact || VV.data.user?.phone || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Precio (opcional)</label>
                            <input type="text" id="service-price" value="${service?.price || ''}" placeholder="Ej: Desde $2000">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Disponibilidad *</label>
                        <input type="text" id="service-availability" value="${service?.availability || ''}" placeholder="Ej: Lunes a Viernes 9-18hs" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="VV.services.closeForm()">Cancelar</button>
                        <button type="submit" class="btn-save">
                            <i class="fas fa-save"></i> ${isEdit ? 'Actualizar' : 'Publicar'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        overlay.classList.add('active');
        
        document.getElementById('service-form').onsubmit = (e) => {
            e.preventDefault();
            VV.services.save(service);
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) VV.services.closeForm();
        };
    },
    
    // Cerrar formulario
    closeForm() {
        const overlay = document.getElementById('service-form-overlay');
        if (overlay) overlay.classList.remove('active');
    },
    
    // Guardar servicio
    save(existing) {
        const formData = {
            serviceName: document.getElementById('service-name').value.trim(),
            category: document.getElementById('service-category').value,
            description: document.getElementById('service-description').value.trim(),
            contact: document.getElementById('service-contact').value.trim(),
            price: document.getElementById('service-price').value.trim(),
            availability: document.getElementById('service-availability').value.trim()
        };
        
        if (!formData.serviceName || !formData.category || !formData.description || !formData.contact || !formData.availability) {
            alert('Completa todos los campos obligatorios');
            return;
        }
        
        if (existing) {
            VV.data.services[index] = { ...existing, ...formData };
        } else {
            VV.data.services.push({
                id: VV.utils.generateId(),
                ...formData,
                rating: 0,
                reviews: 0,
                userId: VV.data.user.id,
                userName: VV.data.user.name,
                neighborhood: VV.data.neighborhood,
                createdAt: new Date().toISOString()
            });
        }
        
        // Guardar en localStorage
        localStorage.setItem('vecinosVirtuales_services', JSON.stringify(VV.data.services));
        
        VV.services.load();
        VV.utils.showSuccess(existing ? 'Servicio actualizado' : 'Servicio publicado');
    },
    
    // Contactar servicio
    contact(phone) {
        window.open(`tel:${phone}`, '_blank');
    },
    
    // Buscar servicios
    search() {
        const searchInput = document.getElementById('service-search');
        const categorySelect = document.getElementById('service-category-filter');
        const container = document.getElementById('services-list');
        
        if (!searchInput || !categorySelect) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const categoryFilter = categorySelect.value;
        
        // Combinar servicios por defecto con servicios del barrio
        const neighborhoodServices = VV.data.services.filter(s => 
            !s.neighborhood || s.neighborhood === VV.data.neighborhood
        );
        
        // Combinar servicios de emergencia personalizados
        const customEmergency = VV.services.getEmergencyServices();
        
        let allServices = [...VV.services.defaultServices, ...customEmergency, ...neighborhoodServices];
        
        // Si no hay filtros, mostrar todos
        if (!searchTerm && !categoryFilter) {
            VV.services.renderServices(allServices, container);
            return;
        }
        
        // Filtrar por búsqueda
        if (searchTerm) {
            allServices = allServices.filter(s => 
                (s.serviceName && s.serviceName.toLowerCase().includes(searchTerm)) ||
                (s.description && s.description.toLowerCase().includes(searchTerm)) ||
                (s.providerName && s.providerName.toLowerCase().includes(searchTerm)) ||
                (s.category && s.category.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filtrar por categoría
        if (categoryFilter) {
            allServices = allServices.filter(s => s.category === categoryFilter);
        }
        
        VV.services.renderServices(allServices, container);
    },
    
    // Renderizar servicios
    renderServices(services, container) {
        if (services.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-600);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No se encontraron servicios</h3>
                    <p>Intenta con otros términos de búsqueda</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = services.map(service => `
            <div class="service-card">
                <div class="card-header">
                    <h3>${service.serviceName}${service.isDefault ? ' <span style="font-size: 0.7rem; color: var(--primary-blue);">★ OFICIAL</span>' : ''}</h3>
                    <div style="display: flex; align-items: center; gap: 0.25rem; color: var(--warning-orange);">
                        ${VV.services.generateStars(service.rating || 5)}
                        <span style="margin-left: 0.25rem; font-weight: 600;">${service.rating || 5}</span>
                    </div>
                </div>
                <p><strong>Proveedor:</strong> ${service.providerName}</p>
                <p><strong>Categoría:</strong> ${service.category}</p>
                <p style="color: var(--gray-700); margin: 0.5rem 0;">${service.description}</p>
                <div style="margin: 1rem 0; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                    <p style="margin-bottom: 0.5rem;"><i class="fas fa-clock"></i> ${service.availability}</p>
                    <p style="margin-bottom: 0.5rem;"><i class="fas fa-phone"></i> ${service.contact}</p>
                    ${service.price ? `<p><i class="fas fa-dollar-sign"></i> ${service.price}</p>` : ''}
                </div>
                <button class="btn-primary" onclick="VV.services.contact('${service.contact}')" style="width: 100%;">
                    <i class="fas fa-phone"></i> Contactar
                </button>
            </div>
        `).join('');
    }
};

console.log('✅ Módulo SERVICES cargado');
