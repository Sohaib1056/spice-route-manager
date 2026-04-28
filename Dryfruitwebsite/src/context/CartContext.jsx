import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.weight === action.payload.weight
      );

      let newItems;
      if (existingIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      return calculateTotals({ ...state, items: newItems });
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        item => !(item.id === action.payload.id && item.weight === action.payload.weight)
      );
      return calculateTotals({ ...state, items: newItems });
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id && item.weight === action.payload.weight
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      return calculateTotals({ ...state, items: newItems });
    }

    case 'CLEAR_CART': {
      return initialState;
    }

    case 'LOAD_CART': {
      return action.payload;
    }

    default:
      return state;
  }
}

function calculateTotals(state) {
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return { ...state, totalItems, totalPrice };
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const savedCart = localStorage.getItem('dryfruitpro-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (e) {
        console.error('Failed to load cart from localStorage');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dryfruitpro-cart', JSON.stringify(state));
  }, [state]);

  const addItem = (product, weight) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        weight,
        price: product.pricePerWeight[weight],
        image: product.image,
        emoji: product.emoji || '🥜',
      },
    });
  };

  const removeItem = (id, weight) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, weight } });
  };

  const updateQuantity = (id, weight, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, weight, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
