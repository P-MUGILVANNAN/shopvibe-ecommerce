# ShopVibe - Basic E-Commerce Website

A responsive, beginner-friendly frontend e-commerce website built exclusively with **HTML5, CSS3, and Vanilla JavaScript (ES6)**.

## 🚀 Overview

- **No Frameworks**: Pure HTML, CSS, and Vanilla JavaScript. No React, Bootstrap, Node.js, or external libraries.
- **Dynamic API**: Fetches real catalog data from the [Fake Store API](https://fakestoreapi.com/products).
- **Persistent Storage**: Utilizes browser `LocalStorage` to save cart items, customer info, and demo orders across browser refreshes.
- **Responsive Layout**: Designed for mobile, tablet, and desktop screens using modern CSS Grid and Flexbox.

---

## 📁 Project Structure

```text
basic-ecommerce/
├── index.html            # Home page with hero banner, categories & featured products
├── products.html         # Catalog page with search, sort & category filters
├── product-details.html  # Dynamic product details with quantity selector & Buy Now
├── cart.html             # Interactive cart with quantity controls, subtotal & removal
├── checkout.html         # Form validation, order summary & demo order confirmation
├── style.css             # Unified modern stylesheet with responsive design
├── script.js             # Unified JavaScript for API fetching, DOM & LocalStorage
└── README.md             # Project documentation
```

---

## 🛠️ Features & Pages

### 1. Home Page (`index.html`)
- Professional header with logo, navigation links, and dynamic cart badge.
- Eye-catching hero banner with "Shop Now" call to action.
- Value proposition bar (Free shipping, secure checkout, 7-day returns).
- Category shortcut filters.
- Featured products dynamically retrieved from Fake Store API with loading spinner & error handling.

### 2. Product Catalog (`products.html`)
- Instant keyword search filtering by title, category, or description.
- Dynamic category pills (`men's clothing`, `women's clothing`, `jewelery`, `electronics`).
- Sort dropdown: Price (Low to High), Price (High to Low), and Customer Rating.
- Product count indicator and empty search state with filter reset.

### 3. Product Details (`product-details.html`)
- Reads product `id` from the URL query parameter (e.g. `product-details.html?id=1`).
- Fetches individual product data dynamically from `https://fakestoreapi.com/products/{id}`.
- Displays high-resolution image, title, rating stars, price in INR, and full description.
- Quantity selector (`-`, `+`, manual input).
- **Add to Cart** with toast notification and **Buy Now** with immediate checkout redirect.

### 4. Shopping Cart (`cart.html`)
- Reads cart data from `localStorage.getItem('ecommerce_cart')`.
- Displays product image, title, category, unit price, quantity controls, and subtotal.
- Increment (`+`), decrement (`-`), and delete (`✕`) buttons update state and UI immediately.
- If the cart is empty, displays a friendly message with a "Start Shopping" button.
- Calculates grand total with free shipping.
- "Clear Cart" and "Proceed to Checkout" actions.

### 5. Checkout (`checkout.html`)
- Customer form: Full Name, Email, Phone Number, Street Address, City, Postal Code.
- Client-side validation with real-time error styling.
- Demo payment selection: Cash on Delivery (COD), UPI / QR Code, Credit / Debit Card.
- Order summary preview with thumbnails, quantity, and total amount.
- Submitting an order:
  - Generates a unique demo Order ID (`ORD-XXXXXX`).
  - Saves the order to `localStorage.getItem('ecommerce_orders')`.
  - Saves customer details to `localStorage.getItem('ecommerce_user')` for auto-fill on future visits.
  - Clears `ecommerce_cart` and resets the navigation cart badge.
  - Displays an Order Confirmation modal with order details.

---

## 💾 LocalStorage Keys

| Key | Purpose |
| --- | --- |
| `ecommerce_cart` | Array of products in cart with `{ id, title, price, image, category, quantity }` |
| `ecommerce_orders` | Array of placed demo orders with customer info, items, totals, and timestamps |
| `ecommerce_user` | Saved demo customer profile for auto-filling checkout fields |

---

## 🏃‍♂️ How to Run

1. Open this folder in **VS Code**.
2. Install the **Live Server** extension if not already installed.
3. Right-click [`index.html`](file:///d:/STUDY/Python%20Full%20Stack%20Avadi/PRACTICE%20PROJECT/basic-ecommerce/index.html) and select **"Open with Live Server"**.
4. The website will launch automatically in your browser at `http://127.0.0.1:5500/basic-ecommerce/index.html` (or `http://127.0.0.1:5500/`).

