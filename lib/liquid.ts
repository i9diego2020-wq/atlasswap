import { Buffer } from './buffer-singleton';
import * as liquid from 'liquidjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { SLIP77Factory } from 'slip77';
import { supabase } from './supabase';

// Configurações extraídas do Descriptor
const MASTER_BLINDING_KEY = 'd8dd37b1265d625c70c5a70edc6dbbb906f2765ddf4dc29a4fc396e92659ca19';
const XPUB = 'xpub6BemYiVNp19a2ekdx6fqBGJ4zhKZv7oZTejaNsgG9156N816oWWr4sJ5Xk4fgd9q5t8dYHth2PukWxaPsVP57CAfgDbhaG1rGmuesxEsKeV';

let cryptoTools: { bip32: any, slip77: any } | null = null;

/**
 * Inicializa as ferramentas criptográficas.
 */
const initTools = () => {
    if (cryptoTools) return cryptoTools;
    try {
        if (!Buffer) {
            throw new Error("Polyfill de Buffer não encontrado. Verifique a configuração do Vite.");
        }

        if (!ecc || typeof ecc.pointAdd !== 'function') {
            console.error("[Liquid] tiny-secp256k1 falhou ao carregar ou não é compatível.");
            throw new Error("Módulo Secp256k1 não carregado corretamente.");
        }

        const bip32 = BIP32Factory(ecc);
        const slip77 = SLIP77Factory(ecc);
        cryptoTools = { bip32, slip77 };
        return cryptoTools;
    } catch (err) {
        console.error("[Liquid] Erro crítico ao instanciar fábricas criptográficas:", err);
        throw err;
    }
};

/**
 * Busca o próximo índice disponível e o incrementa no Supabase.
 */
export const getNextLiquidIndex = async () => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'liquid_last_index')
            .single();

        let currentIndex = 1;
        if (error) {
            if (error.code === 'PGRST116') {
                await supabase.from('settings').insert([{ key: 'liquid_last_index', value: '1' }]);
            } else {
                console.error("[Liquid] Erro ao buscar índice:", error);
            }
        } else if (data) {
            currentIndex = parseInt(data.value) + 1;
        }

        await supabase.from('settings').update({ value: currentIndex.toString() }).eq('key', 'liquid_last_index');
        return currentIndex;
    } catch (err) {
        console.error("[Liquid] Falha na gestão de índice:", err);
        return Math.floor(Math.random() * 1000) + 100;
    }
};

/**
 * Deriva um endereço Liquid Confidencial.
 */
export const deriveLiquidAddress = (index: number) => {
    try {
        const { bip32, slip77 } = initTools();
        const network = liquid.networks.liquid;
        if (!Buffer) throw new Error("Buffer indisponível na derivação.");

        // 1. Derivar chave pública
        const node = bip32.fromBase58(XPUB, network);
        const child = node.derive(0).derive(index);
        const publicKey = child.publicKey;

        // 2. Criar script e chaves de blindagem
        // IMPORTANT: Usar o mesmo Buffer constructor para tudo para evitar erro "got Uint8Array"
        const p2wpkh = liquid.payments.p2wpkh({ pubkey: (Buffer as any).from(publicKey), network });
        const slip77Node = slip77.fromMasterBlindingKey((Buffer as any).from(MASTER_BLINDING_KEY, 'hex'));
        const blindingKeys = slip77Node.derive((Buffer as any).from(p2wpkh.output!));

        // 3. Gerar endereço confidencial
        const payment = liquid.payments.p2wpkh({
            pubkey: (Buffer as any).from(publicKey),
            blindkey: (Buffer as any).from(blindingKeys.publicKey),
            network
        });

        return {
            address: payment.confidentialAddress!,
            unconfidentialAddress: payment.address!,
            blindingPrivateKey: (Buffer as any).from(blindingKeys.privateKey!).toString('hex')
        };
    } catch (err: any) {
        console.error("[Liquid] Erro na derivação:", err);
        throw err;
    }
};

/**
 * Monitora um endereço via API Esplora
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
            value: utxo.value,
            asset: utxo.asset,
            confirmations: txData.status?.confirmed ? 1 : 0
        };
    } catch (err) {
        console.error('[Liquid] Erro no monitoramento:', err);
        return { error: 'Offline' };
    }
};
