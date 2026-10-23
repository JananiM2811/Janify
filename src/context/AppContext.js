import React, { createContext, useContext, useState, useMemo, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_PRODUCTS, CATEGORIES } from '../data/initialProducts';

const AppContext = createContext();

// Saved on the device (phone storage / browser localStorage) so data survives
// app reloads. Not a database or backend - it lives only on this device.
const STORAGE_KEYS = {
  adminAccount: 'harvesta.adminAccount',
  customers: 'harvesta.customers',
  products: 'harvesta.products',
  categories: 'harvesta.categories',
  coupons: 'harvesta.coupons',
};

// Only two roles exist in the app
export const ROLES = {
  ADMIN: 'admin', // Store Owner
  CUSTOMER: 'customer',
};

// Admin login used before it was changed to admin@janify.com
const OLD_ADMIN_EMAIL = 'admin@grocery.com';

// Unique Store Owner (Admin) - Single fixed account
export const ADMIN_OWNER = {
  id: 'admin-owner-1',
  name: 'Admin Alex',
  email: 'admin@janify.com',
  password: 'admin123',
  phone: '+91 98400 12345',
  address: 'Janify Store, Anna Nagar, Chennai 600040',
  role: ROLES.ADMIN,
};

// Initial Registered Customers (In-Memory Store, no DB / backend)
export const INITIAL_CUSTOMERS = [
  {
    id: 'user-cust-1',
    name: 'Sarah Jenkins',
    email: 'customer@grocery.com',
    password: 'customer123',
    phone: '+91 98765 43210',
    address: '12 Gandhi Street, T. Nagar, Chennai 600017',
    role: ROLES.CUSTOMER,
    loyaltyPoints: 340,
    ordersCount: 14,
  },
];

const INITIAL_COUPONS = [
  { code: 'FRESH10', percent: 10, productId: null },
  { code: 'SAVE20', percent: 20, productId: null },
];

// Delivery pricing (in ₹)
export const FREE_DELIVERY_MIN = 500;
export const DELIVERY_FEE = 40;

const INITIAL_CART = [
  {
    id: 'prod-1',
    product: INITIAL_PRODUCTS[0],
    quantity: 2,
    weight: '1 kg',
    unitPrice: 60,
  },
  {
    id: 'prod-7',
    product: INITIAL_PRODUCTS[6],
    quantity: 1,
    weight: '12 pcs',
    unitPrice: 90,
  },
];

