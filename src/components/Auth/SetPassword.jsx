import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import brand from '../../images/brand.jpg';
import back from '../../images/back.png';
import setPasswordImg from '../../images/forgot-password.jpg';
import { customerResetPassword, getErrorMessage } from '../../services/api';
import './Auth.css';
import './ForgotPassword.css';
import './VerifyCode.css';
import './SetPassword.css';

const MIN_LENGTH = 8;

/**
 * SetPassword
 * onSetPassword الافتراضي = POST /v1/customer/reset-password
 * (البريد والكود يصلان عبر navigate state من صفحة Verify Code)
 * @param {function} onSetPassword - called with { email, code, password }
 */
export default function SetPassword({
  onSetPassword = customerResetPassword,
  loginHref = '/login',
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const code = location.state?.code || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!password) {
      next.password = 'Password is required';
    } else if (password.length < MIN_LENGTH) {
      next.password = `Password must be at least ${MIN_LENGTH} characters`;
    }
    if (!confirm) {
      next.confirm = 'Please re-enter your password';
    } else if (password !== confirm) {
      next.confirm = 'Passwords do not match';
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setIsSubmitting(true);
      await onSetPassword({ email, code, password });
      navigate(loginHref); // بعد تعيين كلمة المرور ارجع لصفحة تسجيل الدخول
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
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

          <h1 className="auth-title">Set a password</h1>
          <p className="auth-subtitle">
            Your previous password has been reset. Please set a new password
            for your account.
          </p>

          <form className="auth-form sp-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="sp-password">Create Password</label>
              <div className="password-wrapper">
                <input
                  id="sp-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  autoComplete="new-password"
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
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="sp-confirm">Re-enter Password</label>
              <div className="password-wrapper">
                <input
                  id="sp-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirm}
                  autoComplete="new-password"
                  className={errors.confirm ? 'has-error' : ''}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
              {errors.confirm && (
                <span className="field-error">{errors.confirm}</span>
              )}
            </div>

            {errors.form && <span className="field-error">{errors.form}</span>}

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Set password'}
            </button>
          </form>
        </div>

        {/* ===== Right: illustration ===== */}
        <div className="fp-illustration sp-illustration">
          <img src={setPasswordImg} alt="Set password illustration" />
        </div>
      </div>
    </div>
  );
}
