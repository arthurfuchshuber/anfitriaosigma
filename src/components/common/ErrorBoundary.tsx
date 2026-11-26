import { Component, type ErrorInfo, type ReactNode } from "react";

interface State { error: Error | null }

/** Rede de segurança global: uma exceção de render mostra uma tela legível (base branca, roxo da marca) em vez de tela preta. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", padding: 24, fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1a1020" }}>
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif", fontSize: 22, fontWeight: 600, margin: "0 0 8px" }}>Algo deu errado nesta tela</h1>
          <p style={{ fontSize: 14, color: "#695f67", margin: "0 0 20px" }}>Não foi possível exibir esta página. Recarregue ou volte ao início; se persistir, avise o time.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => window.location.reload()} style={{ height: 44, padding: "0 20px", borderRadius: 14, border: 0, background: "#431171", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Recarregar</button>
            <a href="/intranet" style={{ height: 44, padding: "0 20px", borderRadius: 14, border: "1px solid #d2c5e3", color: "#431171", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Ir ao início</a>
          </div>
        </div>
      </div>
    );
  }
}
