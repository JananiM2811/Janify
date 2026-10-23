# Janify — Groceries, simplified. (React Native + Expo)

A mobile grocery shopping application built with **React Native & Expo**, inspired by modern Figma grocery app UI designs with strict **Role-Based Access Control (RBAC)** without requiring any external database.


## 🌐 Live Demo

- **Open the app in a browser:** https://jananim2811.github.io/Janify/
- **Source code:** https://github.com/JananiM2811/Janify
- **Admin login:** `admin@janify.com` / `admin123`
- **Customer login:** `customer@grocery.com` / `customer123` (or sign up as a new customer)
- **Razorpay test card:** `4111 1111 1111 1111`, any future expiry, any CVV

> Data (accounts, products, coupons) is saved in each browser/device separately — there is no backend.

### Publish an update
```bash
npm run deploy
```

---

## 🔐 Role-Based Access Control (RBAC) Architecture

### 1. **Store Owner (Admin) — Single Fixed Account**
- **Unique Account:** There is only **one** Admin account representing the store owner/manager.
- **Fixed Credentials:**
  - **Email:** `admin@janify.com`
  - **Password:** `admin123`
- **Registration Policy:** Admin account cannot be registered via Sign Up (it is pre-configured and unique).
- **Owner Privileges:**
  - Full catalog viewing and real-time live search.
  - Store Inventory Executive Dashboard banner (Total catalog items, low stock alerts, inventory valuation).
  - **Add New Grocery Products** with complete modal form validation.
  - **Edit** existing grocery products (price, weight, stock, description).
  - **Delete** products directly from the grocery cards.
  - The Owner does **not** shop: no Add to Cart, Favorites or Cart screens for this role.

### 2. **Customers — Dynamic In-Memory JSON Registration**
- **Customer Sign Up:** Anyone can register as a new customer using the **Sign Up** tab on the home screen.
- **In-Memory JSON Store:** Customer accounts are stored in dynamic React state (`registeredCustomers`), initialized with a default demo customer:
  - **Demo Customer:** `customer@grocery.com` / `customer123`
- **Customer Privileges:**
  - Browse daily grocery catalog & filter by categories (*Fruits, Vegetables, Dairy, Bakery, Beverages, Snacks*).
  - Add single or multiple items to Cart.
  - Add / remove grocery items to **Favorites**.
  - Add items to Cart directly from the **Favorites Screen**.
  - View & Edit Customer Profile (Full Name, 10-digit Phone, Email, Delivery Address).
  - Adjust Cart item quantities (`+` and `-`) with live subtotal, discount voucher, and delivery fee calculation.
  - Complete checkout order flow with simulated order confirmation receipt.

---

## 📋 Evaluation Criteria & Part-by-Part Mapping

### **Part - I (30 Marks): React Native Screens**
1. **Home Screen with Sign Up & Sign In (Admin & Customer)** [5 Marks]
   - File: `src/screens/AuthScreen.js`
   - Initial landing screen when app is opened.
   - Separate **Sign In** tab (for Owner Admin & Registered Customers) and **Sign Up** tab.
   - Full validation: Valid email format, 6+ character password, name required, password matching.
   - Test accounts:
     - 👑 **Store Owner (Admin)**: `admin@janify.com` / `admin123`
     - 👤 **Demo Customer**: `customer@grocery.com` / `customer123`
2. **Daily Grocery Food Products List Screen (Admin & Customer)** [5 Marks]
   - File: `src/screens/ProductsScreen.js`
   - Real-time live search by item name, category, or description.
   - Category selector pills (All, Fruits, Vegetables, Dairy, Bakery, Beverages, Snacks).
   - Filter chips (Organic Only, Price: Low to High, Top Rated).
   - Grocery cards with high-definition imagery, organic tags, ratings, prices, and favorite toggles.
   - **Admin Features**: Executive Inventory Dashboard banner, "+ Add Product" button with full modal form validation, plus Edit and Delete actions on grocery cards.
3. **Profile and Edit Profile Screen (Customer)** [5 Marks]
   - Files: `src/screens/ProfileScreen.js` & `src/screens/EditProfileScreen.js`
   - Name, email, phone number and address (no profile photo). Role-specific stats for Owner vs Customer.
   - Loyalty points & order stats badges.
   - Form validation on Edit Profile: name required, email regex, 10-digit phone number check, delivery address length check.
