
import * as liquid from 'liquidjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { SLIP77Factory } from 'slip77';
import { supabase } from './supabase';

// Garantir que usamos a inst├óncia UNIFICADA de Buffer definida no index.tsx
const GlobalBuffer = (window as any).Buffer;

// Configura├º├Áes extra├¡das do Descriptor
const MASTER_BLINDING_KEY = 'd8dd37b1265d625c70c5a70edc6dbbb906f2765ddf4dc29a4fc396e92659ca19';
const XPUB = 'xpub6BemYiVNp19a2ekdx6fqBGJ4zhKZv7oZTejaNsgG9156N816oWWr4sJ5Xk4fgd9q5t8dYHth2PukWxaPsVP57CAfgDbhaG1rGmuesxEsKeV';

let cryptoTools: { bip32: any, slip77: any } | null = null;

/**
 * Inicializa as ferramentas criptogr├íficas.
 */
const initTools = () => {
    if (cryptoTools) return cryptoTools;
    try {
        const CurrentBuffer = (window as any).Buffer || GlobalBuffer;
        if (!CurrentBuffer) {
            console.error("[Liquid] Buffer n├úo dispon├¡vel globalmente.");
            throw new Error("Polyfill de Buffer n├úo encontrado. Verifique a inicializa├º├úo do aplicativo.");
        }

        if (!ecc || typeof ecc.pointAdd !== 'function') {
            console.error("[Liquid] tiny-secp256k1 falhou ao carregar ou n├úo ├® compat├¡vel.");
            throw new Error("M├│dulo Secp256k1 n├úo carregado corretamente.");
        }

        const bip32 = BIP32Factory(ecc);
        const slip77 = SLIP77Factory(ecc);
        cryptoTools = { bip32, slip77 };
        return cryptoTools;
    } catch (err) {
        console.error("[Liquid] Erro cr├¡tico ao instanciar f├íbricas criptogr├íficas:", err);
        throw err;
    }
};

/**
 * Busca o pr├│ximo ├¡ndice dispon├¡vel e o incrementa no Supabase.
 */
export const getNextLiquidIndex = async () => {
    try {
        // Busca o ├¡ndice atual
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'liquid_last_index')
            .single();

        let currentIndex = 1;

        if (error) {
            if (error.code === 'PGRST116') {
                // Chave n├úo existe, vamos criar com 1
                await supabase.from('settings').insert([{ key: 'liquid_last_index', value: '1' }]);
            } else {
                console.error("[Liquid] Erro ao buscar ├¡ndice:", error);
            }
        } else if (data) {
            currentIndex = parseInt(data.value) + 1;
        }

        // Atualiza para o pr├│ximo
        await supabase
            .from('settings')
            .update({ value: currentIndex.toString() })
            .eq('key', 'liquid_last_index');

        return currentIndex;
    } catch (err) {
        console.error("[Liquid] Falha na gest├úo de ├¡ndice:", err);
        return Math.floor(Math.random() * 1000) + 100; // Fallback seguro
    }
};

/**
 * Deriva um endere├ºo Liquid Confidencial.
 */
export const deriveLiquidAddress = (index: number) => {
    try {
        const { bip32, slip77 } = initTools();
        const network = liquid.networks.liquid;

        // 1. Derivar chave p├║blica
        const node = bip32.fromBase58(XPUB, network);
        const child = node.derive(0).derive(index);
        const publicKey = child.publicKey;

        // 2. Criar script e chaves de blindagem
        const p2wpkh = liquid.payments.p2wpkh({ pubkey: GlobalBuffer.from(publicKey), network });
        const slip77Node = slip77.fromMasterBlindingKey(GlobalBuffer.from(MASTER_BLINDING_KEY, 'hex'));
        const blindingKeys = slip77Node.derive(GlobalBuffer.from(p2wpkh.output!));

        // 3. Gerar endere├ºo confidencial
        const payment = liquid.payments.p2wpkh({
            pubkey: GlobalBuffer.from(publicKey),
            blindkey: GlobalBuffer.from(blindingKeys.publicKey),
            network
        });

        return {
            address: payment.confidentialAddress!,
            unconfidentialAddress: payment.address!,
            blindingPrivateKey: GlobalBuffer.from(blindingKeys.privateKey!).toString('hex')
        };
    } catch (err: any) {
        console.error("[Liquid] Erro na deriva├º├úo:", err);
        throw err;
    }
};

/**
 * Monitora um endere├ºo via API Esplora
 */
export const monitorAddress = async (address: string) => {
    try {
        const response = await fetch(`https://blockstream.info/liquid/api/address/${address}/utxo`);
        const utxos = await response.json();

        if (!Array.isArray(utxos) || utxos.length === 0) {
            return { received: false };
        }

        const utxo = utxos[0];
        const txResponse = await fetch(`https://blockstream.info/liquid/api/tx/${utxo.txid}`);
        const txData = await txResponse.json();

        return {
            received: true,
            txid: utxo.txid,
            vout: utxo.vout,
            value: utxo.value, // SATOSHIS
            asset: utxo.asset,
            confirmations: txData.status?.confirmed ? 1 : 0
        };
    } catch (err) {
        console.error('[Liquid] Erro no monitoramento:', err);
        return { error: 'Offline' };
    }
};
