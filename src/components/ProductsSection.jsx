import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchOffers, getErrorMessage } from '../services/api';
import CategoryChips from './CategoryChips';
import ProductCard from './ProductCard';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import './ProductsSection.css';

export default function ProductsSection({ categories }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOffers = searchParams.get('offers') === '1';
  const selected = searchParams.get('category') || 'All';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const sectionRef = useRef(null);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const request = isOffers ? fetchOffers() : fetchProducts(selected);
    request
      .then((data) => !cancelled && setProducts(data))
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [selected, isOffers, attempt]);

  // ينزل لقسم المنتجات عند اختيار تصنيف أو عند فتح العروض
  useEffect(() => {
    if (selected !== 'All' || isOffers) {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selected, isOffers]);

  const handleSelect = (name) => {
    setSearchParams(name === 'All' ? {} : { category: name });
  };

  return (
    <section className="products" id="products" ref={sectionRef}>
      <h2 className="products__title">{isOffers ? 'Special Offers' : 'Our Fragrances'}</h2>
      <CategoryChips
        categories={categories}
        selected={isOffers ? '' : selected}
        onSelect={handleSelect}
      />

      {loading && <Loader text="Loading products..." />}
      {error && <ErrorMessage message={error} onRetry={retry} />}
      {!loading && !error && products.length === 0 && (
        <p className="state-msg">
          {isOffers ? 'No offers available right now.' : 'No products found in this category.'}
        </p>
      )}
      {!loading && !error && (
        <div className="products__grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}