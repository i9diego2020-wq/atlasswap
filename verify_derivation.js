
import { Buffer } from 'buffer';
import * as liquid from 'liquidjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { SLIP77Factory } from 'slip77';

const XPUB = 'xpub6BemYiVNp19a2ekdx6fqBGJ4zhKZv7oZTejaNsgG9156N816oWWr4sJ5Xk4fgd9q5t8dYHth2PukWxaPsVP57CAfgDbhaG1rGmuesxEsKeV';
const MASTER_BLINDING_KEY = 'd8dd37b1265d625c70c5a70edc6dbbb906f2765ddf4dc29a4fc396e92659ca19';

const bip32 = BIP32Factory(ecc);
const slip77 = SLIP77Factory(ecc);

const node = bip32.fromBase58(XPUB);
const child = node.derive(0).derive(11);
const pubkey = Buffer.from(child.publicKey);

const p2wpkh = liquid.payments.p2wpkh({
    pubkey,
    network: liquid.networks.liquid
});

const blindingKey = slip77.fromSeed(Buffer.from(MASTER_BLINDING_KEY, 'hex')).derive(p2wpkh.output);
console.log('UNCONF:', p2wpkh.address);
console.log('BLINDING_KEY:', blindingKey.publicKey.toString('hex'));
