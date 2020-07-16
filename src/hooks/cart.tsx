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
      const productsFromAsyncStorage = await AsyncStorage.getItem(
        '@GoMarket:products',
      );

      if (productsFromAsyncStorage) {
        setProducts(JSON.parse(productsFromAsyncStorage));
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function storeProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    }
    storeProducts();
  }, [products]);

  const addToCart = useCallback(async product => {
    setProducts(state => {
      const productsData = [...state];
      const findProduct = productsData.find(item => item.id === product.id);

      if (!findProduct) {
        return [...productsData, { ...product, quantity: 1 }];
      }

      if (findProduct.quantity) {
        findProduct.quantity += 1;
      }

      return [...productsData];
    });
  }, []);

  const increment = useCallback(
    async id => {
      const newState = [...products];
      const product = newState.find(item => item.id === id);
      if (product && product.quantity) {
        product.quantity += 1;
        setProducts(newState);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newState = [...products];
      const product = newState.find(item => item.id === id);

      if (product && product.quantity && product.quantity > 1) {
        product.quantity -= 1;

        setProducts(newState);
      }
    },
    [products],
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
