import React from 'react';
import { AlertCircle, RotateCcw, Home, Copy, Check } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleCopy = () => {
    const errorDetails = [
      `URL: ${window.location.href}`,
      `Time: ${new Date().toISOString()}`,
      `Error: ${this.state.error?.name || 'Error'}: ${this.state.error?.message || String(this.state.error)}`,
      `Stack:\n${this.state.error?.stack || 'N/A'}`,
      `Component Stack:\n${this.state.errorInfo?.componentStack || 'N/A'}`
    ].join('\n\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(errorDetails).then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2500);
      }).catch(() => {});
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 bg-[#F6F8FB] dark:bg-[#080E18] text-slate-800 dark:text-slate-100">
          <div className="w-full max-w-xl bg-white dark:bg-[#0F1B2B] rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-xl p-6 sm:p-8 space-y-5 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Something went wrong
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  An unexpected error occurred while rendering this view. You can reload or copy error details for support.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Error Details
              </span>
              <p className="font-mono text-xs text-rose-600 dark:text-rose-300 break-words font-semibold">
                {this.state.error?.message || String(this.state.error) || 'Unknown error'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="min-h-[42px] px-4 py-2 bg-[#0E7C86] hover:bg-[#0c6b74] text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition active:scale-98 shadow-sm cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleCopy}
                className="min-h-[42px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition active:scale-98 cursor-pointer"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied details</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy error details</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="min-h-[42px] px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium text-xs rounded-xl flex items-center gap-1.5 transition active:scale-98 cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
