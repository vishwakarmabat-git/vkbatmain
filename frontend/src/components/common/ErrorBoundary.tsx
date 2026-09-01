import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React ErrorBoundary error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090B] text-[#F4F4F5] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#121216] border border-[#24242D] rounded-lg p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-black text-white uppercase tracking-tight">
                SOMETHING WENT WRONG
              </h2>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                An unexpected interface error occurred. Our team has been notified. Please refresh or return to the storefront.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full bg-[#D4AF37] hover:bg-[#E5BE4A] text-black font-sport font-black py-3 px-4 rounded-xs text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RELOAD PAGE</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full bg-[#181821] hover:bg-[#24242D] border border-[#24242D] text-white font-sport font-bold py-3 px-4 rounded-xs text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>GO HOME</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
