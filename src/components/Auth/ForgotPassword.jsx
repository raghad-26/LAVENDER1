import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import brand from '../../images/brand.jpg';
import forgotImg from '../../images/forgot-password.jpg';
import back from '../../images/back.png';
import SocialButtons from './SocialButtons';
import { customerForgotPassword, getErrorMessage } from '../../services/api';
import './Auth.css';
import './ForgotPassword.css';

/**
 * ForgotPassword
 * onSubmit الافتراضي = POST /v1/customer/forgot-password
 * @param {function} onSubmit - called with { email }
 * @param {string} loginHref - route to the Login page
 */
export default function ForgotPassword({ onSubmit = customerForgotPassword, loginHref = '/login' }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    setError(msg);
    if (msg) return;

    try {
      setIsSubmitting(true);
      await onSubmit({ email });
      navigate('/verify-code', { state: { email } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page fp-page">
      <div className="auth-topbar fp-topbar">
        <Link to="/" className="auth-logo-link">
          <img className="auth-logo-img" src={brand} alt="Lavender Global" />
        </Link>
      </div>

      <div className="fp-layout">
        {/* ===== Left: form ===== */}
        <div className="fp-content">
          <Link to={loginHref} className="fp-back">
            <img src={back} alt="" />
            Back to login
          </Link>

          <h1 className="auth-title">Forgot your password?</h1>
          <p className="auth-subtitle">
            Don&apos;t worry, happens to all of us. Enter your email below to recover your password
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="fp-email">Email</label>
              <input
                id="fp-email"
                type="email"
                placeholder="john.doe@gmail.com"
                value={email}
                autoComplete="email"
                className={error ? 'has-error' : ''}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <span className="field-error">{error}</span>}
            </div>

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Submit'}
            </button>
          </form>

          <SocialButtons label="Or login with" />
        </div>

        {/* ===== Right: illustration ===== */}
        <div className="fp-illustration">
          <img src={forgotImg} alt="Forgot password illustration" />
        </div>
      </div>
    </div>
  );
}
