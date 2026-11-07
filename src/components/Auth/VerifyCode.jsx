import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import brand from '../../images/brand.jpg';
import back from '../../images/back.png';
import verifyImg from '../../images/verify-code.jpg';
import { customerForgotPassword, getErrorMessage } from '../../services/api';
import './Auth.css';
import './ForgotPassword.css'; // نعيد استخدام تخطيط الصفحة (fp-*)
import './VerifyCode.css';

const RESEND_SECONDS = 30;

/**
 * VerifyCode
 * الـ API ما فيه Endpoint مستقل للتحقق من الكود؛ التحقق الفعلي يحصل عند
 * reset-password في الصفحة التالية. لذلك onVerify الافتراضي لا يفعل شيئاً
 * وننتقل مباشرة لصفحة Set password مع الكود.
 * الإعادة (Resend) = إعادة استدعاء forgot-password.
 *
 * @param {function} onVerify - called with { email, code }
 * @param {function} onResend - called with { email }
 */
export default function VerifyCode({
  onVerify = async () => {},
  onResend = customerForgotPassword,
  loginHref = '/login',
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  // عدّاد لإعادة الإرسال
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    try {
      setError('');
      await onResend({ email });
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Code is required');
      return;
    }
    setError('');

    try {
      setIsSubmitting(true);
      await onVerify({ email, code: code.trim() });
      navigate('/set-password', { state: { email, code: code.trim() } });
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

          <h1 className="auth-title">Verify code</h1>
          <p className="auth-subtitle">
            An authentication code has been sent to your email.
          </p>

          <form className="auth-form vc-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="vc-code">Enter Code</label>
              <div className="password-wrapper">
                <input
                  id="vc-code"
                  type={showCode ? 'text' : 'password'}
                  placeholder="Enter the code"
                  value={code}
                  autoComplete="one-time-code"
                  className={error ? 'has-error' : ''}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCode((v) => !v)}
                  aria-label={showCode ? 'Hide code' : 'Show code'}
                >
                  {showCode ? '🙈' : '👁'}
                </button>
              </div>
              {error && <span className="field-error">{error}</span>}
            </div>

            <p className="vc-resend">
              Didn&apos;t receive a code?{' '}
              <button
                type="button"
                className="vc-resend-btn"
                onClick={handleResend}
                disabled={secondsLeft > 0}
              >
                {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend'}
              </button>
            </p>

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying…' : 'Verify'}
            </button>
          </form>
        </div>

        {/* ===== Right: illustration ===== */}
        <div className="fp-illustration vc-illustration">
          <img src={verifyImg} alt="Verification illustration" />
        </div>
      </div>
    </div>
  );
}
