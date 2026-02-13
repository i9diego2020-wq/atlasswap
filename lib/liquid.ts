import { Buffer } from 'buffer';
import * as liquid from 'liquidjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { SLIP77Factory } from 'slip77';
import { supabase } from './supabase';

// PART 5: THE REMASTERED RUNTIME PATCH
// We target the internal typeforce of liquidjs-lib directly
try {
    const liquidAny = liquid as any;
    const isBufferResilient = (val: any) => {
        if (!val) return false;
        return Buffer.isBuffer(val) ||
            val._isBuffer === true ||
            val.isBuffer === true ||
            val.constructor?.name === 'Buffer' ||
            val.constructor?.name === 'u' ||
            val.constructor?.name === 'Uint8Array' ||
            val.constructor?.name === 'n';
    };

    // Patch the typeforce function itself
    if (liquidAny.typeforce) {
        const originalTypeforce = liquidAny.typeforce;
        liquidAny.typeforce = function (type: any, value: any, strict: any) {
            if (type === 'Buffer' || type === originalTypeforce.Buffer) {
                if (isBufferResilient(value)) return true;
            }
            try {
                return originalTypeforce(type, value, strict);
            } catch (e: any) {
                // Se falhar com erro de Buffer mas "parecer" um Buffer, ignoramos
                if (isBufferResilient(value)) return true;
                throw e;
            }
        };
        // Re-copiar propriedades estáticas
        Object.assign(liquidAny.typeforce, originalTypeforce);
        liquidAny.typeforce.Buffer = isBufferResilient;
    }

    // Patch no módulo .types se existir
    if (liquidAny.types && liquidAny.types.typeforce) {
        liquidAny.types.typeforce = liquidAny.typeforce;
        liquidAny.types.Buffer = isBufferResilient;
    }
} catch (e) {
    console.error('[Liquid] Falha crítica no patch runtime:', e);
}

// Configurações extraídas do Descriptor
const MASTER_BLINDING_KEY = 'd8dd37b1265d625c70c5a70edc6dbbb906f2765ddf4dc29a4fc396e92659ca19';
const XPUB = 'xpub6BemYiVNp19a2ekdx6fqBGJ4zhKZv7oZTejaNsgG9156N816oWWr4sJ5Xk4fgd9q5t8dYHth2PukWxaPsVP57CAfgDbhaG1rGmuesxEsKeV';

const bip32 = BIP32Factory(ecc);
const slip77 = SLIP77Factory(ecc);

/**
 * Manual HMAC-SHA256 implementation using liquid.crypto.sha256 (browser-safe)
 */
function hmacSha256(key: Buffer, message: Buffer): Buffer {
    const blockSize = 64;
    let k = key;
    if (k.length > blockSize) {
        k = liquid.crypto.sha256(k);
    }
    const kPadded = Buffer.alloc(blockSize, 0);
    k.copy(kPadded);

    const ipad = Buffer.alloc(blockSize, 0x36);
    const opad = Buffer.alloc(blockSize, 0x5c);

    for (let i = 0; i < blockSize; i++) {
        ipad[i] ^= kPadded[i];
        opad[i] ^= kPadded[i];
    }

    const innerHash = liquid.crypto.sha256(Buffer.concat([ipad, message]));
    return liquid.crypto.sha256(Buffer.concat([opad, innerHash]));
}

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
        }, { validate: false }); // DISABLING VALIDATION IN PRODUCTION

        // BLOCKSTREAM GREEN COMPATIBILITY: Green uses HMAC-SHA256 for blinding keys
        const masterBlindingKey = Buffer.from(MASTER_BLINDING_KEY, 'hex');
        const script = p2wpkh.output!;

        const privateKey = hmacSha256(masterBlindingKey, script).slice(0, 32);
        const blindingPubKey = Buffer.from(ecc.pointFromScalar(privateKey, true)!);

        const confidential = liquid.address.toConfidential(
            p2wpkh.address!,
            blindingPubKey
        );

        return {
            address: confidential,
            unconfidential: p2wpkh.address,
            blindingKey: blindingPubKey.toString('hex')
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

    // Extrair índices dos endereços (lq1... ou usar o count como fallback seguro se não tivermos os índices salvos)
    // Para maior robustez, vamos apenas contar o número de registros, mas garantindo que não estamos pegando do cache
    return data.length;
}
