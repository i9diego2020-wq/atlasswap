
import { Buffer } from 'buffer';

if (typeof (window as any).Buffer === 'undefined') {
    (window as any).Buffer = Buffer;
}

export { };
