import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const hasOffer = product.oldPrice > product.price;
  const percent = hasOffer ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__link">
        <div className="product-card__media">
          {hasOffer && <span className="product-card__badge">-{percent}%</span>}
          <img className="product-card__img" src={product.image} alt={product.title} loading="lazy" />
        </div>
        <p className="product-card__category">{product.category}</p>
        <h3 className="product-card__title">{product.title}</h3>
        <p className="product-card__price">
          ${product.price.toFixed(2)}
          {hasOffer && <span className="product-card__old">${product.oldPrice.toFixed(2)}</span>}
        </p>
      </Link>
      <button className="btn btn--primary product-card__btn" onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}