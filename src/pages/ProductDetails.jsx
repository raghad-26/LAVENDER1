import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById, getErrorMessage } from '../services/api';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchProductById(id)
      .then((p) => !cancelled && setProduct(p))
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id, attempt]);

  if (loading) return <Loader text="Loading product..." />;
  if (error) return <ErrorMessage message={error} onRetry={retry} />;

  if (!product) {
    return (
      <div className="details__msg">
        <p>Product not found.</p>
        <Link to="/" className="btn btn--primary">Back to shop</Link>
      </div>
    );
  }

  return (
    <main className="details">
      <div className="details__media">
        <img className="details__img" src={product.image} alt={product.title} />
      </div>

      <div className="details__info">
        <Link to="/" className="details__back">← Back to shop</Link>
        <p className="details__category">{product.category}</p>
        <h1 className="details__title">{product.title}</h1>
         <p className="details__price">
          ${product.price.toFixed(2)}
          {product.oldPrice > product.price && (
            <span style={{ marginLeft: 10, fontSize: '1rem', fontWeight: 400, textDecoration: 'line-through', color: '#6f6580' }}>
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
        </p>
        {product.size && <p className="details__size">Size: {product.size}</p>}
        <p className="details__desc">{product.description}</p>
        <button className="btn btn--primary" onClick={() => addToCart(product)}>
          Add to Cart
        </button>
      </div>
    </main>
  );
}
