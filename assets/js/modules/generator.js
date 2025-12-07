/**
 * Generator Logic
 */

const CHAR_SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

export function generatePassword(length, options) {
    let chars = '';
    if (options.upper) chars += CHAR_SETS.upper;
    if (options.lower) chars += CHAR_SETS.lower;
    if (options.numbers) chars += CHAR_SETS.numbers;
    if (options.symbols) chars += CHAR_SETS.symbols;

    if (chars === '') return ''; // No options selected

    let password = '';

    // Try using crypto for strong security
    try {
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const array = new Uint32Array(length);
            crypto.getRandomValues(array);
            for (let i = 0; i < length; i++) {
                password += chars[array[i] % chars.length];
            }
            return password;
        }
    } catch (e) {
        console.warn("Crypto API failed, falling back to Math.random", e);
    }

    // Fallback for non-secure contexts (e.g. file://)
    for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password;
}

export function generateBatch(count, length, options) {
    const passwords = [];
    for (let i = 0; i < count; i++) {
        passwords.push(generatePassword(length, options));
    }
    return passwords;
}
