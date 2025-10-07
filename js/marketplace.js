// ========== MÓDULO MARKETPLACE ==========

VV.marketplace = {
    // Cargar mis productos
    load() {
        const container = document.getElementById('my-products');
        const myProducts = VV.data.products.filter(p => p.sellerId === VV.data.user?.id);
        
        if (myProducts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-600);">
                    <i class="fas fa-store" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No tienes productos publicados</h3>
                    <p>Comienza vendiendo tu primer producto</p>
                    <button class="btn-primary" onclick="VV.marketplace.showForm()" style="margin: 1rem auto; width: auto;">
                        <i class="fas fa-plus"></i> Publicar Producto
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = myProducts.map(p => `
            <div class="product-card">
                <div class="card-header">
                    <h3>${p.product}</h3>
                    ${p.featured ? '<span class="badge featured">Destacado</span>' : ''}
                </div>
                <p><strong>Negocio:</strong> ${p.business}</p>
                <p><strong>Categoría:</strong> ${p.category}</p>
                <p style="color: var(--gray-600); margin: 0.5rem 0;">${p.description || ''}</p>
                <div class="card-footer">
                    <div class="price">
                        <span class="price-amount">$${p.price}</span>
                        <span class="price-unit">/ ${p.unit}</span>
                    </div>
                    <div class="contact">
                        <i class="fas fa-phone"></i> ${p.contact}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="VV.marketplace.showForm('${p.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="VV.marketplace.deleteProduct('${p.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Cargar todos los productos (comprar)
    loadShopping() {
        const container = document.getElementById('all-products');
        
        // Filtrar solo productos del mismo barrio
        const neighborhoodProducts = VV.data.products.filter(p => 
            !p.neighborhood || p.neighborhood === VV.data.neighborhood
        );
        
        if (neighborhoodProducts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-600);">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No hay productos en tu barrio</h3>
                    <p>Sé el primero en publicar productos en ${VV.data.neighborhood}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = neighborhoodProducts.map(p => `
            <div class="product-card">
                <div class="card-header">
                    <h3>${p.product}</h3>
                    ${p.featured ? '<span class="badge featured">Destacado</span>' : ''}
                    <span class="badge quality-${p.quality.toLowerCase().replace(' ', '-')}">${p.quality}</span>
                </div>
                <p><strong>Vendedor:</strong> ${p.sellerName}</p>
                <p><strong>Negocio:</strong> ${p.business}</p>
                <p><strong>Categoría:</strong> ${p.category}</p>
                <p style="color: var(--gray-600); margin: 0.5rem 0;">${p.description || ''}</p>
                <div class="card-footer">
                    <div class="price">
                        <span class="price-amount">$${p.price}</span>
                        <span class="price-unit">/ ${p.unit}</span>
                    </div>
                    <div class="contact">
                        <i class="fas fa-phone"></i> ${p.contact}
                    </div>
                </div>
                <div class="quantity-input" style="margin-top: 1rem;">
                    <label style="font-size: 0.85rem; color: var(--gray-600);">Cantidad:</label>
                    <input type="number" id="qty-${p.id}" min="0.01" step="0.01" value="1" style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: 4px; margin: 0.25rem 0;">
                </div>
                <button class="btn-primary" onclick="VV.marketplace.addToCart('${p.id}')" style="width: 100%; margin-top: 0.5rem;">
                    <i class="fas fa-plus"></i> Agregar a Agenda
                </button>
                <button class="btn-secondary" onclick="VV.marketplace.compareProduct('${p.product}')" style="width: 100%; margin-top: 0.5rem;">
                    <i class="fas fa-balance-scale"></i> Comparar Precios
                </button>
            </div>
        `).join('');
        
        VV.marketplace.setupFilters();
        VV.marketplace.updateCart();
    },
    
    // Setup filtros
    setupFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const categories = [...new Set(VV.data.products.map(p => p.category))];
        
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
        categories.forEach(cat => {
            categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        
        document.getElementById('product-search').oninput = VV.marketplace.filterProducts;
        categoryFilter.onchange = VV.marketplace.filterProducts;
    },
    
    // Filtrar productos
    filterProducts() {
        const search = document.getElementById('product-search').value.toLowerCase();
        const category = document.getElementById('category-filter').value;
        
        // Filtrar solo productos del mismo barrio
        let filtered = VV.data.products.filter(p => 
            !p.neighborhood || p.neighborhood === VV.data.neighborhood
        );
        
        if (search) {
            filtered = filtered.filter(p => 
                p.product.toLowerCase().includes(search) ||
                p.business.toLowerCase().includes(search) ||
                p.sellerName.toLowerCase().includes(search)
            );
        }
        
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }
        
        const container = document.getElementById('all-products');
        if (filtered.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-600);"><i class="fas fa-search" style="font-size: 3rem; opacity: 0.5;"></i><h3>No se encontraron productos</h3></div>';
            return;
        }
        
        container.innerHTML = filtered.map(p => `
            <div class="product-card">
                <div class="card-header">
                    <h3>${p.product}</h3>
                    ${p.featured ? '<span class="badge featured">Destacado</span>' : ''}
                    <span class="badge quality-${p.quality.toLowerCase().replace(' ', '-')}">${p.quality}</span>
                </div>
                <p><strong>Vendedor:</strong> ${p.sellerName}</p>
                <p><strong>Negocio:</strong> ${p.business}</p>
                <p><strong>Categoría:</strong> ${p.category}</p>
                <p style="color: var(--gray-600); margin: 0.5rem 0;">${p.description || ''}</p>
                <div class="card-footer">
                    <div class="price">
                        <span class="price-amount">$${p.price}</span>
                        <span class="price-unit">/ ${p.unit}</span>
                    </div>
                    <div class="contact">
                        <i class="fas fa-phone"></i> ${p.contact}
                    </div>
                </div>
                <div class="quantity-input" style="margin-top: 1rem;">
                    <label style="font-size: 0.85rem; color: var(--gray-600);">Cantidad:</label>
                    <input type="number" id="qty-${p.id}" min="0.01" step="0.01" value="1" style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: 4px; margin: 0.25rem 0;">
                </div>
                <button class="btn-primary" onclick="VV.marketplace.addToCart('${p.id}')" style="width: 100%; margin-top: 0.5rem;">
                    <i class="fas fa-plus"></i> Agregar a Agenda
                </button>
                <button class="btn-secondary" onclick="VV.marketplace.compareProduct('${p.product}')" style="width: 100%; margin-top: 0.5rem;">
                    <i class="fas fa-balance-scale"></i> Comparar Precios
                </button>
            </div>
        `).join('');
    },
    
    // Mostrar formulario
    showForm(productId = null) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const product = productId ? VV.data.products.find(p => p.id === productId) : null;
        const isEdit = product !== null;
        
        // Verificar si el usuario ya tiene un nombre de negocio registrado
        const userBusinessName = VV.data.user.businessName || '';
        const hasBusinessName = userBusinessName !== '';
        
        let overlay = document.getElementById('product-form-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'product-form-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="modal-form">
                <h3><i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i> ${isEdit ? 'Editar' : 'Nuevo'} Producto</h3>
                ${!hasBusinessName ? '<p style="background: #fef3c7; padding: 1rem; border-radius: 8px; color: #92400e; margin-bottom: 1rem;"><i class="fas fa-info-circle"></i> <strong>Importante:</strong> El nombre del negocio solo se puede configurar una vez y será usado en todos tus productos.</p>' : ''}
                <form id="product-form">
                    <div class="form-group">
                        <label>Nombre del producto *</label>
                        <input type="text" id="product-name" value="${product?.product || ''}" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Categoría *</label>
                            <select id="product-category" required>
                                <option value="">Seleccionar</option>
                                <option value="Verdulería" ${product?.category === 'Verdulería' ? 'selected' : ''}>Verdulería</option>
                                <option value="Panadería" ${product?.category === 'Panadería' ? 'selected' : ''}>Panadería</option>
                                <option value="Carnicería" ${product?.category === 'Carnicería' ? 'selected' : ''}>Carnicería</option>
                                <option value="Almacén" ${product?.category === 'Almacén' ? 'selected' : ''}>Almacén</option>
                                <option value="Otros" ${product?.category === 'Otros' ? 'selected' : ''}>Otros</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nombre del negocio *</label>
                            ${hasBusinessName ? 
                                `<input type="text" id="product-business" value="${userBusinessName}" readonly style="background: var(--gray-100); cursor: not-allowed;" title="El nombre del negocio no se puede cambiar">` :
                                `<input type="text" id="product-business" value="${product?.business || ''}" required placeholder="Ej: Verdulería Don José">`
                            }
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Precio *</label>
                            <input type="number" id="product-price" value="${product?.price || ''}" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Unidad *</label>
                            <select id="product-unit" required>
                                <option value="">Seleccionar</option>
                                <option value="kg" ${product?.unit === 'kg' ? 'selected' : ''}>Kilogramo</option>
                                <option value="unidad" ${product?.unit === 'unidad' ? 'selected' : ''}>Unidad</option>
                                <option value="litro" ${product?.unit === 'litro' ? 'selected' : ''}>Litro</option>
                                <option value="docena" ${product?.unit === 'docena' ? 'selected' : ''}>Docena</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Calidad *</label>
                        <select id="product-quality" required>
                            <option value="">Seleccionar</option>
                            <option value="Excelente" ${product?.quality === 'Excelente' ? 'selected' : ''}>Excelente</option>
                            <option value="Muy Buena" ${product?.quality === 'Muy Buena' ? 'selected' : ''}>Muy Buena</option>
                            <option value="Buena" ${product?.quality === 'Buena' ? 'selected' : ''}>Buena</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Teléfono *</label>
                        <input type="tel" id="product-contact" value="${product?.contact || VV.data.user?.phone || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea id="product-description" rows="3">${product?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="product-featured" ${product?.featured ? 'checked' : ''}> 
                            Producto destacado
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="VV.marketplace.closeForm()">Cancelar</button>
                        <button type="submit" class="btn-save">
                            <i class="fas fa-save"></i> ${isEdit ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        overlay.classList.add('active');
        
        document.getElementById('product-form').onsubmit = (e) => {
            e.preventDefault();
            VV.marketplace.saveProduct(product);
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) VV.marketplace.closeForm();
        };
    },
    
    // Cerrar formulario
    closeForm() {
        const overlay = document.getElementById('product-form-overlay');
        if (overlay) overlay.classList.remove('active');
    },
    
    // Guardar producto
    saveProduct(existingProduct) {
        const formData = {
            product: document.getElementById('product-name').value.trim(),
            category: document.getElementById('product-category').value,
            business: document.getElementById('product-business').value.trim(),
            price: parseFloat(document.getElementById('product-price').value),
            unit: document.getElementById('product-unit').value,
            quality: document.getElementById('product-quality').value,
            contact: document.getElementById('product-contact').value.trim(),
            description: document.getElementById('product-description').value.trim(),
            featured: document.getElementById('product-featured').checked
        };
        
        if (!formData.product || !formData.category || !formData.business || !formData.price || !formData.unit || !formData.quality || !formData.contact) {
            alert('Completa todos los campos obligatorios');
            return;
        }
        
        // Guardar nombre del negocio en el perfil del usuario (solo la primera vez)
        if (!VV.data.user.businessName) {
            VV.data.user.businessName = formData.business;
            
            // Actualizar en localStorage
            const userKey = `vecinosVirtuales_user_${VV.data.user.id}`;
            localStorage.setItem(userKey, JSON.stringify(VV.data.user));
            localStorage.setItem('vecinosVirtualesUser', JSON.stringify(VV.data.user));
        }
        
        if (existingProduct) {
            const index = VV.data.products.findIndex(p => p.id === existingProduct.id);
            VV.data.products[index] = { ...existingProduct, ...formData };
        } else {
            VV.data.products.push({
                id: VV.utils.generateId(),
                sellerId: VV.data.user.id,
                sellerName: VV.data.user.name,
                neighborhood: VV.data.neighborhood,
                ...formData
            });
        }
        
        // Guardar productos en localStorage
        localStorage.setItem('vecinosVirtuales_products', JSON.stringify(VV.data.products));
        
        VV.marketplace.closeForm();
        VV.marketplace.load();
        VV.utils.showSuccess(existingProduct ? 'Producto actualizado' : 'Producto publicado');
    },
    
    // Eliminar producto
    deleteProduct(productId) {
        if (confirm('¿Eliminar este producto?')) {
            VV.data.products = VV.data.products.filter(p => p.id !== productId);
            
            // Guardar en localStorage
            localStorage.setItem('vecinosVirtuales_products', JSON.stringify(VV.data.products));
            
            VV.marketplace.load();
            VV.utils.showSuccess('Producto eliminado');
        }
    },
    
    // Agregar al carrito
    addToCart(productId) {
        const product = VV.data.products.find(p => p.id === productId);
        if (!product) return;
        
        // Obtener cantidad del input
        const qtyInput = document.getElementById(`qty-${productId}`);
        const quantity = qtyInput ? parseFloat(qtyInput.value) : 1;
        
        if (quantity <= 0) {
            alert('La cantidad debe ser mayor a 0');
            return;
        }
        
        const existing = VV.data.cart.find(item => item.productId === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            VV.data.cart.push({
                productId: productId,
                product: product,
                quantity: quantity
            });
        }
        
        VV.marketplace.updateCart();
        VV.utils.showSuccess(`${quantity} ${product.unit} agregado a la agenda`);
    },
    
    // Comparar precios de productos similares
    compareProduct(productName) {
        const similarProducts = VV.data.products.filter(p => 
            p.product.toLowerCase() === productName.toLowerCase() &&
            p.neighborhood === VV.data.neighborhood
        );
        
        if (similarProducts.length === 0) {
            alert('No hay productos para comparar');
            return;
        }
        
        // Ordenar por precio
        similarProducts.sort((a, b) => a.price - b.price);
        
        let overlay = document.getElementById('compare-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'compare-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="modal-form" style="max-width: 900px;">
                <h3><i class="fas fa-balance-scale"></i> Comparar Precios: ${productName}</h3>
                <p style="color: var(--gray-600); margin-bottom: 1rem;">Encontrados ${similarProducts.length} vendedores en tu barrio</p>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; background: white;">
                        <thead>
                            <tr style="background: var(--gray-100); border-bottom: 2px solid var(--gray-300);">
                                <th style="padding: 0.75rem; text-align: left;">Vendedor</th>
                                <th style="padding: 0.75rem; text-align: left;">Negocio</th>
                                <th style="padding: 0.75rem; text-align: center;">Precio</th>
                                <th style="padding: 0.75rem; text-align: center;">Unidad</th>
                                <th style="padding: 0.75rem; text-align: center;">Calidad</th>
                                <th style="padding: 0.75rem; text-align: center;">Contacto</th>
                                <th style="padding: 0.75rem; text-align: center;">Acci\u00f3n</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${similarProducts.map((p, index) => `
                                <tr style="border-bottom: 1px solid var(--gray-200); ${index === 0 ? 'background: #f0fdf4;' : ''}">
                                    <td style="padding: 0.75rem;">${p.sellerName}</td>
                                    <td style="padding: 0.75rem;">${p.business}</td>
                                    <td style="padding: 0.75rem; text-align: center; font-weight: bold; color: ${index === 0 ? 'var(--success-green)' : 'inherit'};">
                                        $${p.price}
                                        ${index === 0 ? '<br><span style="font-size: 0.75rem; color: var(--success-green);">M\u00c1S BARATO</span>' : ''}
                                    </td>
                                    <td style="padding: 0.75rem; text-align: center;">${p.unit}</td>
                                    <td style="padding: 0.75rem; text-align: center;">
                                        <span class="badge quality-${p.quality.toLowerCase().replace(' ', '-')}">${p.quality}</span>
                                    </td>
                                    <td style="padding: 0.75rem; text-align: center; font-size: 0.85rem;">${p.contact}</td>
                                    <td style="padding: 0.75rem; text-align: center;">
                                        <input type="number" id="compare-qty-${p.id}" min="0.01" step="0.01" value="1" style="width: 60px; padding: 0.25rem; border: 1px solid var(--gray-300); border-radius: 4px; margin-bottom: 0.25rem;">
                                        <button class="btn-primary" onclick="VV.marketplace.selectFromComparisonWithQty('${p.id}')" style="padding: 0.5rem 1rem; font-size: 0.85rem; width: 100%;">
                                            <i class="fas fa-check"></i> Elegir
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 1.5rem; text-align: right;">
                    <button class="btn-cancel" onclick="document.getElementById('compare-overlay').classList.remove('active')">Cerrar</button>
                </div>
            </div>
        `;
        
        overlay.classList.add('active');
        
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        };
    },
    
    // Seleccionar producto desde comparación
    selectFromComparison(productId) {
        document.getElementById('compare-overlay').classList.remove('active');
        VV.marketplace.addToCart(productId);
    },
    
    // Seleccionar producto desde comparación con cantidad
    selectFromComparisonWithQty(productId) {
        const qtyInput = document.getElementById(`compare-qty-${productId}`);
        const quantity = parseFloat(qtyInput.value) || 1;
        
        document.getElementById('compare-overlay').classList.remove('active');
        
        // Agregar al carrito con cantidad específica
        const product = VV.data.products.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = VV.data.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            VV.data.cart.push({
                productId: productId,
                product: product,
                quantity: quantity
            });
        }
        
        VV.marketplace.updateCart();
        VV.utils.showSuccess(`${quantity} ${product.unit} agregado(s) a tu agenda`);
    },
    
    // Actualizar carrito
    updateCart() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartTotalTop = document.getElementById('cart-total-top');
        const cartCount = document.getElementById('cart-count');
        const cartBadge = document.getElementById('cart-badge');
        
        if (VV.data.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: var(--gray-600); padding: 2rem;">Tu agenda está vacía</p>';
            cartTotal.textContent = '0.00';
            if (cartTotalTop) cartTotalTop.textContent = '0.00';
            cartCount.textContent = '0';
            cartBadge.style.display = 'none';
            return;
        }
        
        cartItems.innerHTML = VV.data.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.product.product}</h4>
                    <p>${item.product.sellerName}</p>
                    <p class="cart-item-price">$${item.product.price} / ${item.product.unit}</p>
                    <p style="font-size: 0.85rem; color: var(--gray-600); margin-top: 0.25rem;">
                        Subtotal: $${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="VV.marketplace.updateQuantity('${item.productId}', ${item.quantity - 0.5})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="VV.marketplace.updateQuantity('${item.productId}', ${item.quantity + 0.5})">+</button>
                    <button class="remove-btn" onclick="VV.marketplace.removeFromCart('${item.productId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        const total = VV.data.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const totalItems = VV.data.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartTotal.textContent = total.toFixed(2);
        if (cartTotalTop) cartTotalTop.textContent = total.toFixed(2);
        cartCount.textContent = totalItems;
        cartBadge.textContent = totalItems;
        cartBadge.style.display = 'block';
    },
    
    // Actualizar cantidad
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            VV.marketplace.removeFromCart(productId);
            return;
        }
        
        const item = VV.data.cart.find(i => i.productId === productId);
        if (item) {
            item.quantity = newQuantity;
            VV.marketplace.updateCart();
        }
    },
    
    // Remover del carrito
    removeFromCart(productId) {
        VV.data.cart = VV.data.cart.filter(i => i.productId !== productId);
        VV.marketplace.updateCart();
    }
};

// Toggle carrito global
window.toggleCart = function() {
    document.getElementById('shopping-cart').classList.toggle('active');
};

console.log('✅ Módulo MARKETPLACE cargado');
