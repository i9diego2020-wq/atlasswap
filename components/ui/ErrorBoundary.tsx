import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<any, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] mt-4">
                    <h2 className="text-xl font-black text-rose-600 mb-2">Ops! Algo deu errado.</h2>
                    <p className="text-rose-500 text-sm mb-4">
                        Pode haver um problema de compatibilidade com as bibliotecas criptográficas (Liquid/Wasm) no seu navegador.
                    </p>
                    <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-auto max-h-40 mb-4">
                        {this.state.error?.toString()}
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl font-mono text-[10px] text-gray-400 overflow-auto max-h-60">
                        <p className="mb-2 text-gray-500 font-bold uppercase tracking-wider">// Stack Trace:</p>
                        <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
                    >
                        Recarregar Aplicativo
                    </button>
                </div>
            );
        }

        return (this as any).props.children;
    }
}

export default ErrorBoundary;
