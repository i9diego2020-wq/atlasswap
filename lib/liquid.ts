import { Buffer } from 'buffer';
import * as liquid from 'liquidjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { SLIP77Factory } from 'slip77';
import { supabase } from './supabase';

// Patching liquid's internal typeforce to use our global Buffer check
// this is the ultimate fix for "Expected Buffer, got u"
try {
    const liquidTypes: any = (liquid as any).types || (liquid as any).typeforce;
    if (liquidTypes && liquidTypes.Buffer) {
        liquidTypes.Buffer = (window as any).Buffer?.isBuffer || Buffer.isBuffer;
    }
} catch (e) {
    console.warn('Could not patch liquid types directly', e);
}

// Configurações extraídas do Descriptor
const MASTER_BLINDING_KEY = 'd8dd37b1265d625c70c5a70edc6dbbb906f2765ddf4dc29a4fc396e92659ca19';
const XPUB = 'xpub6BemYiVNp19a2ekdx6fqBGJ4zhKZv7oZTejaNsgG9156N816oWWr4sJ5Xk4fgd9q5t8dYHth2PukWxaPsVP57CAfgDbhaG1rGmuesxEsKeV';

const bip32 = BIP32Factory(ecc);
const slip77 = SLIP77Factory(ecc);

/**
 * Deriva um endereço Liquid a partir de um índice
 */
export function deriveLiquidAddress(index: number) {
    try {
        const node = bip32.fromBase58(XPUB);
        const child = node.derive(0).derive(index);
        const pubkey = Buffer.from(child.publicKey);

        const p2wpkh = liquid.payments.p2wpkh({
            pubkey,
            network: liquid.networks.liquid
        });

        const blindingKey = slip77.fromSeed(Buffer.from(MASTER_BLINDING_KEY, 'hex')).derive(p2wpkh.output!);

        const confidential = liquid.address.toConfidential(
            p2wpkh.address!,
            blindingKey.publicKey!
        );

        return {
            address: confidential,
            unconfidential: p2wpkh.address,
            blindingKey: blindingKey.publicKey!.toString('hex')
        };
    } catch (error: any) {
        console.error('Error deriving address:', error);
        // Adicionamos um log mais detalhado para ajudar a debugar o typeforce no console do navegador
        if (error.message?.includes('Expected Buffer')) {
            console.error('DETAILED TYPEFORCE ERROR:', error);
        }
        throw error;
    }
}

/**
 * Monitora um endereço em busca de depósitos
 */
export async function monitorAddress(address: string) {
    try {
        const response = await fetch(`https://blockstream.info/liquid/api/address/${address}/txs`);
        const txs = await response.json();

        if (txs && txs.length > 0) {
            // Verifica se houve algum output para o endereço com confirmação ou não
            const lastTx = txs[0];
            return { received: true, txid: lastTx.txid };
        }
        return { received: false };
    } catch (error) {
        console.error('Error monitoring address:', error);
        return { received: false };
    }
}

/**
 * Obtém o próximo índice disponível para derivação
 */
export async function getNextLiquidIndex() {
    const { data, error } = await supabase
        .from('transactions')
        .select('deposit_address')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching transactions loop:', error);
        return 0;
    }

    // Se não houver transações, começa do 0
    if (!data || data.length === 0) return 0;

    return data.length;
}
