import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
          <div className="grid gap-2">
            <Label htmlFor="usuario">Usuario</Label>
            <Input
              id="usuario"
              type="text"
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              placeholder="admin"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="admin"
              disabled={isSubmitting}
            />
          </div>
          {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
            <Button variant="ghost" type="button" onClick={onBack}>
              Voltar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
