import typeforceOriginal from 'typeforce';
import { Buffer } from 'buffer';

/**
 * Patch para a biblioteca typeforce que é usada internamente pela liquidjs-lib.
 * Em produção (Vercel), a minificação altera o nome do construtor da Buffer para 'u',
 * causando falha na validação "Expected Buffer, got u".
 */

// Resiliência de tipos nativos
const isBufferResilient = (value: any) => {
    return Buffer.isBuffer(value) ||
        (value && (
            value._isBuffer === true ||
            value.constructor?.name === 'Buffer' ||
            value.constructor?.name === 'u' ||
            value.constructor?.name === 'Uint8Array' ||
            value.constructor?.name === 'n'
        ));
};

const isStringResilient = (value: any) => {
    return typeof value === 'string' || value instanceof String;
};

// Criamos uma versão "proxied" do typeforce
const typeforcePatched: any = (type: any, value: any, strict?: boolean) => {
    // Se a validação for do tipo 'Buffer', usamos nossa lógica resiliente
    if (type === 'Buffer' || type === typeforceOriginal.Buffer) {
        if (isBufferResilient(value)) return true;
    }

    // Se for String, garantimos que passa
    if (type === 'String' || type === typeforceOriginal.String) {
        if (isStringResilient(value)) return true;
    }

    try {
        return typeforceOriginal(type, value, strict);
    } catch (e: any) {
        // Se falhar com a mensagem clássica de Buffer, mas for um Buffer resiliente, ignoramos o erro
        if (e.message && e.message.includes('Expected Buffer') && isBufferResilient(value)) {
            return true;
        }
        throw e;
    }
};

// Clonamos as propriedades estáticas (como typeforce.maybe, typeforce.Buffer, etc)
Object.keys(typeforceOriginal).forEach(key => {
    if (key === 'Buffer') {
        typeforcePatched.Buffer = isBufferResilient;
    } else if (key === 'String') {
        typeforcePatched.String = isStringResilient;
    } else {
        typeforcePatched[key] = (typeforceOriginal as any)[key];
    }
});

// Adicionamos polyfills para as funções que usam nomes minificados internamente
typeforcePatched.compile = (type: any) => {
    const compiled = (typeforceOriginal as any).compile(type);
    if (type === 'Buffer') return isBufferResilient;
    if (type === 'String') return isStringResilient;
    return compiled;
};

export default typeforcePatched;
