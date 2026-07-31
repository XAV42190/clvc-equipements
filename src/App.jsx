import React, { useState } from 'react';
import { INITIAL_PRODUCTS } from './data/mockData';

// Composant SVG du logo officiel CLVC (Vectoriel ajusté)
function LogoCLVC({ className = "w-10 h-10" }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Quadrant C haut gauche */}
      <path 
        d="M 90 20 C 50 20 25 50 25 85 C 25 110 45 125 75 115 L 72 95 C 55 100 45 92 45 82 C 45 62 60 40 90 40 Z" 
        fill="#007BB6" 
      />
      <path 
        d="M 85 45 C 55 45 35 65 30 85 C 28 60 48 30 90 20 C 70 30 85 45 85 45 Z" 
        fill="#0A3B7B" 
      />

      {/* Quadrant L haut droit */}
      <path 
        d="M 125 20 L 105 105 L 145 100 L 115 90 L 138 20 Z" 
        fill="#0A3B7B" 
      />
      <path 
        d="M 105 90 C 130 90 160 100 175 110 C 145 95 120 95 105 105 Z" 
        fill="#007BB6" 
      />

      {/* Quadrant V bas gauche */}
      <path 
        d="M 35 120 C 45 155 65 180 80 188 C 70 160 55 135 45 120 Z" 
        fill="#0A3B7B" 
      />
      <path 
        d="M 90 120 L 80 188 C 80 188 100 145 105 120 Z" 
        fill="#007BB6" 
      />

      {/* Quadrant C bas droit */}
      <path 
        d="M 175 120 C 135 120 115 145 115 170 C 115 195 135 205 165 195 L 162 178 C 145 183 135 175 135 165 C 135 145 150 135 175 135 Z" 
        fill="#007BB6" 
      />
      <path 
        d="M 170 142 C 145 142 130 158 125 175 C 122 153 140 128 175 120 C 160 130 170 142 170 142 Z" 
        fill="#0A3B7B" 
      />
    </svg>
  );
}

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restockRequests, setRestockRequests] = useState([]);

  // SÉCURITÉ ADMIN
  const ADMIN_PASSWORD = "velo2026"; // 🔑 Mot de passe d'accès admin
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // États pour les filtres Visiteur
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedVariants, setSelectedVariants] = useState({}); // { productId: variantObject }
  const [isCartOpen, setIsCartOpen] = useState(false);

  // États pour les modales
  const [showCheckout, setShowCheckout] = useState(false);
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [clientInfo, setClientInfo] = useState({ name: '', email: '' });
  const [orderComplete, setOrderComplete] = useState(null);

  // Formulaire d'ajout de produit (Admin)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Maillots',
    image: '',
    variants: [
      { size: 'S', price: 50, stock: 0 },
      { size: 'M', price: 50, stock: 0 },
      { size: 'L', price: 50, stock: 0 },
      { size: 'XL', price: 50, stock: 0 }
    ]
  });

  // --- GESTION DES UPLOADS D'IMAGES LOCALES ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProductImage = (productId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProducts(products.map(prod => 
          prod.id === productId ? { ...prod, image: reader.result } : prod
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- SÉCURITÉ & AUTHENTIFICATION ADMIN ---
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  // --- ACTIONS CLIENT / VISITEUR ---
  const handleSelectVariant = (productId, variant) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variant }));
  };

  const addToCart = (product, variant) => {
    if (!variant) return alert("Veuillez sélectionner une taille !");
    if (variant.stock <= 0) return;
    
    const cartId = `${product.id}-${variant.size}`;
    const existing = cart.find(item => item.cartId === cartId);

    if (existing) {
      if (existing.qty >= variant.stock) return alert("Stock maximum atteint pour cette taille !");
      setCart(cart.map(item => item.cartId === cartId ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { cartId, productId: product.id, name: product.name, size: variant.size, price: variant.price, qty: 1 }]);
    }
    setIsCartOpen(true);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const ref = `CYCL-${Math.floor(100000 + Math.random() * 900000)}`;
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const newOrder = {
      id: ref,
      date: new Date().toLocaleDateString('fr-FR'),
      client: clientInfo,
      items: cart,
      total,
      status: 'En attente de virement'
    };

    setProducts(products.map(prod => {
      const updatedVariants = prod.variants.map(v => {
        const cartItem = cart.find(c => c.productId === prod.id && c.size === v.size);
        if (cartItem) {
          return { ...v, stock: Math.max(0, v.stock - cartItem.qty) };
        }
        return v;
      });
      return { ...prod, variants: updatedVariants };
    }));

    setOrders([newOrder, ...orders]);
    setOrderComplete(newOrder);
    setCart([]);
    setShowCheckout(false);
    setIsCartOpen(false);
  };

  const handleRestockRequest = (e) => {
    e.preventDefault();
    const req = {
      id: Date.now(),
      productName: restockModalItem.product.name,
      size: restockModalItem.variant.size,
      email: clientInfo.email,
      date: new Date().toLocaleDateString('fr-FR')
    };
    setRestockRequests([req, ...restockRequests]);
    alert("Votre demande de réapprovisionnement a été transmise au gestionnaire.");
    setRestockModalItem(null);
  };

  // --- ACTIONS GESTIONNAIRE / ADMIN ---
  const updateStockAndPrice = (productId, size, field, value) => {
    setProducts(products.map(prod => {
      if (prod.id === productId) {
        const variants = prod.variants.map(v => {
          if (v.size === size) {
            return { ...v, [field]: Number(value) };
          }
          return v;
        });
        return { ...prod, variants };
      }
      return prod;
    }));
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name) return;
    const created = { 
      ...newProduct, 
      id: Date.now().toString(),
      image: newProduct.image || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=80'
    };
    setProducts([...products, created]);
    setNewProduct({
      name: '',
      category: 'Maillots',
      image: '',
      variants: [
        { size: 'S', price: 50, stock: 0 },
        { size: 'M', price: 50, stock: 0 },
        { size: 'L', price: 50, stock: 0 },
        { size: 'XL', price: 50, stock: 0 }
      ]
    });
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet équipement ?")) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  // Filtrage des produits pour le Visiteur
  const categories = ['Tous', ...new Set(products.map(p => p.category))];
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalQty = cart.reduce((a, b) => a + b.qty, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* BANDEAU SUPÉRIEUR */}
      {!isAdmin && (
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-xs font-semibold py-1.5 px-4 text-center tracking-wide text-white">
          ⚡ LIVRAISON EXCLUSIVEMENT PAR VIREMENT BANCAIRE • RÈGLEMENT À LA COMMANDE
        </div>
      )}

      {/* HEADER / NAVBAR */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          
          {/* LOGO & NOM DU CLUB */}
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-xl flex items-center justify-center shadow-md">
              <LogoCLVC className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                COURS-LA-VILLE<span className="text-cyan-400"> CYCLISME</span>
              </h1>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium tracking-widest uppercase">Commande Équipements</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isAdmin && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 transition flex items-center space-x-2"
              >
                <span className="text-lg">🛒</span>
                <span className="text-sm font-semibold hidden sm:inline">Panier</span>
                {cartTotalQty > 0 && (
                  <span className="absolute -top-2 -right-2 bg-cyan-500 text-slate-950 font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                    {cartTotalQty}
                  </span>
                )}
              </button>
            )}

            {/* BOUTON ADMIN */}
            {isAdmin ? (
              <button
                onClick={handleAdminLogout}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition shadow-sm flex items-center space-x-1"
              >
                <span>🔒</span>
                <span>Déconnexion Admin</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setPasswordError(false);
                  setPasswordInput('');
                  setShowPasswordModal(true);
                }}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition shadow-sm"
              >
                ⚙️ Accès Admin
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* VIEW: ESPACE ADMIN (GESTIONNAIRE) */}
        {isAdmin ? (
          <div className="space-y-10">
            {/* Formulaire d'ajout d'équipement */}
            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h2 className="text-lg font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <span>➕</span> Ajouter un nouvel équipement
              </h2>
              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Nom du produit</label>
                  <input
                    type="text"
                    placeholder="ex: Cuissard court pro"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Catégorie</label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option>Maillots</option>
                    <option>Cuissards</option>
                    <option>Vestes</option>
                    <option>Combinaisons</option>
                    <option>Accessoires</option>
                  </select>
                </div>

                {/* CHAMP D'IMPORTATION DE PHOTO DEPUIS LE POSTE */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Photo depuis votre appareil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 file:cursor-pointer transition cursor-pointer"
                  />
                  {newProduct.image && (
                    <div className="mt-2 flex items-center space-x-2">
                      <img src={newProduct.image} alt="Aperçu" className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
                      <span className="text-xs text-emerald-400 font-medium">Image prête</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="md:col-span-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3 rounded-xl transition shadow-lg shadow-cyan-500/10"
                >
                  Enregistrer l'équipement
                </button>
              </form>
            </section>

            {/* Stock, Prix et Modif Photos */}
            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h2 className="text-lg font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <span>📦</span> Gestion des Stocks, Prix et Photos
              </h2>
              <div className="space-y-6">
                {products.map(product => (
                  <div key={product.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    
                    {/* En-tête de carte produit avec option photo */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-slate-800 gap-3">
                      <div className="flex items-center space-x-4">
                        <div className="relative group/img">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-14 h-14 object-cover rounded-xl border border-slate-700 shadow-md" 
                          />
                          <label className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition text-[10px] text-white font-bold">
                            📷 Éditer
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUpdateProductImage(product.id, e)}
                            />
                          </label>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-200 text-base">{product.name}</h3>
                          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                            {product.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition flex items-center space-x-1">
                          <span>🖼️</span>
                          <span>Changer la photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUpdateProductImage(product.id, e)}
                          />
                        </label>

                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-rose-400 hover:text-rose-300 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 rounded-xl border border-rose-500/20 transition flex items-center space-x-1"
                        >
                          <span>🗑️</span>
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>

                    {/* Modification des stocks & prix par taille */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {product.variants.map(v => (
                        <div key={v.size} className="bg-slate-800/80 p-3 rounded-xl flex flex-col space-y-2 border border-slate-700/80">
                          <span className="font-bold text-cyan-400 text-xs">Taille {v.size}</span>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Prix (€):</span>
                            <input
                              type="number"
                              value={v.price}
                              onChange={e => updateStockAndPrice(product.id, v.size, 'price', e.target.value)}
                              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                            />
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Stock:</span>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={e => updateStockAndPrice(product.id, v.size, 'stock', e.target.value)}
                              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Demandes de réapprovisionnement */}
            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h2 className="text-lg font-bold mb-4 text-amber-400 flex items-center gap-2">
                <span>📩</span> Demandes de réapprovisionnement ({restockRequests.length})
              </h2>
              {restockRequests.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune demande reçue pour l'instant.</p>
              ) : (
                <div className="space-y-2">
                  {restockRequests.map(req => (
                    <div key={req.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-slate-200">{req.productName}</span> (Taille {req.size})
                        <span className="text-slate-400 block text-xs">Demandé par: {req.email}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{req.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* VIEW: ESPACE VISITEUR */
          <div className="space-y-8">
            {/* HERO BANNER */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-2xl p-8 md:p-12">
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-block bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-widest">
                  Collection Officielle
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  Équipements pour les Licenciés du CLVC
                </h2>
                <p className="text-slate-400 text-sm md:text-base">
                  Commandez les Équipements de votre club. Stocks mis à jour en direct et règlement par virement bancaire.
                </p>
              </div>
              <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* BARRE DE RECHERCHE ET FILTRES */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher un équipement..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* GRILLE DE PRODUITS */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/50">
                <span className="text-4xl block mb-2">🔍</span>
                <h3 className="text-lg font-bold text-slate-300">Aucun équipement trouvé</h3>
                <p className="text-xs text-slate-500">Essayez de modifier votre recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => {
                  const activeVariant = selectedVariants[product.id] || product.variants[0];
                  const hasStock = activeVariant?.stock > 0;

                  return (
                    <div
                      key={product.id}
                      className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-cyan-950/20"
                    >
                      <div>
                        <div className="relative h-64 overflow-hidden bg-slate-950">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg">
                              {product.category}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            {activeVariant ? (
                              activeVariant.stock > 2 ? (
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> En Stock ({activeVariant.stock})
                                </span>
                              ) : activeVariant.stock > 0 ? (
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> Reste {activeVariant.stock} !
                                </span>
                              ) : (
                                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md">
                                  Rupture
                                </span>
                              )
                            ) : null}
                          </div>
                        </div>

                        <div className="p-5 space-y-4">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {product.name}
                            </h3>
                            <div className="text-right">
                              <span className="text-xl font-black text-cyan-400 font-mono">
                                {activeVariant ? `${activeVariant.price} €` : '--'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Taille :
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {product.variants.map(v => {
                                const isSelected = activeVariant?.size === v.size;
                                const isOutOfStock = v.stock === 0;

                                return (
                                  <button
                                    key={v.size}
                                    onClick={() => handleSelectVariant(product.id, v)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                      isSelected
                                        ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
                                        : isOutOfStock
                                        ? 'bg-slate-950 text-slate-600 border border-slate-800 line-through opacity-60'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                    }`}
                                  >
                                    {v.size}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        {hasStock ? (
                          <button
                            onClick={() => addToCart(product, activeVariant)}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
                          >
                            <span>🛒</span>
                            <span>Ajouter au panier</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setRestockModalItem({ product, variant: activeVariant })}
                            className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold py-3 px-4 rounded-xl transition text-xs flex items-center justify-center space-x-2"
                          >
                            <span>📩</span>
                            <span>Demander ce réapprovisionnement</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* PANIER COULISSANT */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 flex flex-col justify-between p-6 shadow-2xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>🛒 Votre Panier</span>
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold">
                    {cartTotalQty}
                  </span>
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-white p-1 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <span className="text-4xl block">🛍️</span>
                  <p className="text-slate-400 text-sm">Votre panier est actuellement vide.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.cartId} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-white">{item.name}</h4>
                        <div className="text-xs text-slate-400 mt-1">
                          Taille : <span className="font-bold text-cyan-400">{item.size}</span> • Qte : {item.qty}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-cyan-400 text-sm">
                          {item.price * item.qty} €
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-800 pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold text-white">
                  <span>Total :</span>
                  <span className="text-cyan-400 font-mono text-xl">
                    {cart.reduce((sum, i) => sum + i.price * i.qty, 0)} €
                  </span>
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl transition shadow-lg shadow-emerald-500/10 text-center text-sm"
                >
                  Passer la commande (Virement)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALE: MOT DE PASSE ADMIN */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-xl">
                🔐
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Accès Gestionnaire</h3>
                <p className="text-xs text-slate-400">Saisissez le mot de passe administrateur.</p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="Mot de passe..."
                  autoFocus
                  required
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  className={`w-full bg-slate-950 border rounded-xl p-3 text-sm text-slate-100 focus:outline-none transition ${
                    passwordError ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
                  }`}
                />
                {passwordError && (
                  <p className="text-xs text-rose-400 mt-1.5 font-medium">
                    ⚠️ Mot de passe incorrect.
                  </p>
                )}
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="w-1/2 bg-slate-800 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-700 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-cyan-500 py-2.5 rounded-xl text-sm font-extrabold hover:bg-cyan-400 text-slate-950"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE: FINALISATION COMMANDE */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Coordonnées de livraison</h3>
            <form onSubmit={handleCheckout} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Nom & Prénom</label>
                <input
                  type="text"
                  required
                  value={clientInfo.name}
                  onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Adresse Email</label>
                <input
                  type="email"
                  required
                  value={clientInfo.email}
                  onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl text-xs text-slate-300 space-y-1 border border-slate-800">
                <p className="font-bold text-amber-400">⚠️ Paiement par virement</p>
                <p>Vos articles seront expédiés dès réception de votre virement.</p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="w-1/2 bg-slate-800 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-700 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-emerald-500 py-2.5 rounded-xl text-sm font-extrabold hover:bg-emerald-400 text-slate-950"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE: RECAPITULATIF VIREMENT */}
      {orderComplete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/30 max-w-md w-full space-y-4 text-center shadow-2xl">
            <div className="text-4xl">🎉</div>
            <h3 className="text-xl font-bold text-emerald-400">Commande Enregistrée !</h3>
            <p className="text-sm text-slate-300">
              Veuillez effectuer votre virement bancaire de <strong className="text-cyan-400">{orderComplete.total} €</strong> avec la référence :
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl font-mono text-xl font-black text-amber-400 border border-slate-800 select-all tracking-wider">
              {orderComplete.id}
            </div>
            <div className="text-left text-xs bg-slate-950 p-3.5 rounded-xl text-slate-400 space-y-1.5 border border-slate-800 font-mono">
              <div><strong className="text-slate-200">IBAN :</strong> FR76 3000 4000 0100 0000 0000 000</div>
              <div><strong className="text-slate-200">BIC :</strong> VELOSTOCKFRXX</div>
            </div>
            <button
              onClick={() => setOrderComplete(null)}
              className="w-full bg-cyan-500 py-3 rounded-xl font-extrabold text-sm hover:bg-cyan-400 text-slate-950 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* MODALE: DEMANDE DE REAPPROVISIONNEMENT */}
      {restockModalItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400">Taille en rupture de stock</h3>
            <p className="text-sm text-slate-300">
              Demander un réapprovisionnement pour : <br />
              <strong className="text-white">{restockModalItem.product.name} (Taille {restockModalItem.variant.size})</strong>
            </p>
            <form onSubmit={handleRestockRequest} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Votre Adresse Email</label>
                <input
                  type="email"
                  required
                  value={clientInfo.email}
                  onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="w-1/2 bg-slate-800 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-700 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-amber-500 py-2.5 rounded-xl text-sm font-extrabold hover:bg-amber-400 text-slate-950"
                >
                  Envoyer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}