4. **Add Favorite Screen (Customer)** [5 Marks]
   - File: `src/screens/FavoritesScreen.js`
   - Bookmark collection of favorite grocery items.
   - Direct "Add to Cart" button from the favorite screen.
   - Remove from favorite toggle.
5. **Product's Details Screen (Customer / Student)** [5 Marks]
   - File: `src/screens/ProductDetailsScreen.js`
   - Hero grocery banner with favorite heart toggle and back button.
   - Freshness & certified organic badges, stock availability pill.
   - Portion / Weight size selector (`500g`, `1 kg`, `2 kg`).
   - Quantity picker with `+` and `-` steppers.
   - Health and nutritional breakdown (Calories, Protein, Carbs, Healthy Fats).
   - Sticky bottom bar with live calculated price and "Add to Cart" button.
6. **My Cart Screen (Customer)** [5 Marks]
   - File: `src/screens/CartScreen.js`
   - Itemized list with thumbnail, title, selected weight, unit price, and item total.
   - Live quantity increment (`+`) and decrement (`-`) steppers (removes when decremented past 1).
   - Trash icon to remove items or "Clear All" button.
   - Promo voucher input with validation (`FRESH10` for 10% off, `SAVE20` for 20% off).
   - "Proceed to Checkout" button opening an Order Confirmation receipt modal.

---

### **Part - II (30 Marks): React Navigation (All 3 Implemented)**
1. **(i) Stack Navigation [10 Marks]**:
   - File: `src/navigation/RootNavigator.js`
   - Root stack managing `Auth`, `Main` (Drawer + Tabs), `ProductDetails`, `EditProfile`, `Cart`, and `Favorites`.
2. **(ii) Tabs Navigation [10 Marks]**:
   - File: `src/navigation/BottomTabNavigator.js`
   - 4 Bottom tabs with active tint, custom Ionicons, and dynamic badge counts:
     - `Home` (Daily Groceries)
     - `FavoritesTab` (with live favorite count badge)
     - `CartTab` (with live cart quantity badge)
     - `ProfileTab` (Customer Profile)
3. **(iii) Drawer Navigation [10 Marks]**:
   - Files: `src/navigation/DrawerNavigator.js` & `src/navigation/CustomDrawerContent.js`
   - Custom drawer sidebar with:
     - Profile header with Name, Email, and Role Badge (Store Owner / Customer).
     - Direct menu links with icon and badge counters.
     - Role-based menu links and a Sign Out / Switch Account option.

---

### **Part - III (15 Marks): Functional Requirements**
- **(i) All users can navigate each screen [5 Marks]**: Complete navigation links via Drawer, Bottom Tabs, and Stack buttons.
- **(ii) Add single or multiple products from products screen and/or favorite screen to cart [5 Marks]**:
  - Add to cart from Product Cards.
  - Add multiple quantities and portion sizes from Product Details screen.
  - Add directly to cart from the Favorites screen.
- **(iii) Add or Subtract items in cart screen [5 Marks]**: Responsive `+` and `-` quantity steppers with instantaneous total recalculation.

---

## 🚀 How to Run the App

### 1. In Browser (Quickest for Testing):
```bash
npm run web
```
Open `http://localhost:8081` in Chrome or Safari.

### 2. On Mobile (iOS or Android via Expo Go):
```bash
npx expo start
```
Scan the QR code displayed in the terminal using the **Expo Go** app on your phone.

---

## ➕ Extra Features

- **Store Owner tabs:** Inventory (add / edit / delete products, add new categories), **Analytics** (stock, inventory value in ₹, stock by category, low-stock list) and **Coupons** (create a % discount for the whole cart or one product).
- **Customers** can type a coupon code in the cart to get the discount (the list of codes is only visible to the Owner).
- **Currency:** all prices are in Indian Rupees (₹). Free delivery above ₹500, otherwise ₹40.
- **Profile photo:** tap the photo on Profile / Edit Profile to pick one from the gallery (`expo-image-picker`).
- **Payments:** Cash on Delivery or **Pay Online with Razorpay** (Test Mode).
  - Works in Expo Go without a backend: Razorpay's web checkout runs inside a WebView (`src/components/RazorpayCheckout.js`), and loads directly in the browser on web.
  - Put your Razorpay **Test Key ID** in `src/config/razorpay.js` (never the Key Secret).
  - Test card: `4111 1111 1111 1111`, any future expiry, any CVV. Test UPI: `success@razorpay`.
  - Note: without a backend, payments are not signature-verified and no Razorpay Order is created, so this is for demo / test mode only.
