import React, { useEffect, useState, useCallback } from 'react';
import Hero from '../components/Hero';
import BannerSlider from '../components/BannerSlider';
import Categories from '../components/Categories';
import ProductsSection from '../components/ProductsSection';
import SpecialOffer from '../components/Specialoffer';
import Features from '../components/Features';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { fetchCategories, fetchBanners, getErrorMessage } from '../services/api';
import './Landingpage.css';

const FEATURE_ITEMS = [
  { icon: 'shipping', title: 'Free Shipping', description: 'Orders over $39' },
  { icon: 'payment', title: 'Secure Payment', description: '100% secure checkout' },
  { icon: 'returns', title: 'Easy Return', description: '7-day return policy' },
  { icon: 'support', title: 'Customer Support', description: "We're here to help" },
];

export default function LandingPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [banners, setBanners] = useState([]);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchCategories()
      .then((data) => !cancelled && setCategories(data))
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));

    // الإعلانات اختيارية: لو فشلت أو كانت فارغة نرجع للـ Hero الثابت
    fetchBanners()
      .then((data) => !cancelled && setBanners(data))
      .catch(() => !cancelled && setBanners([]));

    return () => { cancelled = true; };
  }, [attempt]);

  return (
    <>
      {banners.length > 0 ? <BannerSlider banners={banners} /> : <Hero />}

      {loading && <Loader text="Loading categories..." />}
      {error && <ErrorMessage message={error} onRetry={retry} />}
      {!loading && !error && <Categories items={categories} />}

      <ProductsSection categories={categories} />
      <SpecialOffer />
      <Features items={FEATURE_ITEMS} />
    </>
  );
}
