
import { Buffer } from 'buffer';
import * as crypto from 'crypto';
import * as ecc from 'tiny-secp256k1';

const MASTER_BLINDING_KEY = 'd8dd37b1265d625c70c5a70edc6dbbb906f2765ddf4dc29a4fc396e92659ca19';
const SCRIPT = '00143b159d40101220d4423a2a2ccd3a3759491a29a4';

const master = Buffer.from(MASTER_BLINDING_KEY, 'hex');
const script = Buffer.from(SCRIPT, 'hex');

// Standard SLIP-77: HMAC-SHA512(master, script)
const hmac = crypto.createHmac('sha512', master);
hmac.update(script);
const result = hmac.digest();
const privateKey = result.slice(0, 32);

const publicKey = Buffer.from(ecc.pointFromScalar(privateKey, true));
console.log('SLIP77 Standard Blinding Key:', publicKey.toString('hex'));

// Alternative: HMAC-SHA256?
const hmac256 = crypto.createHmac('sha256', master);
hmac256.update(script);
const result256 = hmac256.digest();
const privateKey256 = result256.slice(0, 32);
const publicKey256 = Buffer.from(ecc.pointFromScalar(privateKey256, true));
console.log('SLIP77 SHA256 Blinding Key:', publicKey256.toString('hex'));

// Alternative: Just using the master key as the blinding key? (Sometimes for test/wrong setups)
const publicKeyMaster = Buffer.from(ecc.pointFromScalar(master, true));
console.log('Master Key as Blinding Key:', publicKeyMaster.toString('hex'));

// Alternative: Deriving from path?
// No easy way to check without knowing more.

const expected = '0330112ff3c2800aa6626daec4c74786a6412345c984775da1b9fdf848aab774ee';
console.log('Expected:', expected);
