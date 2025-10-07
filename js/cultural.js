// ========== MÓDULO CULTURAL ==========

VV.cultural = {
    // Cargar posts culturales
    load() {
        const container = document.getElementById('cultural-posts');
        
        // Filtrar solo posts del mismo barrio
        const neighborhoodPosts = VV.data.culturalPosts.filter(p => 
            !p.neighborhood || p.neighborhood === VV.data.neighborhood
        );
        
        if (neighborhoodPosts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-600);">
                    <i class="fas fa-palette" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No hay publicaciones aún</h3>
                    <p>Comparte arte, eventos o propón un trueque</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = neighborhoodPosts.map(post => `
            <div class="cultural-card">
                <div class="card-header">
                    <h3>${post.title}</h3>
                    <span class="badge" style="background: rgba(139, 92, 246, 0.1); color: var(--primary-purple);">${post.type}</span>
                </div>
                <p><strong>Por:</strong> ${post.userName}</p>
                
                ${post.mediaType === 'image' && post.mediaUrl ? `
                    <div style="margin: 1rem 0;">
                        <img src="${post.mediaUrl}" alt="${post.title}" style="width: 100%; border-radius: 8px; max-height: 300px; object-fit: cover;">
                    </div>
                ` : ''}
                
                ${post.mediaType === 'video' && post.mediaUrl ? `
                    <div style="margin: 1rem 0;">
                        <video controls style="width: 100%; border-radius: 8px; max-height: 300px;">
                            <source src="${post.mediaUrl}" type="video/mp4">
                            Tu navegador no soporta videos.
                        </video>
                    </div>
                ` : ''}
                
                <p style="color: var(--gray-700); margin: 0.5rem 0; white-space: pre-wrap;">${post.description}</p>
                <div class="card-footer">
                    <button class="like-btn" onclick="VV.cultural.like('${post.id}')">
                        <i class="fas fa-heart"></i> ${post.likes}
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Mostrar formulario
    showForm(postId = null) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const post = postId ? VV.data.culturalPosts.find(p => p.id === postId) : null;
        const isEdit = post !== null;
        
        let overlay = document.getElementById('cultural-form-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'cultural-form-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="modal-form">
                <h3><i class="fas fa-${isEdit ? 'edit' : 'palette'}"></i> ${isEdit ? 'Editar' : 'Compartir'} Arte</h3>
                <form id="cultural-form">
                    <div class="form-group">
                        <label>Título *</label>
                        <input type="text" id="cultural-title" value="${post?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Tipo *</label>
                        <select id="cultural-type" required>
                            <option value="">Seleccionar</option>
                            <optgroup label="Cultural">
                                <option value="Fotografía" ${post?.type === 'Fotografía' ? 'selected' : ''}>Fotografía</option>
                                <option value="Pintura" ${post?.type === 'Pintura' ? 'selected' : ''}>Pintura</option>
                                <option value="Música" ${post?.type === 'Música' ? 'selected' : ''}>Música</option>
                                <option value="Poesía" ${post?.type === 'Poesía' ? 'selected' : ''}>Poesía</option>
                                <option value="Evento" ${post?.type === 'Evento' ? 'selected' : ''}>Evento</option>
                                <option value="Video" ${post?.type === 'Video' ? 'selected' : ''}>Video</option>
                            </optgroup>
                            <optgroup label="Trueque">
                                <option value="🔄 Trueque" ${post?.type === '🔄 Trueque' ? 'selected' : ''}>🔄 Trueque</option>
                            </optgroup>
                            <optgroup label="Otros">
                                <option value="Otros" ${post?.type === 'Otros' ? 'selected' : ''}>Otros</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Descripción / Texto *</label>
                        <textarea id="cultural-description" rows="4" required placeholder="Comparte tu texto, poesía, o descripción...">${post?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Multimedia</label>
                        <select id="cultural-media-type" onchange="VV.cultural.toggleMediaInput()">
                            <option value="">Sin multimedia</option>
                            <option value="image" ${post?.mediaType === 'image' ? 'selected' : ''}>Imagen</option>
                            <option value="video" ${post?.mediaType === 'video' ? 'selected' : ''}>Video</option>
                        </select>
                    </div>
                    <div class="form-group" id="media-input-container" style="display: ${post?.mediaType ? 'block' : 'none'};">
                        <label>Subir archivo</label>
                        <input type="file" id="cultural-media-file" accept="image/*,video/*">
                        <p style="font-size: 0.85rem; color: var(--gray-600); margin-top: 0.5rem;">
                            <i class="fas fa-info-circle"></i> Soporta imágenes (JPG, PNG) y videos (MP4)
                        </p>
                        ${post?.mediaUrl ? `<p style="font-size: 0.85rem; color: var(--success-green); margin-top: 0.5rem;"><i class="fas fa-check"></i> Archivo actual cargado</p>` : ''}
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="VV.cultural.closeForm()">Cancelar</button>
                        <button type="submit" class="btn-save">
                            <i class="fas fa-save"></i> ${isEdit ? 'Actualizar' : 'Publicar'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        overlay.classList.add('active');
        
        document.getElementById('cultural-form').onsubmit = (e) => {
            e.preventDefault();
            VV.cultural.save(post);
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) VV.cultural.closeForm();
        };
    },
    
    // Cerrar formulario
    closeForm() {
        const overlay = document.getElementById('cultural-form-overlay');
        if (overlay) overlay.classList.remove('active');
    },
    
    // Toggle media input
    toggleMediaInput() {
        const mediaType = document.getElementById('cultural-media-type').value;
        const container = document.getElementById('media-input-container');
        container.style.display = mediaType ? 'block' : 'none';
    },
    
    // Guardar post
    async save(existing) {
        const formData = {
            title: document.getElementById('cultural-title').value.trim(),
            type: document.getElementById('cultural-type').value,
            description: document.getElementById('cultural-description').value.trim(),
            mediaType: document.getElementById('cultural-media-type').value,
            mediaUrl: existing?.mediaUrl || ''
        };
        
        if (!formData.title || !formData.type || !formData.description) {
            alert('Completa todos los campos obligatorios');
            return;
        }
        
        // Procesar archivo multimedia si existe
        const fileInput = document.getElementById('cultural-media-file');
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            // Convertir a base64 para almacenamiento local
            const reader = new FileReader();
            reader.onload = function(e) {
                formData.mediaUrl = e.target.result;
                VV.cultural.savePost(existing, formData);
            };
            reader.readAsDataURL(file);
        } else {
            VV.cultural.savePost(existing, formData);
        }
    },
    
    // Guardar post (helper)
    savePost(existing, formData) {
        if (existing) {
            const index = VV.data.culturalPosts.findIndex(p => p.id === existing.id);
            VV.data.culturalPosts[index] = { ...existing, ...formData };
        } else {
            VV.data.culturalPosts.push({
                id: VV.utils.generateId(),
                ...formData,
                userId: VV.data.user.id,
                userName: VV.data.user.name,
                neighborhood: VV.data.neighborhood,
                likes: 0,
                createdAt: new Date().toISOString()
            });
        }
        
        // Guardar en localStorage
        localStorage.setItem('vecinosVirtuales_cultural', JSON.stringify(VV.data.culturalPosts));
        
        VV.cultural.closeForm();
        VV.cultural.load();
        VV.utils.showSuccess(existing ? 'Publicación actualizada' : 'Publicación compartida');
    },
    
    // Dar like
    like(postId) {
        const post = VV.data.culturalPosts.find(p => p.id === postId);
        if (post) {
            post.likes += 1;
            
            // Guardar en localStorage
            localStorage.setItem('vecinosVirtuales_cultural', JSON.stringify(VV.data.culturalPosts));
            
            VV.cultural.load();
        }
    }
};

console.log('✅ Módulo CULTURAL cargado');
