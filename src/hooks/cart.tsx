import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      try {
        const productsFromAsyncStorage = await AsyncStorage.getItem(
          '@GoMarket:products',
        );

        if (productsFromAsyncStorage) {
          setProducts(JSON.parse(productsFromAsyncStorage));
        }
      } catch (err) {
        throw new Error(err.message);
      }
    }
    loadProducts();
  }, []);

  const increment = useCallback(async id => {}, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const addToCart = useCallback(
    async product => {
      try {
        if (products === undefined) {
          setProducts({
            ...product,
            quantity: 1,
          });
          await AsyncStorage.setItem(
            '@GoMarket:products',
            JSON.stringify(products),
          );
        } else {
          const hasProduct = products.filter(item => item.id === product.id);

          if (hasProduct) {
            increment(product.id);
          }
          await AsyncStorage.setItem(
            '@GoMarket:products',
            JSON.stringify([...products, { ...product, quantity: 1 }]),
          );
        }
      } catch (err) {
        throw new Error(err.message);
      }
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
