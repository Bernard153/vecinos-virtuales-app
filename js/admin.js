// ========== MÓDULO ADMINISTRACIÓN ==========

VV.admin = {
    sponsorRequests: [],
    
    // Cargar panel de admin
    load() {
        if (!VV.utils.isAdmin()) {
            alert('No tienes permisos de administrador');
            return;
        }
        
        VV.admin.loadSponsorRequests();
        VV.admin.loadSponsors();
    },
    
    // Cargar solicitudes pendientes
    loadSponsorRequests() {
        const requests = JSON.parse(localStorage.getItem('sponsorRequests') || '[]');
        const pending = requests.filter(r => r.status === 'pending');
        
        const container = document.getElementById('sponsor-requests-container');
        const list = document.getElementById('sponsor-requests-list');
        
        if (pending.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        list.innerHTML = pending.map(req => `
            <div class="sponsor-request-card">
                <div class="request-header">
                    <div>
                        <h4>${req.logo} ${req.name}</h4>
                        <p style="color: var(--gray-600); font-size: 0.85rem; margin-top: 0.25rem;">
                            Solicitado por: ${req.userName} (${req.userEmail})
                        </p>
                    </div>
                    <span class="request-tier-badge ${req.tier}">${req.tier.toUpperCase()}</span>
                </div>
                <div class="request-info">
                    <p><i class="fas fa-info-circle"></i> ${req.description}</p>
                    <p><i class="fas fa-phone"></i> ${req.contact}</p>
                    ${req.website ? `<p><i class="fas fa-globe"></i> ${req.website}</p>` : ''}
                </div>
                <div class="request-actions">
                    <button class="btn-approve" onclick="VV.admin.approveSponsorRequest('${req.id}')">
                        <i class="fas fa-check"></i> Aprobar
                    </button>
                    <button class="btn-reject" onclick="VV.admin.rejectSponsorRequest('${req.id}')">
                        <i class="fas fa-times"></i> Rechazar
                    </button>
                </div>
            </div>
        `).join('');
        
        // Badge en menú
        const adminMenuItem = document.querySelector('[data-section="admin"]');
        if (adminMenuItem && pending.length > 0) {
            let badge = adminMenuItem.querySelector('.notification-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notification-badge';
                badge.style.cssText = 'background: var(--error-red); color: white; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 10px; margin-left: auto;';
                adminMenuItem.appendChild(badge);
            }
            badge.textContent = pending.length;
        }
    },
    
    // Aprobar solicitud
    approveSponsorRequest(requestId) {
        const requests = JSON.parse(localStorage.getItem('sponsorRequests') || '[]');
        const request = requests.find(r => r.id === requestId);
        
        if (!request) return;
        
        // Crear anunciante
        const newSponsor = {
            id: VV.utils.generateId(),
            name: request.name,
            description: request.description,
            logo: request.logo,
            tier: request.tier,
            contact: request.contact,
            website: request.website,
            active: true,
            views: 0,
            clicks: 0
        };
        
        VV.data.sponsors.push(newSponsor);
        
        // Actualizar solicitud
        request.status = 'approved';
        localStorage.setItem('sponsorRequests', JSON.stringify(requests));
        
        VV.admin.load();
        VV.banner.init();
        VV.utils.showSuccess('Anunciante aprobado');
    },
    
    // Rechazar solicitud
    rejectSponsorRequest(requestId) {
        if (!confirm('¿Rechazar esta solicitud?')) return;
        
        const requests = JSON.parse(localStorage.getItem('sponsorRequests') || '[]');
        const request = requests.find(r => r.id === requestId);
        
        if (request) {
            request.status = 'rejected';
            localStorage.setItem('sponsorRequests', JSON.stringify(requests));
            VV.admin.load();
            VV.utils.showSuccess('Solicitud rechazada');
        }
    },
    
    // Cargar anunciantes
    loadSponsors() {
        const container = document.getElementById('sponsors-management');
        
        if (VV.data.sponsors.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">No hay anunciantes</p>';
            return;
        }
        
        container.innerHTML = VV.data.sponsors.map(sponsor => `
            <div class="sponsor-management-card">
                <div class="sponsor-management-header">
                    <div class="sponsor-logo">${sponsor.logo}</div>
                    <span class="sponsor-tier ${sponsor.tier}">${sponsor.tier.toUpperCase()}</span>
                </div>
                <h4>${sponsor.name}</h4>
                <p>${sponsor.description}</p>
                <div class="sponsor-stats">
                    <p><i class="fas fa-eye"></i> ${sponsor.views} vistas</p>
                    <p><i class="fas fa-mouse-pointer"></i> ${sponsor.clicks} clics</p>
                    <p><i class="fas fa-phone"></i> ${sponsor.contact}</p>
                </div>
                <div style="margin: 0.5rem 0; padding: 0.5rem; background: var(--gray-50); border-radius: 4px;">
                    <p style="font-size: 0.85rem; color: var(--gray-600); margin: 0;">
                        <i class="fas fa-map-marker-alt"></i> 
                        <strong>Visible en:</strong> 
                        ${sponsor.neighborhoods === 'all' || !sponsor.neighborhoods 
                            ? '<span style="color: var(--success-green);">Todos los barrios</span>' 
                            : Array.isArray(sponsor.neighborhoods) 
                                ? sponsor.neighborhoods.join(', ') 
                                : sponsor.neighborhoods
                        }
                    </p>
                </div>
                <div class="sponsor-management-actions">
                    <button class="btn-edit" onclick="VV.admin.showSponsorForm('${sponsor.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-toggle ${sponsor.active ? '' : 'inactive'}" onclick="VV.admin.toggleSponsor('${sponsor.id}')">
                        <i class="fas fa-${sponsor.active ? 'pause' : 'play'}"></i> ${sponsor.active ? 'Pausar' : 'Activar'}
                    </button>
                    <button class="btn-delete" onclick="VV.admin.deleteSponsor('${sponsor.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Mostrar formulario de anunciante
    showSponsorForm(sponsorId = null) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const sponsor = sponsorId ? VV.data.sponsors.find(s => s.id === sponsorId) : null;
        const isEdit = sponsor !== null;
        
        let overlay = document.getElementById('sponsor-form-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sponsor-form-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="modal-form">
                <h3><i class="fas fa-${isEdit ? 'edit' : 'bullhorn'}"></i> ${isEdit ? 'Editar' : 'Nuevo'} Anunciante</h3>
                <form id="sponsor-form">
                    <div class="form-group">
                        <label>Nombre del negocio *</label>
                        <input type="text" id="sponsor-name" value="${sponsor?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Descripción *</label>
                        <input type="text" id="sponsor-description" value="${sponsor?.description || ''}" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Logo (emoji) *</label>
                            <input type="text" id="sponsor-logo" value="${sponsor?.logo || ''}" placeholder="🏪" required>
                        </div>
                        <div class="form-group">
                            <label>Nivel *</label>
                            <select id="sponsor-tier" required>
                                <option value="">Seleccionar</option>
                                <option value="premium" ${sponsor?.tier === 'premium' ? 'selected' : ''}>Premium</option>
                                <option value="gold" ${sponsor?.tier === 'gold' ? 'selected' : ''}>Gold</option>
                                <option value="silver" ${sponsor?.tier === 'silver' ? 'selected' : ''}>Silver</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Teléfono *</label>
                        <input type="tel" id="sponsor-contact" value="${sponsor?.contact || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Sitio web</label>
                        <input type="url" id="sponsor-website" value="${sponsor?.website || ''}" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label>Imagen del banner (opcional)</label>
                        <input type="file" id="sponsor-image" accept="image/*">
                        <p style="font-size: 0.85rem; color: var(--gray-600); margin-top: 0.5rem;">
                            <i class="fas fa-info-circle"></i> Si no subes imagen, se usará el emoji como logo
                        </p>
                        ${sponsor?.imageUrl ? `<p style="font-size: 0.85rem; color: var(--success-green); margin-top: 0.5rem;"><i class="fas fa-check"></i> Imagen actual cargada</p>` : ''}
                    </div>
                    <div class="form-group">
                        <label>Mostrar en barrios *</label>
                        <select id="sponsor-visibility" onchange="VV.admin.toggleNeighborhoodSelection()">
                            <option value="all" ${!sponsor?.neighborhoods || sponsor?.neighborhoods === 'all' ? 'selected' : ''}>Todos los barrios</option>
                            <option value="specific" ${sponsor?.neighborhoods && sponsor?.neighborhoods !== 'all' ? 'selected' : ''}>Barrios específicos</option>
                        </select>
                    </div>
                    <div class="form-group" id="neighborhoods-selection" style="display: ${sponsor?.neighborhoods && sponsor?.neighborhoods !== 'all' ? 'block' : 'none'};">
                        <label>Seleccionar barrios</label>
                        <div id="neighborhoods-checkboxes" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--gray-300); border-radius: 8px; padding: 1rem;">
                            <!-- Se llenará dinámicamente -->
                        </div>
                        <p style="font-size: 0.85rem; color: var(--gray-600); margin-top: 0.5rem;">
                            <i class="fas fa-info-circle"></i> Selecciona uno o más barrios donde se mostrará el anuncio
                        </p>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="sponsor-active" ${sponsor?.active !== false ? 'checked' : ''}> 
                            Anuncio activo
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="VV.admin.closeSponsorForm()">Cancelar</button>
                        <button type="submit" class="btn-save">
                            <i class="fas fa-save"></i> ${isEdit ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        overlay.classList.add('active');
        
        // Poblar lista de barrios
        VV.admin.loadNeighborhoodCheckboxes(sponsor);
        
        document.getElementById('sponsor-form').onsubmit = (e) => {
            e.preventDefault();
            VV.admin.saveSponsor(sponsor);
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) VV.admin.closeSponsorForm();
        };
    },
    
    // Cargar checkboxes de barrios
    loadNeighborhoodCheckboxes(sponsor) {
        const container = document.getElementById('neighborhoods-checkboxes');
        const neighborhoods = VV.auth.getExistingNeighborhoods().filter(n => n !== 'Administrador');
        
        if (neighborhoods.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-600); padding: 0.5rem;">No hay barrios registrados aún</p>';
            return;
        }
        
        const selectedNeighborhoods = sponsor?.neighborhoods && sponsor.neighborhoods !== 'all' 
            ? (Array.isArray(sponsor.neighborhoods) ? sponsor.neighborhoods : [sponsor.neighborhoods])
            : [];
        
        container.innerHTML = neighborhoods.map(n => `
            <label style="display: block; padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--gray-200);">
                <input type="checkbox" name="neighborhood" value="${n}" ${selectedNeighborhoods.includes(n) ? 'checked' : ''} style="margin-right: 0.5rem;">
                ${n}
            </label>
        `).join('');
    },
    
    // Toggle selección de barrios
    toggleNeighborhoodSelection() {
        const visibility = document.getElementById('sponsor-visibility').value;
        const selection = document.getElementById('neighborhoods-selection');
        selection.style.display = visibility === 'specific' ? 'block' : 'none';
    },
    
    // Cerrar formulario
    closeSponsorForm() {
        const overlay = document.getElementById('sponsor-form-overlay');
        if (overlay) overlay.classList.remove('active');
    },
    
    // Guardar anunciante
    async saveSponsor(existing) {
        // Obtener barrios seleccionados
        const visibility = document.getElementById('sponsor-visibility').value;
        let neighborhoods = 'all';
        
        if (visibility === 'specific') {
            const checkboxes = document.querySelectorAll('input[name="neighborhood"]:checked');
            if (checkboxes.length === 0) {
                alert('Debes seleccionar al menos un barrio');
                return;
            }
            neighborhoods = Array.from(checkboxes).map(cb => cb.value);
        }
        
        const formData = {
            name: document.getElementById('sponsor-name').value.trim(),
            description: document.getElementById('sponsor-description').value.trim(),
            logo: document.getElementById('sponsor-logo').value.trim(),
            tier: document.getElementById('sponsor-tier').value,
            contact: document.getElementById('sponsor-contact').value.trim(),
            website: document.getElementById('sponsor-website').value.trim(),
            active: document.getElementById('sponsor-active').checked,
            neighborhoods: neighborhoods,
            imageUrl: existing?.imageUrl || ''
        };
        
        if (!formData.name || !formData.description || !formData.logo || !formData.tier || !formData.contact) {
            alert('Completa todos los campos obligatorios');
            return;
        }
        
        // Procesar imagen si existe
        const imageInput = document.getElementById('sponsor-image');
        if (imageInput.files && imageInput.files[0]) {
            const file = imageInput.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                formData.imageUrl = e.target.result;
                VV.admin.saveSponsorData(existing, formData);
            };
            reader.readAsDataURL(file);
        } else {
            VV.admin.saveSponsorData(existing, formData);
        }
    },
    
    // Guardar datos del anunciante (helper)
    saveSponsorData(existing, formData) {
        if (existing) {
            const index = VV.data.sponsors.findIndex(s => s.id === existing.id);
            VV.data.sponsors[index] = { ...existing, ...formData };
        } else {
            VV.data.sponsors.push({
                id: VV.utils.generateId(),
                ...formData,
                views: 0,
                clicks: 0
            });
        }
        
        VV.admin.closeSponsorForm();
        VV.admin.loadSponsors();
        VV.banner.init();
        VV.utils.showSuccess(existing ? 'Anunciante actualizado' : 'Anunciante creado');
    },
    
    // Toggle anunciante
    toggleSponsor(sponsorId) {
        const sponsor = VV.data.sponsors.find(s => s.id === sponsorId);
        if (sponsor) {
            sponsor.active = !sponsor.active;
            VV.admin.loadSponsors();
            VV.banner.init();
            VV.utils.showSuccess(sponsor.active ? 'Anunciante activado' : 'Anunciante pausado');
        }
    },
    
    // Eliminar anunciante
    deleteSponsor(sponsorId) {
        if (!confirm('¿Eliminar este anunciante?')) return;
        
        VV.data.sponsors = VV.data.sponsors.filter(s => s.id !== sponsorId);
        VV.admin.loadSponsors();
        VV.banner.init();
        VV.utils.showSuccess('Anunciante eliminado');
    },
    
    // Cambiar tab
    showTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[onclick="VV.admin.showTab('${tabName}')"]`).classList.add('active');
        
        document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`admin-${tabName}`).classList.add('active');
        
        if (tabName === 'stats') VV.admin.loadStats();
        if (tabName === 'moderator-logs') VV.admin.loadModeratorLogs();
    },
    
    // Cargar estadísticas
    loadStats() {
        const totalViews = VV.data.sponsors.reduce((sum, s) => sum + s.views, 0);
        const totalClicks = VV.data.sponsors.reduce((sum, s) => sum + s.clicks, 0);
        
        document.getElementById('banner-views').textContent = totalViews.toLocaleString();
        document.getElementById('banner-clicks').textContent = totalClicks.toLocaleString();
    },
    
    // Gestión de usuarios
    loadUsers() {
        if (!VV.utils.isAdmin()) {
            alert('No tienes permisos');
            return;
        }
        
        const users = VV.auth.getAllUsers();
        const container = document.getElementById('users-management-list');
        
        // Agrupar usuarios por barrio
        const usersByNeighborhood = {};
        users.forEach(user => {
            if (!usersByNeighborhood[user.neighborhood]) {
                usersByNeighborhood[user.neighborhood] = [];
            }
            usersByNeighborhood[user.neighborhood].push(user);
        });
        
        let html = '';
        
        // Mostrar usuarios agrupados por barrio
        Object.keys(usersByNeighborhood).sort().forEach(neighborhood => {
            const neighborhoodUsers = usersByNeighborhood[neighborhood];
            html += `
                <div style="grid-column: 1/-1; margin-top: 1.5rem; padding: 0.75rem; background: var(--gray-100); border-radius: 8px; font-weight: 600; color: var(--gray-700);">
                    <i class="fas fa-map-marker-alt"></i> ${neighborhood} (${neighborhoodUsers.length} usuario${neighborhoodUsers.length !== 1 ? 's' : ''})
                </div>
            `;
            
            html += neighborhoodUsers.map(user => `
                <div class="user-card">
                    <div class="user-info">
                        <h4>${user.name}</h4>
                        <p>${user.email} • ${user.phone}</p>
                        <p style="font-size: 0.85rem; color: var(--gray-500);">
                            <i class="fas fa-map-marker-alt"></i> ${user.neighborhood}
                        </p>
                    </div>
                    <span class="user-role-badge ${user.role}">
                        ${user.role === 'admin' ? '👑 ADMIN' : user.role === 'moderator' ? '🛡️ MODERADOR' : 'USUARIO'}
                    </span>
                    <div class="user-actions">
                        ${user.id !== VV.data.user.id ? `
                            ${user.role === 'moderator' ? 
                                `<button class="btn-edit" onclick="VV.admin.toggleModerator('${user.id}')">
                                    <i class="fas fa-user-minus"></i> Quitar Moderador
                                </button>` :
                                `<button class="btn-approve" onclick="VV.admin.toggleModerator('${user.id}')">
                                    <i class="fas fa-shield-alt"></i> Hacer Moderador
                                </button>`
                            }
                            <button class="btn-delete" onclick="VV.admin.deleteUser('${user.id}')">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        ` : '<span style="color: var(--gray-500); font-size: 0.85rem;">Tu cuenta</span>'}
                    </div>
                </div>
            `).join('');
        });
        
        container.innerHTML = html || '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">No hay usuarios registrados</p>';
    },
    
    // Cambiar rol de usuario
    toggleUserRole(userId) {
        const userKey = `vecinosVirtuales_user_${userId}`;
        const userData = JSON.parse(localStorage.getItem(userKey));
        
        if (!userData) return;
        
        userData.role = userData.role === 'admin' ? 'user' : 'admin';
        localStorage.setItem(userKey, JSON.stringify(userData));
        
        VV.admin.loadUsers();
        VV.utils.showSuccess(`Usuario ${userData.role === 'admin' ? 'promovido a' : 'degradado de'} administrador`);
    },
    
    // Promover/degradar moderador
    toggleModerator(userId) {
        const userKey = `vecinosVirtuales_user_${userId}`;
        const userData = JSON.parse(localStorage.getItem(userKey));
        
        if (!userData) return;
        
        userData.role = userData.role === 'moderator' ? 'user' : 'moderator';
        localStorage.setItem(userKey, JSON.stringify(userData));
        
        VV.admin.loadUsers();
        VV.utils.showSuccess(`Usuario ${userData.role === 'moderator' ? 'promovido a' : 'degradado de'} moderador`);
    },
    
    // Eliminar usuario
    deleteUser(userId) {
        if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
        
        const userKey = `vecinosVirtuales_user_${userId}`;
        localStorage.removeItem(userKey);
        
        VV.admin.loadUsers();
        VV.utils.showSuccess('Usuario eliminado');
    },
    
    // Editar imagen de portada (solo admin)
    editBannerImage() {
        let overlay = document.getElementById('banner-image-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'banner-image-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }
        
        const currentImage = localStorage.getItem('welcomeBannerImage') || '';
        
        overlay.innerHTML = `
            <div class="modal-form">
                <h3><i class="fas fa-image"></i> Configurar Imagen de Portada</h3>
                <p style="color: var(--gray-600); margin-bottom: 1.5rem;">
                    Esta imagen se mostrará en la pantalla de bienvenida del dashboard
                </p>
                <form id="banner-image-form">
                    <div class="form-group">
                        <label>Subir imagen de portada</label>
                        <input type="file" id="banner-image-file" accept="image/*">
                        <p style="font-size: 0.85rem; color: var(--gray-600); margin-top: 0.5rem;">
                            <i class="fas fa-info-circle"></i> Recomendado: 1200x400px
                        </p>
                        ${currentImage ? `<p style="font-size: 0.85rem; color: var(--success-green); margin-top: 0.5rem;"><i class="fas fa-check"></i> Imagen actual configurada</p>` : ''}
                    </div>
                    ${currentImage ? `
                        <div class="form-group">
                            <button type="button" class="btn-delete" onclick="VV.admin.removeBannerImage()" style="width: 100%;">
                                <i class="fas fa-trash"></i> Eliminar Imagen Actual
                            </button>
                        </div>
                    ` : ''}
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="document.getElementById('banner-image-overlay').classList.remove('active')">Cancelar</button>
                        <button type="submit" class="btn-save">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        overlay.classList.add('active');
        
        document.getElementById('banner-image-form').onsubmit = (e) => {
            e.preventDefault();
            VV.admin.saveBannerImage();
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        };
    },
    
    // Guardar imagen de portada
    saveBannerImage() {
        const fileInput = document.getElementById('banner-image-file');
        if (!fileInput.files || !fileInput.files[0]) {
            alert('Por favor selecciona una imagen');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem('welcomeBannerImage', e.target.result);
            document.getElementById('banner-image-overlay').classList.remove('active');
            VV.admin.loadBannerImage();
            VV.utils.showSuccess('Imagen de portada actualizada');
        };
        reader.readAsDataURL(file);
    },
    
    // Eliminar imagen de portada
    removeBannerImage() {
        if (!confirm('¿Eliminar la imagen de portada?')) return;
        
        localStorage.removeItem('welcomeBannerImage');
        document.getElementById('banner-image-overlay').classList.remove('active');
        VV.admin.loadBannerImage();
        VV.utils.showSuccess('Imagen de portada eliminada');
    },
    
    // Cargar imagen de portada
    loadBannerImage() {
        const banner = document.getElementById('welcome-banner');
        const imageUrl = localStorage.getItem('welcomeBannerImage');
        
        if (imageUrl) {
            banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${imageUrl}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.style.minHeight = '250px';
        } else {
            banner.style.backgroundImage = 'linear-gradient(135deg, var(--primary-blue), var(--primary-purple))';
            banner.style.backgroundSize = 'auto';
            banner.style.backgroundPosition = 'initial';
            banner.style.minHeight = 'auto';
        }
    },
    
    // Cargar logs de actividad de moderadores
    loadModeratorLogs() {
        const neighborhoodFilter = document.getElementById('log-filter-neighborhood').value;
        const actionFilter = document.getElementById('log-filter-action').value;
        
        // Cargar todos los logs
        let logs = VV.utils.getModeratorLogs(null, 200);
        
        // Aplicar filtros
        if (neighborhoodFilter) {
            logs = logs.filter(log => log.neighborhood === neighborhoodFilter);
        }
        if (actionFilter) {
            logs = logs.filter(log => log.action === actionFilter);
        }
        
        // Poblar filtro de barrios (solo una vez)
        const neighborhoodSelect = document.getElementById('log-filter-neighborhood');
        if (neighborhoodSelect.options.length === 1) {
            const neighborhoods = [...new Set(VV.utils.getModeratorLogs(null, 500).map(l => l.neighborhood))];
            neighborhoods.forEach(n => {
                const option = document.createElement('option');
                option.value = n;
                option.textContent = n;
                neighborhoodSelect.appendChild(option);
            });
        }
        
        const container = document.getElementById('moderator-logs-list');
        
        if (logs.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">No hay actividad registrada</p>';
            return;
        }
        
        container.innerHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                    <thead style="background: var(--gray-100);">
                        <tr>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--gray-300);">Fecha/Hora</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--gray-300);">Moderador</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--gray-300);">Barrio</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--gray-300);">Acción</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--gray-300);">Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map((log, index) => {
                            const date = new Date(log.timestamp);
                            const actionColor = {
                                'ELIMINAR_USUARIO': 'var(--error-red)',
                                'ELIMINAR_PRODUCTO': 'var(--warning-orange)',
                                'ELIMINAR_PUBLICACION': 'var(--primary-purple)'
                            }[log.action] || 'var(--gray-600)';
                            
                            const actionText = {
                                'ELIMINAR_USUARIO': '🚫 Eliminó Usuario',
                                'ELIMINAR_PRODUCTO': '🗑️ Eliminó Producto',
                                'ELIMINAR_PUBLICACION': '🚫 Eliminó Publicación'
                            }[log.action] || log.action;
                            
                            let detailsText = '';
                            if (log.action === 'ELIMINAR_USUARIO') {
                                detailsText = `Usuario: ${log.details.usuarioNombre}`;
                            } else if (log.action === 'ELIMINAR_PRODUCTO') {
                                detailsText = `Producto: "${log.details.productoNombre}" de ${log.details.vendedor}`;
                            } else if (log.action === 'ELIMINAR_PUBLICACION') {
                                detailsText = `"${log.details.publicacionTitulo}" (${log.details.tipo}) de ${log.details.autor}`;
                            }
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--gray-200); ${index % 2 === 0 ? 'background: var(--gray-50);' : ''}">
                                    <td style="padding: 0.75rem; font-size: 0.85rem; color: var(--gray-600);">
                                        ${date.toLocaleDateString()}<br>
                                        ${date.toLocaleTimeString()}
                                    </td>
                                    <td style="padding: 0.75rem; font-weight: 600;">
                                        ${log.moderatorName}
                                    </td>
                                    <td style="padding: 0.75rem;">
                                        <span style="background: var(--gray-200); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">
                                            ${log.neighborhood}
                                        </span>
                                    </td>
                                    <td style="padding: 0.75rem; color: ${actionColor}; font-weight: 600;">
                                        ${actionText}
                                    </td>
                                    <td style="padding: 0.75rem; font-size: 0.9rem; color: var(--gray-700);">
                                        ${detailsText}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <p style="text-align: center; margin-top: 1rem; color: var(--gray-600); font-size: 0.85rem;">
                Mostrando ${logs.length} registro(s) de actividad
            </p>
        `;
    }
};

