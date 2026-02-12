
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ENGINE_URL = Deno.env.get("THIRDWEB_ENGINE_URL")
const ACCESS_TOKEN = Deno.env.get("THIRDWEB_ENGINE_ACCESS_TOKEN")
const BACKEND_WALLET = Deno.env.get("THIRDWEB_BACKEND_WALLET_ADDRESS")
const USDT_ADDRESS = Deno.env.get("POLYGON_USDT_ADDRESS") || "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
const CHAIN_ID = "137"

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
    try {
        const { record } = await req.json()

        // 1. Validar se a transação está pronta para payout
        if (record.status !== 'confirmed_depix') {
            return new Response(JSON.stringify({ message: "Status não compatível para payout" }), { status: 200 })
        }

        console.log(`[Payout] Iniciando envio para order: ${record.id}`)

        // 2. Atualizar para USDT_SENDING
        await supabase
            .from('transactions')
            .update({ status: 'usdt_sending' })
            .eq('id', record.id)

        // 3. Chamar Thirdweb Engine
        const amountInUnits = (record.amount_usdt * 1000000).toFixed(0)
        const engineUrl = `${ENGINE_URL}/backend-wallet/${CHAIN_ID}/extend-erc20/transfer`

        const response = await fetch(engineUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'x-backend-wallet-address': BACKEND_WALLET
            },
            body: JSON.stringify({
                toAddress: record.wallet_address,
                amount: amountInUnits,
                tokenAddress: USDT_ADDRESS
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error("[Payout] Erro Thirdweb Engine:", data)
            await supabase
                .from('transactions')
                .update({ status: 'failed', error_log: data.error?.message })
                .eq('id', record.id)
            throw new Error("Falha no envio via Thirdweb")
        }

        // 4. Sucesso no disparo
        await supabase
            .from('transactions')
            .update({
                status: 'usdt_sent',
                usdt_tx_hash: data.result?.transactionHash || data.result?.queueId
            })
            .eq('id', record.id)

        return new Response(JSON.stringify({ success: true, data }), { status: 200 })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
