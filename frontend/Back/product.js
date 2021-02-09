var urlString = window.location.search;
var urlParam = new URLSearchParams(urlString);
const sousCtgId = urlParam.get('id');

console.log(sousCtgId)



const productDOM = document.querySelector(".product__center");
const cartDOM = document.querySelector(".cart");
const cartContent = document.querySelector(".cart__centent");
const openCart = document.querySelector(".cart__icon");
const closeCart = document.querySelector(".close__cart");
const overlay = document.querySelector(".cart__overlay");
const cartTotal = document.querySelector(".cart__total");
const clearCartBtn = document.querySelector(".clear__cart");
const itemTotals = document.querySelector(".item__total");



let category_menu = document.getElementById('menu-accordeon');


// get category from db 

axios.get('http://localhost:8080/categories')
.then(function (response) {
  
    response.data.forEach(element => {
        category_menu.innerHTML += `
        <li class="nav-item">
        <a class="nav-link" href="sousCategory.html?id=${element._id}">${element.nom}</a>
      </li>   
        `
        
    });
    
}).catch(function (err) {
    console.log(err);
});





let cart = [];

let buttonDOM = [];

class UI {
  displayProducts(products) {
    let results = "";
    products.forEach(({ nom, prix, _id }) => {
      results += `<!-- Single Product -->
      <div class="product">
      <div class="card">
      <img class="card-img-top" src="https://cdn.pixabay.com/photo/2016/05/25/10/43/hamburger-1414422_960_720.jpg" alt="Card image cap">
      <div class="card-body">
        <h5 class="card-title">${nom}</h5>
        <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.</p>
        <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
        <h5 class="card-title">${prix}DH</h5>
        <button class="btn addToCart" data-id= ${_id} >Add to Cart</button>
      </div>
    </div>
    </div>
      
      `;
    });

    productDOM.innerHTML = results;
  }

  getButtons() {
    const buttons = [...document.querySelectorAll(".addToCart")];
    buttonDOM = buttons;
    buttons.forEach(button => {
      const id = button.dataset.id;
      const inCart = cart.find(item => item._id === id);

      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      button.addEventListener("click", e => {
        e.preventDefault();
        e.target.innerHTML = "In Cart";
        e.target.disabled = true;

        // Get product from products
        const cartItem = { ...Storage.getProduct(id), amount: 1 };

        // Add product to cart
        cart = [...cart, cartItem];

        // save the cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setItemValues(cart);
        // display the cart item
        this.addCartItem(cartItem);
        // show the cart
      });
    });
  }

  setItemValues(cart) {
    let tempTotal = 0;
    let itemTotal = 0;

    cart.map(item => {
      tempTotal += item.prix * item.amount;
      itemTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    itemTotals.innerText = itemTotal;
  }

  addCartItem({ prix, nom, _id }) {
    const div = document.createElement("div");
    div.classList.add("cart__item");

    div.innerHTML = `
        
        
        <div class="product">
        <div class="card">
        <img class="card-img-top" src="https://cdn.pixabay.com/photo/2016/05/25/10/43/hamburger-1414422_960_720.jpg" alt="Card image cap">
        <div class="card-body">
          <h5 class="card-title">${nom}</h5>
          <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.</p>
          <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
          <h5 class="card-title">${prix}DH</h5>
        </div>
      </div>
      </div>
      <span class="increase" data-id=${_id}>
      <svg>
        <use xlink:href="./images/sprite.svg#icon-angle-up"></use>
      </svg>
    </span>
    <p class="item__amount">1</p>
    <span class="decrease" data-id=${_id}>
      <svg>
        <use xlink:href="images/sprite.svg#icon-angle-down"></use>
      </svg>
    </span>
  </div>

    <span class="remove__item" data-id=${_id}>
      <svg>
        <use xlink:href="images/sprite.svg#icon-trash"></use>
      </svg>
    </span>
        
        
        
        `;
    cartContent.appendChild(div);
  }

  show() {
    cartDOM.classList.add("show");
    overlay.classList.add("show");
  }

  hide() {
    cartDOM.classList.remove("show");
    overlay.classList.remove("show");
  }

  setAPP() {
    cart = Storage.getCart();
    this.setItemValues(cart);
    this.populate(cart);

    openCart.addEventListener("click", this.show);
    closeCart.addEventListener("click", this.hide);
  }

  populate(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  cartLogic() {
    // Clear Cart
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
      this.hide();
    });

    // Cart Functionality
    cartContent.addEventListener("click", e => {
      const target = e.target.closest("span");
      const targetElement = target.classList.contains("remove__item");
      if (!target) return;

      if (targetElement) {
        const id = target.dataset.id;
        this.removeItem(id);
        cartContent.removeChild(target.parentElement);
      } else if (target.classList.contains("increase")) {
        const id =target.dataset.id;
        let tempItem = cart.find(item => item._id === id);
        tempItem.amount++;
        Storage.saveCart(cart);
        this.setItemValues(cart);
        target.nextElementSibling.innerText = tempItem.amount;
      } else if (target.classList.contains("decrease")) {
        const id = target.dataset.id;
        let tempItem = cart.find(item => item._id === id);
        tempItem.amount--;

        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setItemValues(cart);
          target.previousElementSibling.innerText = tempItem.amount;
        } else {
          this.removeItem(id);
          cartContent.removeChild(target.parentElement.parentElement);
        }
      }
    });
  }

  clearCart() {
    const cartItems = cart.map(item => item._id);
    cartItems.forEach(id => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeItem(id) {
    cart = cart.filter(item => item._id !== id);
    this.setItemValues(cart);
    Storage.saveCart(cart);

    let button = this.singleButton(id);
    button.disabled = false;
    button.innerText = "Add to Cart";
  }

  singleButton(id) {
    return buttonDOM.find(button => button.dataset.id === id);
  }
}

class Products {
  async getProducts() {
    try {
      const result = await fetch(`http://localhost:8080/products/${sousCtgId}`);
      const products = await result.json();
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

class Storage {
  static saveProduct(obj) {
    localStorage.setItem("products", JSON.stringify(obj));
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getProduct(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product._id === id);
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const productList = new Products();
  const ui = new UI();

  ui.setAPP();

  const products = await productList.getProducts();
  ui.displayProducts(products);
  Storage.saveProduct(products);
  ui.getButtons();
  ui.cartLogic();
});
