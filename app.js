// NERO STUDIO — tienda demostrativa con almacenamiento local (localStorage)
const money = n => new Intl.NumberFormat('es-GT',{style:'currency',currency:'GTQ'}).format(Number(n)||0);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const STORAGE = {products:'nero_products_v1',orders:'nero_orders_v1',cart:'nero_cart_v1',favorites:'nero_favorites_v1'};
const starterProducts = [
 {id:1,name:'Anillo Órbita',category:'Anillos',price:285,description:'Una silueta limpia con acabado pulido.',symbol:'◉',image:'assets/product-1.jpg',tag:'BEST SELLER'},
 {id:2,name:'Collar Eclipse',category:'Collares',price:420,description:'Minimalismo que ilumina cualquier look.',symbol:'◌',image:'assets/product-2.jpg',tag:'NUEVO'},
 {id:3,name:'Pulsera Línea',category:'Pulseras',price:195,description:'Una línea sutil para todos los días.',symbol:'⌁',image:'assets/product-3.jpg',tag:''},
 {id:4,name:'Aretes Nébula',category:'Aretes',price:235,description:'Pequeños detalles, gran personalidad.',symbol:'✧',image:'assets/product-4.jpg',tag:'BEST SELLER'},
 {id:5,name:'Anillo Prisma',category:'Anillos',price:350,description:'Geometría y carácter en equilibrio.',symbol:'◇',image:'assets/product-5.jpg',tag:''},
 {id:6,name:'Collar Aura',category:'Collares',price:510,description:'Una pieza protagonista, sin excesos.',symbol:'☼',image:'assets/product-6.jpg',tag:'EDICIÓN NERO'},
 {id:7,name:'Pulsera Esencial',category:'Pulseras',price:260,description:'Diseño atemporal de acabado brillante.',symbol:'∞',image:'assets/product-7.jpg',tag:''},
 {id:8,name:'Aretes Halo',category:'Aretes',price:310,description:'Un destello discreto que transforma.',symbol:'○',image:'assets/product-8.jpg',tag:''}
];
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value))}
let products=read(STORAGE.products,starterProducts).map(p=>({...p,image:p.image||starterProducts.find(s=>s.id===p.id)?.image||''})),cart=read(STORAGE.cart,[]),orders=read(STORAGE.orders,[]),favorites=read(STORAGE.favorites,[]);
let activeCategory='Todos',searchTerm='',isAdmin=false;
function toast(message,type='success'){const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;$('#toastContainer').append(el);setTimeout(()=>el.remove(),3300)}
function productVisual(p){return p.image?`<img loading="lazy" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none';this.parentElement.querySelector('.product-art').style.display='grid'">`:''}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderProducts(){
 let list=products.filter(p=>(activeCategory==='Todos'||p.category===activeCategory)&&(`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(searchTerm)));
 const sort=$('#sortSelect').value;if(sort==='low')list.sort((a,b)=>a.price-b.price);if(sort==='high')list.sort((a,b)=>b.price-a.price);
 $('#productGrid').innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-image">${productVisual(p)}<div class="product-art" ${p.image?'style="display:none"':''}>${escapeHtml(p.symbol||'✧')}</div>${p.tag?`<span class="product-tag">${escapeHtml(p.tag)}</span>`:''}<button class="heart-btn" data-fav="${p.id}" aria-label="Favorito">${favorites.includes(p.id)?'♥':'♡'}</button></div><div class="product-meta"><div><h3>${escapeHtml(p.name)}</h3><span class="product-category">${escapeHtml(p.category)}</span></div><span class="price">${money(p.price)}</span></div><button class="add-btn" data-add="${p.id}">AÑADIR A LA BOLSA ＋</button></article>`).join(''):'<p class="muted">No encontramos piezas con esos filtros. Prueba otra búsqueda.</p>';
}
function updateCart(){let count=cart.reduce((s,i)=>s+i.qty,0),subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);$('#cartCount').textContent=count;$('#drawerCount').textContent=`(${count})`,$('#cartSubtotal').textContent=money(subtotal);$('#checkoutTotal').textContent=money(subtotal);write(STORAGE.cart,cart);
 $('#cartItems').innerHTML=cart.length?cart.map(i=>`<div class="cart-row"><div class="cart-thumb">${escapeHtml(i.symbol||'✧')}</div><div><h4>${escapeHtml(i.name)}</h4><small>${money(i.price)}</small><div class="qty-controls"><button data-qty="${i.id}" data-delta="-1">−</button><span>${i.qty}</span><button data-qty="${i.id}" data-delta="1">+</button></div></div><button class="remove-item" data-remove="${i.id}">✕</button></div>`).join(''):'<p class="muted" style="padding:35px 0">Tu bolsa está esperando algo especial.</p>';
}
function addToCart(id){let p=products.find(x=>x.id===id);if(!p)return;let found=cart.find(x=>x.id===id);found?found.qty++:cart.push({...p,qty:1});updateCart();toast(`${p.name} se añadió a tu bolsa.`)}
function showCart(){closeAll();$('#overlay').classList.remove('hidden');$('#cartDrawer').classList.add('open')}
function closeAll(){$('#overlay').classList.add('hidden');$('#cartDrawer').classList.remove('open');$$('.modal').forEach(m=>m.classList.add('hidden'))}
function showModal(id){closeAll();$('#overlay').classList.remove('hidden');$(id).classList.remove('hidden')}
function renderAdmin(){ $('#adminProductList').innerHTML=products.map(p=>`<div class="admin-product"><div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.category)} · ${money(p.price)}</small></div><div class="admin-product-actions"><button data-edit="${p.id}">EDITAR</button><button data-delete="${p.id}">BORRAR</button></div></div>`).join('');$('#orderBadge').textContent=orders.length;
 $('#adminOrdersList').innerHTML=orders.length?orders.slice().reverse().map(o=>`<article class="admin-order"><div class="admin-order-top"><b>Pedido #${o.id}</b><strong>${money(o.total)}</strong></div><p><b>${escapeHtml(o.name)}</b> · ${escapeHtml(o.email)}<br>${escapeHtml(o.phone)} · ${escapeHtml(o.city)}<br>${escapeHtml(o.address)}<br><b>Pago:</b> ${escapeHtml(o.payment)}<br><b>Artículos:</b> ${o.items.map(i=>`${escapeHtml(i.name)} ×${i.qty}`).join(', ')}<br><small>${escapeHtml(o.date)}</small></p></article>`).join(''):'<p class="muted">Todavía no hay pedidos registrados.</p>';
}
function resetProductForm(){$('#productForm').reset();$('#productForm').elements.id.value='';$('#productFormTitle').textContent='Nueva publicación'}
$('#productGrid').addEventListener('click',e=>{let add=e.target.closest('[data-add]'),fav=e.target.closest('[data-fav]');if(add)addToCart(Number(add.dataset.add));if(fav){let id=Number(fav.dataset.fav);favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];write(STORAGE.favorites,favorites);renderProducts();toast(favorites.includes(id)?'Guardado en favoritos.':'Eliminado de favoritos.')}});
$('#cartItems').addEventListener('click',e=>{let q=e.target.closest('[data-qty]'),r=e.target.closest('[data-remove]');if(q){let item=cart.find(x=>x.id===Number(q.dataset.qty));item.qty+=Number(q.dataset.delta);if(item.qty<=0)cart=cart.filter(x=>x.id!==item.id);updateCart()}if(r){cart=cart.filter(x=>x.id!==Number(r.dataset.remove));updateCart()}});
$('#filters').addEventListener('click',e=>{let b=e.target.closest('[data-category]');if(!b)return;activeCategory=b.dataset.category;$$('.filter').forEach(x=>x.classList.toggle('active',x===b));renderProducts()});
$('#sortSelect').addEventListener('change',renderProducts);
$('#searchToggle').onclick=()=>{$('#searchPanel').classList.toggle('hidden');$('#searchInput').focus()};
$('#closeSearch').onclick=()=>{$('#searchPanel').classList.add('hidden');$('#searchInput').value='';searchTerm='';renderProducts()};
$('#searchInput').addEventListener('input',e=>{searchTerm=e.target.value.toLowerCase();renderProducts()});
$('#cartBtn').onclick=showCart;$('#accountBtn').onclick=()=>showModal('#accountModal');$('#overlay').onclick=closeAll;$$('[data-close]').forEach(b=>b.onclick=closeAll);
$('#checkoutBtn').onclick=()=>{if(!cart.length){toast('Tu bolsa está vacía.','error');return}showModal('#checkoutModal')};
$('#paymentMethod').onchange=e=>{$('#paymentHint').textContent=({'Contra entrega':'Paga en efectivo al recibir tu pedido.','Transferencia bancaria':'Al confirmar, el administrador coordinará los datos para la transferencia.','Tarjeta (demostración)':'Modo demostración: no se solicitarán datos bancarios ni se realizará ningún cobro.'})[e.target.value]};
$('#checkoutForm').onsubmit=e=>{e.preventDefault();if(!cart.length)return;let data=Object.fromEntries(new FormData(e.target).entries());let total=cart.reduce((s,i)=>s+i.price*i.qty,0);let order={...data,id:Date.now(),items:cart.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price})),total,date:new Date().toLocaleString('es-GT')};orders.push(order);write(STORAGE.orders,orders);cart=[];updateCart();e.target.reset();closeAll();toast('¡Pedido registrado correctamente!'); 
 if ('Notification' in window && Notification.permission === 'granted') {
   new Notification('NERO · Nueva compra', {body:`Pedido de ${order.name}: ${money(order.total)}`});
 }
 window.dispatchEvent(new CustomEvent('nero:order-created',{detail:order}));
 if(isAdmin)renderAdmin()};
