import { Component, ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#141414",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            fontFamily: "system-ui, sans-serif",
            color: "#fff",
            padding: 32,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 48 }}>🎬</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>
            Please refresh the page to continue watching.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              background: "#E50914",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "10px 28px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
