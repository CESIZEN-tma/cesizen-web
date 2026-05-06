import React, { type FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import { Input } from '../shared/components/Input';
import { Button } from '../shared/components/Button';
import { showError } from '../shared/configs/toastConfig';
import { apiClient } from '../shared/configs/axiosConfig';
import '../services/auth-service/css/login-form.css';

const ConfirmAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = token.trim();
    if (!trimmed) {
      showError('Veuillez saisir le token de confirmation.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.put(`/admin/confirm-account/${encodeURIComponent(trimmed)}`);
      navigate('/login');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Token invalide ou expiré.';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Confirmation du compte</h1>
          <p className="login-subtitle">
            Saisissez le token reçu par e-mail pour activer votre compte administrateur.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            type="text"
            label="Token de confirmation"
            placeholder="Collez votre token ici"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={loading}
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            icon={MdCheckCircle}
            iconPosition="right"
          >
            {loading ? 'Confirmation...' : 'Confirmer mon compte'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmAccount;
