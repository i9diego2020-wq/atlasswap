
/**
 * Configuração e Funções para interação com Thirdweb Engine (Custodial Payouts)
 */

const ENGINE_URL = (import.meta as any).env.VITE_THIRDWEB_ENGINE_URL || process.env.THIRDWEB_ENGINE_URL;
const ACCESS_TOKEN = (import.meta as any).env.VITE_THIRDWEB_ENGINE_ACCESS_TOKEN || process.env.THIRDWEB_ENGINE_ACCESS_TOKEN;
const BACKEND_WALLET = (import.meta as any).env.VITE_THIRDWEB_BACKEND_WALLET_ADDRESS || process.env.THIRDWEB_BACKEND_WALLET_ADDRESS;
const USDT_ADDRESS = (import.meta as any).env.VITE_POLYGON_USDT_ADDRESS || '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
const CHAIN_ID = '137'; // Polygon Mainnet

/**
 * Envia USDT via Thirdweb Engine
 */
export const sendUSDT = async (toAddress: string, amount: number) => {
    if (!ENGINE_URL || !ACCESS_TOKEN || !BACKEND_WALLET) {
        throw new Error("Configurações da Thirdweb Engine incompletas no arquivo .env");
    }

    // Converter amount para base 10^6 (USDT na Polygon tem 6 decimais)
    const amountInUnits = (amount * 1000000).toFixed(0);

    const url = `${ENGINE_URL}/backend-wallet/${CHAIN_ID}/erc20/transfer`;
    console.log(`[Thirdweb] Enviando consulta para: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'x-backend-wallet-address': BACKEND_WALLET
            },
            body: JSON.stringify({
                toAddress: toAddress,
                amount: amountInUnits,
                tokenAddress: USDT_ADDRESS
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[Thirdweb] Erro na Engine:", data);
            throw new Error(data.error?.message || "Erro ao processar envio de USDT via Engine");
        }

        return {
            success: true,
            queueId: data.result?.queueId, // Engine usa fila de transações
            txHash: data.result?.transactionHash // Pode ser null se ainda estiver na fila
        };
    } catch (error) {
        console.error("[Thirdweb] Falha crítica no envio:", error);
        throw error;
    }
};

/**
 * Consulta o status de uma transação na Engine
 */
export const getTransactionStatus = async (queueId: string) => {
    const url = `${ENGINE_URL}/transaction/status/${queueId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error("[Thirdweb] Erro ao consultar status:", error);
        return null;
    }
};
