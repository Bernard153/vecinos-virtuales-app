// ========== MÓDULO BANNER - 3 CUADROS FIJOS ==========

VV.banner = {
    currentBanners: [],
    rotationInterval: null,
    
    // Inicializar banner
    init() {
        const container = document.getElementById('banner-container');
        
        // Filtrar anunciantes activos y que correspondan al barrio actual
        const activeBanners = VV.data.sponsors.filter(s => {
            if (!s.active) return false;
            
            // Si no tiene barrios definidos o es 'all', mostrar en todos
            if (!s.neighborhoods || s.neighborhoods === 'all') return true;
            
            // Si tiene barrios específicos, verificar si el barrio actual está incluido
            if (Array.isArray(s.neighborhoods)) {
                return s.neighborhoods.includes(VV.data.neighborhood);
            }
            
            return false;
        });
        
        // Siempre mostrar el banner
        container.style.display = 'grid';
        
        // Si no hay banners, mostrar placeholders
        if (activeBanners.length === 0) {
            container.innerHTML = `
                <div class="banner-slide" style="opacity: 0.5;">
                    <div class="banner-logo">🏪</div>
                    <div>
                        <div class="banner-title">Tu Anuncio Aquí</div>
                        <div class="banner-description">Espacio disponible</div>
                    </div>
                </div>
                <div class="banner-slide" style="opacity: 0.5;">
                    <div class="banner-logo">💼</div>
                    <div>
                        <div class="banner-title">Publicita tu Negocio</div>
                        <div class="banner-description">Contacta al admin</div>
                    </div>
                </div>
                <div class="banner-slide" style="opacity: 0.5;">
                    <div class="banner-logo">🎯</div>
                    <div>
                        <div class="banner-title">Llega a tu Barrio</div>
                        <div class="banner-description">Sé Anunciante</div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Guardar todos los banners disponibles
        VV.banner.currentBanners = activeBanners;
        
        // Mostrar 3 banners aleatorios
        VV.banner.rotateBanners();
        
        // Rotar cada 10 segundos
        if (VV.banner.rotationInterval) clearInterval(VV.banner.rotationInterval);
        VV.banner.rotationInterval = setInterval(() => {
            VV.banner.rotateBanners();
        }, 10000);
        
        // Agregar botón para ver todos
        VV.banner.addViewAllButton();
    },
    
    // Rotar banners aleatoriamente
    rotateBanners() {
        const container = document.getElementById('banner-container');
        const shuffled = [...VV.banner.currentBanners].sort(() => Math.random() - 0.5);
        const bannersToShow = shuffled.slice(0, 3);
        
        // Rellenar con placeholders si hay menos de 3
        while (bannersToShow.length < 3) {
            bannersToShow.push({
                logo: '🏪',
                name: 'Espacio Disponible',
                description: 'Tu anuncio aquí',
                tier: 'silver',
                id: 'placeholder-' + bannersToShow.length
            });
        }
        
        container.innerHTML = bannersToShow.map(banner => `
            <div class="banner-slide ${banner.tier}" onclick="VV.banner.click('${banner.id}')">
                ${banner.imageUrl ? 
                    `<div class="banner-image" style="background-image: url('${banner.imageUrl}');"></div>` :
                    `<div class="banner-logo">${banner.logo}</div>`
                }
                <div>
                    <div class="banner-title">${banner.name}</div>
                    <div class="banner-description">${banner.description}</div>
                </div>
            </div>
        `).join('');
    },
    
    // Agregar botón para ver todos
    addViewAllButton() {
        let button = document.getElementById('banner-toggle-btn');
        if (!button) {
            button = document.createElement('button');
            button.id = 'banner-toggle-btn';
            button.className = 'banner-toggle-btn';
            document.body.appendChild(button);
        }
        
        // Siempre mostrar en móviles si hay anunciantes
        if (VV.banner.currentBanners.length > 0) {
            button.innerHTML = '<i class="fas fa-bullhorn"></i> Anunciantes';
            button.onclick = () => VV.banner.showAllSponsors();
            button.style.display = '';
        } else {
            button.style.display = 'none';
        }
    },
    
    // Mostrar todos los anunciantes en folleto
    showAllSponsors() {
        let overlay = document.getElementById('sponsors-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sponsors-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="modal-form" style="max-width: 1000px;">
                <h3><i class="fas fa-bullhorn"></i> Todos los Anunciantes</h3>
                <p style="color: var(--gray-600); margin-bottom: 1rem;">Total: ${VV.banner.currentBanners.length} anunciantes</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; max-height: 60vh; overflow-y: auto;">
                    ${VV.banner.currentBanners.map(sponsor => `
                        <div class="sponsor-card" onclick="VV.banner.click('${sponsor.id}')" style="cursor: pointer; border: 2px solid var(--gray-200); border-radius: 8px; padding: 1rem; background: white; transition: all 0.3s;">
                            ${sponsor.imageUrl ? 
                                `<div style="width: 100%; height: 150px; background-image: url('${sponsor.imageUrl}'); background-size: cover; background-position: center; border-radius: 8px; margin-bottom: 0.5rem;"></div>` :
                                `<div style="font-size: 3rem; text-align: center; margin: 1rem 0;">${sponsor.logo}</div>`
                            }
                            <h4 style="margin: 0.5rem 0; color: var(--primary-blue);">${sponsor.name}</h4>
                            <p style="font-size: 0.85rem; color: var(--gray-600); margin: 0.25rem 0;">${sponsor.description}</p>
                            ${sponsor.contact ? `<p style="font-size: 0.85rem; margin: 0.25rem 0;"><i class="fas fa-phone"></i> ${sponsor.contact}</p>` : ''}
                            ${sponsor.website ? `<p style="font-size: 0.85rem; margin: 0.25rem 0;"><i class="fas fa-globe"></i> ${sponsor.website}</p>` : ''}
                            <span class="badge ${sponsor.tier}" style="margin-top: 0.5rem; display: inline-block;">${sponsor.tier.toUpperCase()}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 1.5rem; text-align: right;">
                    <button class="btn-cancel" onclick="document.getElementById('sponsors-overlay').classList.remove('active')">Cerrar</button>
                </div>
            </div>
        `;
        
        overlay.classList.add('active');
        
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        };
    },
    
    // Click en banner
    click(sponsorId) {
        if (sponsorId.startsWith('placeholder')) return;
        
        const sponsor = VV.data.sponsors.find(s => s.id === sponsorId);
        if (sponsor) {
            sponsor.clicks += 1;
            sponsor.views += 1;
            if (sponsor.website) {
                window.open(sponsor.website, '_blank');
            }
        }
    }
};

console.log('✅ Módulo BANNER cargado');
