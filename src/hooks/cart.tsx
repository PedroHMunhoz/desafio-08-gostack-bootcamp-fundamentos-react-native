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
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prodStorage = await AsyncStorage.getItem('@GoMarketplace:products');

      if (prodStorage) {
        setProducts(JSON.parse(prodStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // Copia o array do state
      const currentProducts: Product[] = [...products];

      // Verifica se o produto já existe no carrinho
      const productIndex = currentProducts.findIndex(
        prod => prod.id === product.id,
      );

      // Significa que o produto já existe no array
      if (productIndex !== -1) {
        currentProducts[productIndex].quantity += 1;
      } else {
        // Insere no array copiado o novo produto enviado, com quantidadde = 1
        // O Spread pega todas as propriedades do primeiro parâmetro e adiciona o que veio depois da vírgula
        currentProducts.push({ ...product, quantity: 1 });
      }
      // Seta no state o array alterado
      setProducts(currentProducts);

      // Seta no AsyncStorage os produtos
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(currentProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // Copia o array do state
      const currentProducts: Product[] = [...products];

      const productIndex = currentProducts.findIndex(prod => prod.id === id);

      if (productIndex !== -1) {
        currentProducts[productIndex].quantity += 1;

        // Seta no state o array alterado
        setProducts(currentProducts);
      }

      // Seta no AsyncStorage os produtos
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(currentProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // Copia o array do state
      const currentProducts: Product[] = [...products];

      // Encontra o index onde está o produto
      const productIndex = currentProducts.findIndex(prod => prod.id === id);

      if (productIndex !== -1) {
        // Se caso ele tenha somente 1 unidade, remove ele do array
        if (currentProducts[productIndex].quantity == 1) {
          currentProducts.splice(productIndex, 1);
        } else {
          // Senão, decrementa a quantidade
          currentProducts[productIndex].quantity -= 1;
        }

        // Seta no state o array alterado
        setProducts(currentProducts);
      }

      // Seta no AsyncStorage os produtos
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(currentProducts),
      );
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
