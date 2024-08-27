const BASE_URL = 'https://kick-kart-tan.vercel.app';

document.addEventListener("DOMContentLoaded", () => {
    let cartIcon = document.querySelector('#cart-icon');
    let cart = document.querySelector('.cart1');
    let closeCart = document.querySelector("#close-cart");

    cartIcon.addEventListener('click', () => {
        cart.classList.add("cart1-active");
    });

    closeCart.addEventListener('click', () => {
        cart.classList.remove("cart1-active");
    });

    document.getElementById('product-container').addEventListener('click', async (event) => {
        if (event.target.closest('.cart')) {
            let shopProduct = event.target.closest('.product-box');
            if (shopProduct) {
                let title = shopProduct.querySelector('.product-title')?.innerText;
                let price = shopProduct.querySelector('.price')?.innerText;
                let productImg = shopProduct.querySelector('.product-img')?.src;

                if (title && price && productImg) {
                    await addProductToCart(title, parseFloat(price.replace("$", "")), productImg);
                    updateTotal();
                } else {
                    console.error("Product details are missing.");
                }
            } else {
                console.error("Product box not found.");
            }
        }
    });

    async function addProductToCart(productName, price, productImg) {
        let cartContent = document.querySelector('.cart-content');
        let cartItemNames = cartContent.getElementsByClassName('cart-product-title');

        for (let i = 0; i < cartItemNames.length; i++) {
            if (cartItemNames[i].innerText === productName) {
                alert("You have already added this item to the cart");
                return;
            }
        }

        let cartShopBox = document.createElement("div");
        cartShopBox.classList.add("cart-box");

        cartShopBox.innerHTML = 
            `<img src="${productImg}" alt="" class="cart-img">
            <div class="detail-box">
                <div class="cart-product-title">${productName}</div>
                <div class="cart-price">$${parseFloat(price).toFixed(2)}</div>
                <input type="number" value="1" class="cart-quantity">
            </div>
            <i class="fa-solid fa-trash cart-remove"></i>`;

        cartContent.appendChild(cartShopBox);

        cartShopBox.querySelector('.cart-remove').addEventListener('click', removeCartItem);
        cartShopBox.querySelector('.cart-quantity').addEventListener('change', quantityChanged);

        await saveCart(productName, price, productImg, 1); // Save to the database
        updateCart();
        updateTotal();
    }

    async function saveCart(title, price, productImg, quantity) {
        const cartItems = [{ title, price, productImg, quantity }];

        try {
            const response = await fetch(`${BASE_URL}/api/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ cartItems })
            });
    
            if (!response.ok) {
                throw new Error('Failed to save cart items');
            }
    
            console.log('Cart items saved:', await response.json());
        } catch (error) {
            console.error('Error saving cart items:', error);
        }
    }

    function removeCartItem(event) {
        let buttonClicked = event.target;
        let cartBox = buttonClicked.closest('.cart-box');
        let productName = cartBox.querySelector('.cart-product-title').innerText;
    
        cartBox.remove(); // Remove the item from the cart UI
        updateTotal(); // Update the total price
    
        // Send DELETE request to remove item from the cart in the database
        fetch(`${BASE_URL}/api/cart/${encodeURIComponent(productName)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to remove cart item');
            }
            return response.json();
        })
        .then(data => {
            console.log('Cart item removed:', data);
            updateCart(); // Update cart quantity display
        })
        .catch(error => {
            console.error('Error removing cart item:', error);
        });
    }
    

    function quantityChanged(event) {
        let input = event.target;
        if (isNaN(input.value) || input.value <= 0) {
            input.value = 1;
        }
        updateTotal();
        saveCart();
        updateCart();
    }

    function updateTotal() {
        let cartContent = document.querySelector('.cart-content');
        let cartBoxes = cartContent.getElementsByClassName('cart-box');
        let total = 0;
        for (let i = 0; i < cartBoxes.length; i++) {
            let cartBox = cartBoxes[i];
            let priceElement = cartBox.querySelector('.cart-price');
            let quantityElement = cartBox.querySelector('.cart-quantity');
            let price = parseFloat(priceElement.innerText.replace("$", ""));
            let quantity = quantityElement.value;
            total += price * quantity;
        }
        total = Math.round(total * 100) / 100;
        document.querySelector('.total-price').innerText = '$' + total;
    }

    function loadCart() {
        fetch(`${BASE_URL}/api/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.products) {
                data.products.forEach(item => {
                    addProductToCart(item.productName, item.price, item.productImg);
                });
            }
        })
        .catch(error => {
            console.error('Error loading cart items:', error);
        });
    }

    loadCart();

    function updateCart() {
        let cartBoxes = document.querySelectorAll('.cart-box');
        let quantity = 0;
        cartBoxes.forEach(cartBox => {
            let quantityElement = cartBox.querySelector('.cart-quantity');
            quantity += parseInt(quantityElement.value);
        });
        cartIcon.setAttribute('data-quantity', quantity);
    }

    document.querySelector('.btn-buy').addEventListener('click', async () => {
        const cartItems = Array.from(document.querySelectorAll('.cart-box')).map(cartBox => {
            return {
                title: cartBox.querySelector('.cart-product-title').innerText,
                price: parseFloat(cartBox.querySelector('.cart-price').innerText.replace('$', '')),
                productImg: cartBox.querySelector('.cart-img').src,
                quantity: parseInt(cartBox.querySelector('.cart-quantity').value)
            };
        });
    
        if (cartItems.length === 0) {
            console.error("No items in cart");
            return;
        }
    
        
            try {
        const response = await fetch(`${BASE_URL}/api/buy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ cartItems })
        });

        if (!response.ok) {
            throw new Error('Failed to save purchase');
        }

        const items = cartItems;
        const stripeResponse = await fetch('/stripe-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items })
        });

        if (!stripeResponse.ok) {
            throw new Error('Failed to initiate Stripe checkout');
        }

        const { url } = await stripeResponse.json();
        if (url) {
            window.location.href = url;
            clearCart();
        } else {
            console.error("No URL returned from the server");
        }
    } catch (err) {
        console.error('Error:', err);
    }
    });
    
    function clearCart() {
        var cartContent = document.getElementsByClassName("cart-content")[0];
        cartContent.innerHTML = "";
        updateTotal();
        localStorage.removeItem("cartItems");
        console.log("Cart has been cleared");
    }
});