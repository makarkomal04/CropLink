import { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        if (product.quantity <= 0) {
            alert('This product is out of stock');
            return;
        }

        const existItem = cartItems.find((x) => x._id === product._id);
        if (existItem) {
            if (existItem.qty + 1 > product.quantity) {
                alert(`Only ${product.quantity}kg available in stock`);
                return;
            }
            setCartItems(
                cartItems.map((x) =>
                    x._id === product._id ? { ...x, qty: x.qty + 1 } : x
                )
            );
        } else {
            setCartItems([...cartItems, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter((x) => x._id !== id));
    };

    const updateQty = (id, qt) => {
        setCartItems(cartItems.map(item => {
            if (item._id === id) {
                const newQty = Math.max(1, Number(qt));
                if (newQty > item.quantity) {
                    alert(`Only ${item.quantity}kg available in stock`);
                    return { ...item, qty: item.quantity };
                }
                return { ...item, qty: newQty };
            }
            return item;
        }));
    }

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
