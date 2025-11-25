
// Global cart, badge, wishlist and auth helpers for Seva Clinic site

// ---------- CART ----------
function scGetCart(){
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
  catch(e){ return []; }
}
function scSaveCart(cart){
  localStorage.setItem('cart', JSON.stringify(cart));
  scUpdateCartBadge();
}
function scCartCount(){
  var cart = scGetCart();
  var total = 0;
  cart.forEach(function(item){
    total += parseInt(item.qty || 1, 10);
  });
  return total;
}
function scUpdateCartBadge(){
  var badge = document.querySelector('.cart-count-badge');
  if(!badge) return;
  var count = scCartCount();
  if(count > 0){
    badge.textContent = String(count);
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

// Add current product page item to cart
function addToCart(){
  try{
    var titleEl = document.querySelector('main h1');
    var priceEl = document.querySelector('main p');
    var imgEl   = document.querySelector('main img');
    if(!titleEl || !priceEl){ alert('Unable to add this item.'); return; }

    var title = titleEl.textContent.trim();
    var priceText = priceEl.textContent.trim();
    var price = parseInt(priceText.replace(/[^0-9]/g,''), 10) || 0;
    var img = imgEl ? imgEl.getAttribute('src') : '';
    var sizeBtn = document.querySelector('.size-btn.selected') || document.querySelector('.size-btn');
    var size = sizeBtn ? sizeBtn.textContent.trim() : '';
    var id = document.body.getAttribute('data-product-id') || title;

    var cart = scGetCart();
    var existingIndex = cart.findIndex(function(i){
      return i.id === id && i.size === size;
    });
    if(existingIndex > -1){
      cart[existingIndex].qty = (parseInt(cart[existingIndex].qty || 1,10) + 1);
    } else {
      cart.push({ id:id, title:title, price:price, qty:1, size:size, img:img });
    }
    scSaveCart(cart);
    alert('Added to cart');
  }catch(e){
    console.error(e);
    alert('Could not add item');
  }
}

// Render cart page if cart container present
function scRenderCartPage(){
  var container = document.getElementById('cart-items');
  var emptyEl   = document.getElementById('cart-empty');
  var totalEl   = document.getElementById('cart-total');
  if(!container) return;

  var cart = scGetCart();
  if(!cart.length){
    if(emptyEl) emptyEl.style.display = 'block';
    container.innerHTML = '';
    if(totalEl) totalEl.textContent = '₹0';
    return;
  }
  if(emptyEl) emptyEl.style.display = 'none';

  var total = 0;
  var html = '';
  cart.forEach(function(item, idx){
    var lineTotal = (item.price || 0) * (parseInt(item.qty || 1,10));
    total += lineTotal;
    html += '<div class="cart-row">' +
      '<div style="flex:1;">' +
        '<div style="font-weight:600;">'+ (item.title || '') +'</div>' +
        '<div style="font-size:13px;color:#555;">Size: '+ (item.size || '-') +'</div>' +
      '</div>' +
      '<div style="width:80px;">₹'+ (item.price || 0) +'</div>' +
      '<div style="width:70px;">' +
        '<input type="number" min="1" value="'+ (item.qty || 1) +'" ' +
        'onchange="scChangeQty('+idx+', this.value)" ' +
        'style="width:100%;padding:4px;border-radius:6px;border:1px solid #ddd;">' +
      '</div>' +
      '<div style="width:70px;text-align:right;">' +
        '<button onclick="scRemoveItem('+idx+')" style="border:none;background:none;color:#c00;cursor:pointer;font-size:13px;">Remove</button>' +
      '</div>' +
    '</div>';
  });
  container.innerHTML = html;
  if(totalEl) totalEl.textContent = '₹'+ total;
}

function scChangeQty(index, value){
  var cart = scGetCart();
  if(!cart[index]) return;
  cart[index].qty = parseInt(value || 1,10) || 1;
  scSaveCart(cart);
  scRenderCartPage();
}
function scRemoveItem(index){
  var cart = scGetCart();
  cart.splice(index,1);
  scSaveCart(cart);
  scRenderCartPage();
}

// ---------- WISHLIST ----------
function scGetWishlist(){
  try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
  catch(e){ return []; }
}
function scSaveWishlist(list){
  localStorage.setItem('wishlist', JSON.stringify(list));
}
function scIsWishlisted(id){
  var list = scGetWishlist();
  return list.some(function(i){ return i.id === id; });
}
function scToggleWishlist(product){
  var list = scGetWishlist();
  var idx = list.findIndex(function(i){ return i.id === product.id; });
  if(idx > -1){
    list.splice(idx,1);
  } else {
    list.push(product);
  }
  scSaveWishlist(list);
}

// Attach wishlist hearts on product grid
function scSetupWishlistHearts(){
  var cards = document.querySelectorAll('.product-card');
  if(!cards.length) return;
  cards.forEach(function(card){
    var link = card.querySelector('a[href*="product_pages/"]');
    if(!link) return;
    var url   = link.getAttribute('href');
    var id    = url.split('/').pop().replace('.html','');
    var title = (card.querySelector('h3') || {}).textContent || '';
    title = title.trim();
    var imgEl = card.querySelector('img');
    var img   = imgEl ? imgEl.getAttribute('src') : '';
    var priceEl = card.querySelector('.product-price');
    var priceText = priceEl ? priceEl.textContent.trim() : '';
    var price = parseInt(priceText.replace(/[^0-9]/g,''),10) || 0;

    // create heart
    var heart = document.createElement('button');
    heart.className = 'wishlist-heart';
    heart.type = 'button';
    heart.innerHTML = '♥';
    heart.setAttribute('data-id', id);

    if(scIsWishlisted(id)){
      heart.classList.add('active');
    }

    heart.addEventListener('click', function(e){
      e.preventDefault();
      scToggleWishlist({ id:id, title:title, img:img, price:price, url:url });
      if(scIsWishlisted(id)){
        heart.classList.add('active');
      } else {
        heart.classList.remove('active');
      }
    });

    card.style.position = 'relative';
    card.appendChild(heart);
  });
}

// Render wishlist page if present
function scRenderWishlistPage(){
  var container = document.getElementById('wishlist-container');
  if(!container) return;
  var list = scGetWishlist();
  if(!list.length){
    container.innerHTML = '<p>No items in wishlist yet.</p>';
    return;
  }
  var html = '<div class="wishlist-grid">';
  list.forEach(function(item, idx){
    html += '<article class="product-card">' +
      '<a href="'+ (item.url || '#') +'">' +
        (item.img ? '<img src="'+item.img+'" alt="">' : '') +
        '<h3>'+ (item.title || '') +'</h3>' +
        '<div class="product-price">₹'+ (item.price || 0) +'</div>' +
      '</a>' +
      '<button type="button" class="wishlist-remove" onclick="scRemoveWishlistItem('+idx+')">Remove</button>' +
    '</article>';
  });
  html += '</div>';
  container.innerHTML = html;
}
function scRemoveWishlistItem(idx){
  var list = scGetWishlist();
  list.splice(idx,1);
  scSaveWishlist(list);
  scRenderWishlistPage();
}

// ---------- AUTH ----------
function logoutUser(){
  try { localStorage.removeItem('loggedIn'); } catch(e){}
  alert('Logged out');
  window.location.href = 'index.html';
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', function(){
  scUpdateCartBadge();
  scRenderCartPage();
  scSetupWishlistHearts();
  scRenderWishlistPage();
});