$('#loginForm').onsubmit=e=>{e.preventDefault();let d=Object.fromEntries(new FormData(e.target).entries());if(d.username==='admin'&&d.password==='nero2026'){isAdmin=true;
 if ('Notification' in window && Notification.permission === 'default') { Notification.requestPermission(); }
 closeAll();$('#adminPanel').classList.remove('hidden');$('#adminPanel').scrollIntoView({behavior:'smooth'});renderAdmin();toast('Bienvenido al control room.')}else toast('Usuario o contraseña incorrectos.','error')};
$('#logoutBtn').onclick=()=>{isAdmin=false;$('#adminPanel').classList.add('hidden');toast('Sesión de administrador cerrada.')};
$$('.admin-tab').forEach(b=>b.onclick=()=>{$$('.admin-tab').forEach(x=>x.classList.toggle('active',x===b));$$('.admin-content').forEach(x=>x.classList.add('hidden'));$('#'+b.dataset.tab).classList.remove('hidden')});
$('#productForm').onsubmit=e=>{e.preventDefault();let d=Object.fromEntries(new FormData(e.target).entries());let item={id:d.id?Number(d.id):Date.now(),name:d.name.trim(),category:d.category,price:Number(d.price),description:d.description.trim(),image:d.image.trim(),symbol:'✧',tag:'NUEVO'};if(d.id){products=products.map(p=>p.id===item.id?item:p);toast('Publicación actualizada.')}else{products.unshift(item);toast('Nueva publicación creada.')}write(STORAGE.products,products);resetProductForm();renderProducts();renderAdmin()};
$('#adminProductList').addEventListener('click',e=>{let edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit){let p=products.find(x=>x.id===Number(edit.dataset.edit)),f=$('#productForm');Object.entries(p).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v});$('#productFormTitle').textContent='Editar publicación';f.scrollIntoView({behavior:'smooth',block:'center'})}if(del){let id=Number(del.dataset.delete);if(confirm('¿Eliminar esta publicación?')){products=products.filter(p=>p.id!==id);write(STORAGE.products,products);renderProducts();renderAdmin();toast('Publicación eliminada.')}}});
$('#cancelEdit').onclick=resetProductForm;
$('#newsletterForm').onsubmit=e=>{e.preventDefault();toast('¡Gracias! Te has unido a las notas de NERO.');e.target.reset()};
$('#menuToggle').onclick=()=>{let nav=$('.desktop-nav');nav.style.display=nav.style.display==='flex'?'none':'flex';nav.style.position='absolute';nav.style.top='65px';nav.style.left='0';nav.style.right='0';nav.style.padding='20px';nav.style.background='#f7f7f4';nav.style.flexDirection='column';nav.style.borderBottom='1px solid #ddd'};
renderProducts();updateCart();

window.addEventListener('storage', e => {
  if (e.key === STORAGE.orders) {
    orders = read(STORAGE.orders, []);
    if (isAdmin) { renderAdmin(); toast('Se actualizó la lista de pedidos.'); }
  }
});
