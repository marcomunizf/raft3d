import { Button } from '@/components/ui/button';

const WHATSAPP_LINK = 'https://wa.me/5511999999999';
const MAPS_LINK = 'https://www.google.com/maps/dir/?api=1&destination=-23.5505,-46.6333';

export default function Landing({ onLoginClick }) {
  return (
    <div className="landing">
      <nav className="top-nav">
        <div className="brand">
          <span className="brand-title">RAFT 3D</span>
          <span className="brand-subtitle">Impressao 3D profissional</span>
        </div>
        <div className="nav-links">
          <a href="#quem-somos">Sobre a RAFT</a>
          <a href="#servicos">Nossos Servicos</a>
          <a href="#orcamentos">Orcamentos</a>
          <a href="#localizacao">Contato</a>
        </div>
        <Button variant="ghost" size="icon" className="gear-button" type="button" onClick={onLoginClick} aria-label="Login">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm9 3.2-.82-.27a7.3 7.3 0 0 0-.55-1.34l.4-.77a1 1 0 0 0-.2-1.17l-1.51-1.51a1 1 0 0 0-1.17-.2l-.77.4a7.3 7.3 0 0 0-1.34-.55L14.8 3a1 1 0 0 0-.95-.7h-2.7a1 1 0 0 0-.95.7l-.27.82a7.3 7.3 0 0 0-1.34.55l-.77-.4a1 1 0 0 0-1.17.2L5.14 5.68a1 1 0 0 0-.2 1.17l.4.77c-.22.43-.41.87-.55 1.34L4 12a1 1 0 0 0 .7.95v2.7a1 1 0 0 0 .7.95l.82.27c.14.47.33.91.55 1.34l-.4.77a1 1 0 0 0 .2 1.17l1.51 1.51a1 1 0 0 0 1.17.2l.77-.4c.43.22.87.41 1.34.55l.27.82a1 1 0 0 0 .95.7h2.7a1 1 0 0 0 .95-.7l.27-.82c.47-.14.91-.33 1.34-.55l.77.4a1 1 0 0 0 1.17-.2l1.51-1.51a1 1 0 0 0 .2-1.17l-.4-.77c.22-.43.41-.87.55-1.34L21 14.8a1 1 0 0 0 .7-.95v-2.7a1 1 0 0 0-.7-.95Z" />
          </svg>
        </Button>
      </nav>

      <main className="landing-main">

        {/* Hero — green background */}
        <section className="hero" id="inicio">
          <div className="hero-content">
            <p className="hero-eyebrow">Impressao 3D de alta precisao</p>
            <h1>transforme suas<br />ideias em realidade</h1>
            <p>
              Desenvolvemos projetos personalizados e produzimos pecas com
              precisao em resina e FDM. Da miniatura ao prototipo funcional,
              entregamos qualidade e prazo.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">Solicitar orcamento</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#servicos">Nossos servicos</a>
              </Button>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel-card">
              <h3>Impressao em Resina</h3>
              <p>Alta resolucao para miniaturas, joias e pecas com detalhes finos.</p>
            </div>
            <div className="hero-panel-card">
              <h3>Impressao FDM</h3>
              <p>Pecas funcionais e resistentes em PLA, PETG e ABS para uso real.</p>
            </div>
          </div>
        </section>

        {/* Quem somos — white */}
        <section className="section section--white" id="quem-somos">
          <div className="section-inner">
            <h2>Sobre a RAFT</h2>
            <p>
              A RAFT 3D e um estudio especializado em impressao 3D, com foco em
              qualidade, prazo e atendimento transparente. Atendemos designers,
              makers, joalherias, empresas e clientes individuais em todo o Brasil.
            </p>
            <ul className="feature-list">
              <li>Desenvolvimento de projetos do zero ao arquivo final.</li>
              <li>Producao de pecas em resina e FDM com alta precisao.</li>
              <li>Atendimento direto e personalizado via WhatsApp.</li>
              <li>Controle total do pedido, do orcamento a entrega.</li>
            </ul>
          </div>
        </section>

        {/* Servicos — magenta */}
        <section className="section section--magenta" id="servicos">
          <div className="section-inner">
            <h2>Nossos Servicos</h2>
            <div className="service-grid">
              <article>
                <h3>Desenvolvimento de Projetos</h3>
                <p>Desenvolvimento de projetos personalizados, a partir da ideia inicial ate a modelagem 3D, com base nas necessidades do cliente.</p>
              </article>
              <article>
                <h3>Producao de Pecas</h3>
                <p>Impressao de pecas em pequena escala, com base em projetos fornecidos pelo cliente ou desenvolvidos em conjunto, garantindo precisao e funcionalidade.</p>
              </article>
              <article>
                <h3>Curso de Impressao 3D</h3>
                <p>Curso com montagem de impressora, explicacao sobre o processo de impressao, configuracao de parametros e tipos de materiais utilizados.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Orcamentos — magenta claro / destaque */}
        <section className="section section--white" id="orcamentos">
          <div className="section-inner">
            <div className="orcamento-card" style={{ background: 'var(--raft-magenta)', border: '1px solid var(--raft-magenta-dark)' }}>
              <h2>Como solicitar orcamento</h2>
              <p>
                Envie seu arquivo STL pelo WhatsApp com as especificacoes: material,
                cor, quantidade e prazo. Respondemos em ate 24 horas uteis com o
                valor e previsao de entrega.
              </p>
              <Button asChild>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Localizacao */}
        <section className="section section--gray" id="localizacao">
          <div className="section-inner">
            <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: '28px', marginBottom: '24px' }}>Contato e Localizacao</h2>
            <div className="map-grid">
              <div className="map-box">
                <div className="map-placeholder">Mapa em breve</div>
              </div>
              <div className="map-info">
                <p>
                  Atendemos presencialmente e por envio via Correios e transportadoras.
                  Retirada no estudio disponivel mediante agendamento.
                </p>
                <Button variant="outline" asChild>
                  <a href={MAPS_LINK} target="_blank" rel="noreferrer">Como chegar</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} RAFT 3D &mdash; Todos os direitos reservados.</p>
      </footer>

      <a className="floating-whatsapp" href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
         style={{ background: 'var(--raft-green)' }}>
        WhatsApp
      </a>
    </div>
  );
}