// Solicitar ser anunciante (usuarios comunes)
window.requestSponsorStatus = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    let overlay = document.getElementById('sponsor-request-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sponsor-request-overlay';
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
        <div class="modal-form">
            <h3><i class="fas fa-bullhorn"></i> Solicitar ser Anunciante</h3>
            <p style="color: var(--gray-600); margin-bottom: 1.5rem;">
                Envía tu solicitud al administrador para publicar anuncios
            </p>
            <form id="sponsor-request-form">
                <div class="form-group">
                    <label>Nombre del negocio *</label>
                    <input type="text" id="request-name" required>
                </div>
                <div class="form-group">
                    <label>Descripción *</label>
                    <input type="text" id="request-description" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Logo (emoji) *</label>
                        <input type="text" id="request-logo" placeholder="🏪" required>
                    </div>
                    <div class="form-group">
                        <label>Nivel deseado *</label>
                        <select id="request-tier" required>
                            <option value="">Seleccionar</option>
                            <option value="premium">Premium</option>
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Teléfono *</label>
                    <input type="tel" id="request-contact" value="${VV.data.user?.phone || ''}" required>
                </div>
                <div class="form-group">
                    <label>Sitio web</label>
                    <input type="url" id="request-website" placeholder="https://...">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-cancel" onclick="document.getElementById('sponsor-request-overlay').classList.remove('active')">Cancelar</button>
                    <button type="submit" class="btn-save">
                        <i class="fas fa-paper-plane"></i> Enviar Solicitud
                    </button>
                </div>
            </form>
        </div>
    `;
    
    overlay.classList.add('active');
    
    document.getElementById('sponsor-request-form').onsubmit = (e) => {
        e.preventDefault();
        
        const request = {
            id: VV.utils.generateId(),
            name: document.getElementById('request-name').value.trim(),
            description: document.getElementById('request-description').value.trim(),
            logo: document.getElementById('request-logo').value.trim(),
            tier: document.getElementById('request-tier').value,
            contact: document.getElementById('request-contact').value.trim(),
            website: document.getElementById('request-website').value.trim(),
            userId: VV.data.user.id,
            userName: VV.data.user.name,
            userEmail: VV.data.user.email,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        const requests = JSON.parse(localStorage.getItem('sponsorRequests') || '[]');
        requests.push(request);
        localStorage.setItem('sponsorRequests', JSON.stringify(requests));
        
        overlay.classList.remove('active');
        VV.utils.showSuccess('Solicitud enviada. El administrador la revisará pronto.');
    };
    
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    };
}

console.log('✅ Módulo ADMIN cargado');
