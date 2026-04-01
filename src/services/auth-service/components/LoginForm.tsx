import React, { useState, type FormEvent } from 'react';
import { HiArrowRight } from 'react-icons/hi2';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import '../css/login-form.css';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { useAuth } from '../../../shared/hooks/useAuth';

interface JwtPayload {
  role: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [honeypot, setHoneypot] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Honeypot check - if filled, it's a bot
    if (honeypot !== '') {
      console.warn('Bot detected - honeypot filled');
      setErrors({ email: 'Invalid form submission' });
      return;
    }

    if (!validateForm()) return;

    const result = await login(formData);
    if (result) {
      try {
        const token = localStorage.getItem('accessToken');
        const decoded = token ? jwtDecode<JwtPayload>(token) : null;
        navigate('/');
      } catch {
        navigate('/');
      }
    } else {
      setErrors({ email: 'Email ou mot de passe incorrect' });
    }
  };

  const handleChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Connexion</h1>
          <p className="login-subtitle">
            Connectez-vous à votre compte pour continuer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Honeypot field - hidden from users, visible to bots */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
          />

          <Input
            type="text"
            label="Email"
            placeholder="vous@exemple.com"
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            disabled={loading}
            fullWidth
            required
          />

          <Input
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            disabled={loading}
            fullWidth
            required
          />

          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#" className="login-forgot">
              Mot de passe oublié ?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            icon={HiArrowRight}
            iconPosition="right"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
