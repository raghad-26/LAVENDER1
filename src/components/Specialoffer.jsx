import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Specialoffer({
  label = 'Special Offer',
  title = 'Up to 30% Off',
  subtitle = "On selected fragrances. Don't miss out!",
  ctaLabel = 'Shop Now',
  discount = '30%',
}) {
  const navigate = useNavigate();

  const goToOffers = () => {
    navigate('/?offers=1');
  };

  return (
    <section className="offer" id="offers">
      <div className="offer__content">
        <p className="offer__label">{label}</p>
        <h2 className="offer__title">{title}</h2>
        <p className="offer__subtitle">{subtitle}</p>
        <button className="btn btn--primary" onClick={goToOffers}>{ctaLabel} →</button>
      </div>

      <div className="offer__badge">
        <span>{discount}</span>
        OFF
      </div>
    </section>
  );
}