import { useState } from 'react';

export default function Login({ onSubmit, onBack, errorMessage, isSubmitting }) {
  const [form, setForm] = useState({ usuario: '', senha: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="login">
      <div className="login-card">
        <h1>Painel administrativo</h1>
        <p>Entre com o usuario e senha do MVP.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Usuario
            <input
              type="text"
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              placeholder="admin"
              disabled={isSubmitting}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="admin"
              disabled={isSubmitting}
            />
          </label>
          {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={onBack}>
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
