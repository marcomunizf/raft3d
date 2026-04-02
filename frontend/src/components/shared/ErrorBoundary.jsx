import { Component } from 'react';

/**
 * React Error Boundary — captura erros em subcomponentes e exibe fallback.
 *
 * Uso:
 *   <ErrorBoundary>
 *     <MeuComponente />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<p>Erro customizado</p>}>
 *     <MeuComponente />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-inner">
            <h3>Algo deu errado</h3>
            <p className="muted">
              {this.state.error?.message || 'Um erro inesperado ocorreu nesta seção.'}
            </p>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => this.handleReset()}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
