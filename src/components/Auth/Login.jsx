import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import brand from '../../images/brand.jpg';
import SocialButtons from './SocialButtons';
import { customerLogin, getErrorMessage } from '../../services/api';
import './Auth.css';

/**
 * Login
 * onSubmit الافتراضي = POST /v1/customer/login
 * @param {function} onSubmit - called with { email, password, remember }
 * @param {string} signupHref - route to the Sign up page
 */
export default function Login({ onSubmit = customerLogin, signupHref = '/signup' }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setIsSubmitting(true);
      await onSubmit({ email, password, remember });
      navigate('/');
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <Link to="/" className="auth-logo-link">
          <img className="auth-logo-img" src={brand} alt="Lavender Global" />
        </Link>
      </div>

      <div className="auth-content">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Login to access your Lavender account</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="john.doe@gmail.com"
              value={email}
              autoComplete="email"
              className={errors.email ? 'has-error' : ''}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <div className="password-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                autoComplete="current-password"
                className={errors.password ? 'has-error' : ''}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="auth-checkbox-row">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot Password</Link>
          </div>

          {errors.form && <span className="field-error">{errors.form}</span>}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Login'}
          </button>

          <p className="auth-footer-text">
            Don&apos;t have an account?{' '}
            <Link to={signupHref} className="auth-link">Sign up</Link>
          </p>
        </form>

        <SocialButtons label="Or login with" />
      </div>
    </div>
  );
}