export const AppProvider = ({ children }) => {
  // In-Memory Accounts
  const [adminAccount, setAdminAccount] = useState(ADMIN_OWNER);
  const [registeredCustomers, setRegisteredCustomers] = useState(INITIAL_CUSTOMERS);

  // Active User & Auth State (Starts on Sign In / Sign Up page)
  const [user, setUser] = useState(INITIAL_CUSTOMERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isAdmin = user.role === ROLES.ADMIN;

  // Products State (Catalog)
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Categories State (Owner can add new ones)
  const [categories, setCategories] = useState(CATEGORIES);

  // Favorites State (Array of product IDs)
  const [favorites, setFavorites] = useState(['prod-1', 'prod-3', 'prod-7']);

  // Cart State: [{ id: productId, product, quantity, weight, unitPrice }]
  const [cart, setCart] = useState(INITIAL_CART);

  // Toast / Status banner
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimer = useRef(null);

  // Coupons created by the Store Owner.
  // productId: null = whole cart, otherwise only that product's cart line is discounted.
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [appliedCouponCode, setAppliedCouponCode] = useState(null);

  // Load saved data once on start-up
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const setters = {
      [STORAGE_KEYS.adminAccount]: setAdminAccount,
      [STORAGE_KEYS.customers]: setRegisteredCustomers,
      [STORAGE_KEYS.products]: setProducts,
      [STORAGE_KEYS.categories]: setCategories,
      [STORAGE_KEYS.coupons]: setCoupons,
    };
    AsyncStorage.multiGet(Object.keys(setters))
      .then((pairs) => {
        pairs.forEach(([key, value]) => {
          if (value) {
            try {
              let saved = JSON.parse(value);
              // Devices that saved the admin before the email change still have the old
              // default login - switch it to the new one, keeping the admin's other edits.
              if (key === STORAGE_KEYS.adminAccount && saved.email === OLD_ADMIN_EMAIL) {
                saved = { ...saved, email: ADMIN_OWNER.email };
              }
              setters[key](saved);
            } catch {
              // Ignore corrupt entries and keep the defaults
            }
          }
        });
      })
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, []);

  // Save whenever these change (only after loading, so defaults don't overwrite saved data)
  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.multiSet([
      [STORAGE_KEYS.adminAccount, JSON.stringify(adminAccount)],
      [STORAGE_KEYS.customers, JSON.stringify(registeredCustomers)],
      [STORAGE_KEYS.products, JSON.stringify(products)],
      [STORAGE_KEYS.categories, JSON.stringify(categories)],
      [STORAGE_KEYS.coupons, JSON.stringify(coupons)],
    ]).catch(() => {});
  }, [isReady, adminAccount, registeredCustomers, products, categories, coupons]);

  const showToast = (message) => {
    // Restart the timer so a newer toast is not hidden early by an older one
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // RBAC Auth Functions: Single Admin Owner + Dynamic Customer Registration
  const login = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Check if Admin Owner login
    if (cleanEmail === adminAccount.email.toLowerCase()) {
      if (password === adminAccount.password) {
        setUser(adminAccount);
        setIsAuthenticated(true);
        showToast('Welcome, Admin!');
        return { success: true };
      }
      return { success: false, message: 'Incorrect Admin password.' };
    }

    // 2. Check if Registered Customer login
    const matchedCustomer = registeredCustomers.find(
      (c) => c.email.toLowerCase() === cleanEmail
    );

    if (!matchedCustomer) {
      return {
        success: false,
        message: 'No customer account found with this email. Please Sign Up!',
      };
    }
    if (matchedCustomer.password !== password) {
      return { success: false, message: 'Incorrect password for this customer account.' };
    }

    setUser(matchedCustomer);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${matchedCustomer.name}!`);
    return { success: true };
  };

  const isEmailTaken = (cleanEmail, exceptId) =>
    (adminAccount.id !== exceptId && adminAccount.email.toLowerCase() === cleanEmail) ||
    registeredCustomers.some((c) => c.id !== exceptId && c.email.toLowerCase() === cleanEmail);

  // Customer Sign Up (Only Customer can register)
  const signup = (name, email, password, phone = '', address = '') => {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (cleanEmail === adminAccount.email.toLowerCase()) {
      return { success: false, message: 'An account with this email already exists. Please Sign In!' };
    }
    if (isEmailTaken(cleanEmail)) {
      return { success: false, message: 'An account with this email already exists. Please Sign In!' };
    }

    const newCustomer = {
      id: `user-cust-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone.trim(),
      address: address.trim(),
      role: ROLES.CUSTOMER, // strictly customer
      loyaltyPoints: 100, // 100 Free Welcome Points
      ordersCount: 0,
    };

    setRegisteredCustomers((prev) => [newCustomer, ...prev]);
    setUser(newCustomer);
    setCart([]);
    setIsAuthenticated(true);
    showToast(`Account created! Welcome to Janify, ${newCustomer.name}`);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    // Cart belongs to the signed-in session; don't leak it to the next user
    setCart([]);
    setAppliedCouponCode(null);
    showToast('Signed out successfully');
  };

  // Saves the profile to the active user AND the in-memory account store,
  // so the changes (incl. a new email) still work after signing out and in again.
  const updateProfile = (updatedFields) => {
    const cleanEmail = (updatedFields.email || '').trim().toLowerCase();
    if (cleanEmail && isEmailTaken(cleanEmail, user.id)) {
      return { success: false, message: 'Another account already uses this email.' };
    }

    const updatedUser = { ...user, ...updatedFields, email: cleanEmail || user.email };
    setUser(updatedUser);
    if (updatedUser.role === ROLES.ADMIN) {
      setAdminAccount(updatedUser);
    } else {
      setRegisteredCustomers((prev) =>
        prev.map((c) => (c.id === updatedUser.id ? updatedUser : c))
      );
    }
    showToast('Profile updated successfully!');
    return { success: true };
  };

  // Admin Catalog Management
  const addProduct = (newProduct) => {
    const price = parseFloat(newProduct.price) || 99;
    const created = {
      ...newProduct,
      id: `prod-${Date.now()}`,
      price,
      originalPrice: Math.round(price * 1.2),
      rating: 5.0,
      reviewsCount: 1,
      stock: Number.isNaN(parseInt(newProduct.stock, 10)) ? 20 : parseInt(newProduct.stock, 10),
      weights: newProduct.weights || ['500g', '1 kg'],
      nutrition: newProduct.nutrition || { calories: '90 kcal', protein: '2g', carbs: '15g', fat: '1g' },
    };
    setProducts((prev) => [created, ...prev]);
    showToast(`Added "${created.name}" to store catalog!`);
    return created;
  };

  const updateProduct = (id, fields) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...fields } : item))
    );
    // Keep any cart line for this product in sync with the new name/price/image
    setCart((prev) =>
      prev.map((line) =>
        line.id === id
          ? {
              ...line,
              product: { ...line.product, ...fields },
              unitPrice: fields.price !== undefined ? parseFloat(fields.price) : line.unitPrice,
            }
          : line
      )
    );
    showToast('Product updated!');
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.id !== id));
    setFavorites((prev) => prev.filter((favId) => favId !== id));
    showToast('Product removed from catalog');
  };

  // Blocked while products still use the category, so no product is left without one
  const deleteCategory = (id) => {
    if (id === 'all') return { success: false, message: '"All Items" cannot be deleted' };
    const category = categories.find((c) => c.id === id);
    if (!category) return { success: false, message: 'Category not found' };
    const count = products.filter((p) => p.category === id).length;
    if (count > 0) {
      return {
        success: false,
        message: `"${category.name}" has ${count} product${count === 1 ? '' : 's'}. Move or delete ${count === 1 ? 'it' : 'them'} first.`,
      };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast(`Category "${category.name}" deleted`);
    return { success: true };
  };

  const addCategory = (name) => {
    const cleanName = (name || '').trim();
    if (cleanName.length < 2) {
      return { success: false, message: 'Category name must be at least 2 characters' };
    }
    const id = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const exists = categories.some(
      (c) => c.id === id || c.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (!id || exists) {
      return { success: false, message: 'This category already exists' };
    }
    setCategories((prev) => [...prev, { id, name: cleanName, icon: 'pricetag-outline' }]);
    showToast(`Category "${cleanName}" added`);
    return { success: true, id };
  };

  // Favorites Management (Customer only)
  const isFavorite = (productId) => favorites.includes(productId);

  const toggleFavorite = (productId) => {
    if (isAdmin) return;
    if (favorites.includes(productId)) {
      setFavorites((prev) => prev.filter((id) => id !== productId));
      showToast('Removed from Favorites');
    } else {
      setFavorites((prev) => [...prev, productId]);
      showToast('Added to Favorites');
    }
  };

  // Cart Management (Customer only - the Store Owner does not shop)
  const addToCart = (product, quantity = 1, weight = null) => {
    if (isAdmin) return;
    if ((product.stock ?? 0) <= 0) {
      showToast(`${product.name} is out of stock`);
      return;
    }
    const chosenWeight = weight || (product.weights && product.weights[0]) || product.unit || '1 unit';
    const unitPrice = parseFloat(product.price);

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + quantity,
          weight: chosenWeight,
        };
        return copy;
      }
      return [
        ...prev,
        {
          id: product.id,
          product,
          quantity,
          weight: chosenWeight,
          unitPrice,
        },
      ];
    });
    showToast(`Added ${quantity}x ${product.name} to Cart`);
  };

  const incrementCartItem = (productId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementCartItem = (productId) => {
    const found = cart.find((item) => item.id === productId);
    if (found && found.quantity <= 1) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      showToast('Removed from Cart');
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    showToast('Item removed from Cart');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCouponCode(null);
  };

  // Completes checkout: empties the cart and counts the order on the profile
  const placeOrder = () => {
    const updatedUser = { ...user, ordersCount: (user.ordersCount || 0) + 1 };
    setUser(updatedUser);
    setRegisteredCustomers((prev) =>
      prev.map((c) => (c.id === updatedUser.id ? updatedUser : c))
    );
    clearCart();
  };

  // Owner: Coupon Management
  const addCoupon = ({ code, percent, productId = null }) => {
    const cleanCode = (code || '').trim().toUpperCase();
    const pct = parseInt(percent, 10);
    if (!/^[A-Z0-9]{3,15}$/.test(cleanCode)) {
      return { success: false, message: 'Code must be 3-15 letters/numbers (e.g. MANGO15)' };
    }
    if (Number.isNaN(pct) || pct < 1 || pct > 90) {
      return { success: false, message: 'Discount must be between 1% and 90%' };
    }
    if (coupons.some((c) => c.code === cleanCode)) {
      return { success: false, message: 'A coupon with this code already exists' };
    }
    setCoupons((prev) => [{ code: cleanCode, percent: pct, productId }, ...prev]);
    showToast(`Coupon ${cleanCode} created`);
    return { success: true };
  };

  const deleteCoupon = (code) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    if (appliedCouponCode === code) setAppliedCouponCode(null);
    showToast(`Coupon ${code} deleted`);
  };

  // Customer: Apply Coupon
  const applyCoupon = (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    const coupon = coupons.find((c) => c.code === cleanCode);
    if (!coupon) {
      return { success: false, message: 'Invalid promo code' };
    }
    if (coupon.productId && !cart.some((item) => item.id === coupon.productId)) {
      const product = products.find((p) => p.id === coupon.productId);
      return {
        success: false,
        message: `This coupon is only for "${product ? product.name : 'a specific product'}". Add it to your cart first.`,
      };
    }
    setAppliedCouponCode(cleanCode);
    showToast(`${coupon.percent}% Discount Applied!`);
    return { success: true };
  };

  const removeCoupon = () => {
    setAppliedCouponCode(null);
    showToast('Coupon removed');
  };

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  // Derived, so deleting a coupon or removing its product from the cart drops the discount
  const appliedCoupon = useMemo(
    () => coupons.find((c) => c.code === appliedCouponCode) || null,
    [coupons, appliedCouponCode]
  );

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const base = appliedCoupon.productId
      ? cart
          .filter((item) => item.id === appliedCoupon.productId)
          .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      : cartSubtotal;
    return Math.round(base * appliedCoupon.percent) / 100;
  }, [appliedCoupon, cart, cartSubtotal]);

  const deliveryFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return cartSubtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return Math.max(0, cartSubtotal - discountAmount + deliveryFee);
  }, [cartSubtotal, discountAmount, deliveryFee]);

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const favoriteProducts = useMemo(() => {
    return products.filter((p) => favorites.includes(p.id));
  }, [products, favorites]);

  return (
    <AppContext.Provider
      value={{
        isReady,
        user,
        isAdmin,
        // Passwords are stripped so screens can never display them
        customers: isAdmin ? registeredCustomers.map(({ password, ...rest }) => rest) : [],
        isAuthenticated,
        login,
        signup,
        logout,
        updateProfile,
        products,
        categories,
        addCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        favorites,
        favoriteProducts,
        isFavorite,
        toggleFavorite,
        cart,
        cartSubtotal,
        discountAmount,
        coupons,
        addCoupon,
        deleteCoupon,
        deliveryFee,
        cartTotal,
        cartCount,
        appliedCoupon,
        addToCart,
        incrementCartItem,
        decrementCartItem,
        removeFromCart,
        clearCart,
        placeOrder,
        applyCoupon,
        removeCoupon,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
