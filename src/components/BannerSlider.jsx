import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BannerSlider.css';

const AUTO_MS = 5000;

// إعلان Luxury فقط يأخذ التصميم الخاص (صورة كاملة + بطاقة نص)
const isSpecial = (b) =>
  /category=luxury/i.test(b.link || '') || /luxury/i.test(b.title || '');

export default function BannerSlider({ banners = [] }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const count = banners.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, count]);

  if (count === 0) return null;
  const banner = banners[index % count];
  const special = isSpecial(banner);
  const titleLines = (banner.title || '').split('\n');

  const go = (b) => {
    if (b.category) navigate(`/?category=${encodeURIComponent(b.category)}`);
    else if (/^https?:/.test(b.link)) window.location.href = b.link;
    else if (b.link) navigate(b.link);
    else document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const arrow = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );

  return (
    <div className={`banner ${special ? 'banner--special' : ''}`}>
      {special ? (
        /* ===== التصميم الخاص: Luxury ===== */
        <div className="banner__slide" key={banner.id ?? index}>
          {banner.image && (
            <>
              <div className="banner__bg" style={{ backgroundImage: `url("${banner.image}")` }} />
              <img className="banner__img" src={banner.image} alt={banner.title} />
            </>
          )}
          <div className="banner__card">
            <h1 className="banner__title">{banner.title}</h1>
            {banner.subtitle && <p className="banner__subtitle">{banner.subtitle}</p>}
            <button className="btn btn--primary" onClick={() => go(banner)}>
              {banner.ctaLabel}
              {arrow}
            </button>
          </div>
        </div>
      ) : (
        /* ===== الشكل القديم: باقي الإعلانات (نفس تصميم الـ Hero) ===== */
        <section
          className="hero"
          style={banner.image ? { backgroundImage: `url("${banner.image}")` } : undefined}
        >
          <div className="hero__text">
            <h1 className="hero__title">
              {titleLines.map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < titleLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h1>
            {banner.subtitle && <p className="hero__subtitle">{banner.subtitle}</p>}
            <button className="btn btn--primary" onClick={() => go(banner)}>
              {banner.ctaLabel}
              {arrow}
            </button>
          </div>
        </section>
      )}

      {count > 1 && (
        <>
          <button className="banner__arrow banner__arrow--prev" aria-label="Previous banner"
            onClick={() => setIndex((index - 1 + count) % count)}>‹</button>
          <button className="banner__arrow banner__arrow--next" aria-label="Next banner"
            onClick={() => setIndex((index + 1) % count)}>›</button>
          <div className="banner__dots">
            {banners.map((b, i) => (
              <button key={b.id ?? i} aria-label={`Banner ${i + 1}`}
                className={`banner__dot ${i === index ? 'is-active' : ''}`}
                onClick={() => setIndex(i)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}