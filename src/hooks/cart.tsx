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
      // await AsyncStorage.removeItem('@GoMarket:products');
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

  const increment = useCallback(async id => {
    console.log('increment');
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const addToCart = useCallback(
    async product => {
      const productsData = await AsyncStorage.getItem('@GoMarket:products');

      if (productsData) {
        const parsedProducts: Product[] = JSON.parse(productsData);
        const hasProduct = parsedProducts.some(item => item.id === product.id);

        if (hasProduct) {
          return increment(product.id);
        }
      }
      const newProduct: Product = {
        ...product,
        quantity: 1,
      };

      return setProducts([...products, newProduct]);
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
