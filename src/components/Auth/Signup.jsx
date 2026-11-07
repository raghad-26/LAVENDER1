import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import brand from '../../images/brand.jpg';
import SocialButtons from './SocialButtons';
import { customerRegister, getErrorMessage } from '../../services/api';
import './Auth.css';

/**
 * Signup
 * onSubmit الافتراضي = POST /v1/customer/register
 * (علامة lavender_isRegistered تُحفظ داخل customerRegister عند النجاح)
 * @param {function} onSubmit - called with the form values
 * @param {string} loginHref - route to the Login page
 */
export default function Signup({ onSubmit = customerRegister, loginHref = '/login' }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!values.firstName.trim()) next.firstName = 'Required';
    if (!values.lastName.trim()) next.lastName = 'Required';
    if (!values.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email';
    if (!values.phone.trim()) next.phone = 'Required';
    if (!values.password || values.password.length < 6) next.password = 'At least 6 characters';
    if (!agreed) next.agreed = 'You must agree to continue';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setIsSubmitting(true);
      await onSubmit(values);
      navigate('/login');
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
        <h1 className="auth-title">Sign up</h1>
        <p className="auth-subtitle">Let&apos;s get you all set up so you can access your personal account.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-row">
            <div className="form-field">
              <label htmlFor="signup-first">First Name</label>
              <input
                id="signup-first"
                placeholder="John"
                value={values.firstName}
                className={errors.firstName ? 'has-error' : ''}
                onChange={update('firstName')}
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="signup-last">Last Name</label>
              <input
                id="signup-last"
                placeholder="Doe"
                value={values.lastName}
                className={errors.lastName ? 'has-error' : ''}
                onChange={update('lastName')}
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="auth-row">
            <div className="form-field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="john.doe@gmail.com"
                value={values.email}
                className={errors.email ? 'has-error' : ''}
                onChange={update('email')}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="signup-phone">Phone Number</label>
              <input
                id="signup-phone"
                type="tel"
                placeholder="+1 202-310-2122"
                value={values.phone}
                className={errors.phone ? 'has-error' : ''}
                onChange={update('phone')}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="signup-password">Password</label>
            <div className="password-wrapper">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={values.password}
                className={errors.password ? 'has-error' : ''}
                onChange={update('password')}
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
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I agree to the <a href="#terms" className="auth-link">Terms</a> and{' '}
                <a href="#privacy" className="auth-link">Privacy Policies</a>
              </span>
            </label>
          </div>
          {errors.agreed && <span className="field-error">{errors.agreed}</span>}
          {errors.form && <span className="field-error">{errors.form}</span>}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to={loginHref} className="auth-link">Login</Link>
          </p>
        </form>

        <SocialButtons label="Or Sign up with" />
      </div>
    </div>
  );
}
