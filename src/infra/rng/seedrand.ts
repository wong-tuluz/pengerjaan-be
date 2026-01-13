import seedrandom from 'seedrandom';

export function shuffle<T>(items: readonly T[], seed: string): T[] {
    // const rng = deterministicRandom(seed)
    // console.log(rng)

    // return items.slice();

    // Create a fresh RNG instance per call
    const rng = seedrandom(seed, { entropy: false });

    const array = items.slice();

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

// function hashUint32(seed: string): number {
//     let h = 2166136261;
//     for (let i = 0; i < seed.length; i++) {
//         h ^= seed.charCodeAt(i);
//         h = Math.imul(h, 16777619);
//     }
//     return h >>> 0;
// }

// function deterministicRandom(seed: string): number {
//      return hashUint32(seed) / 2 ** 32;
// }

// export function shuffle<T>(items: readonly T[], seed: string) {
//     const array = items.slice()
//     var m = array.length, t, i;

//     // While there remain elements to shuffle…
//     while (m) {

//         // Pick a remaining element…
//         i = Math.floor(random(seed) * m--);        // <-- MODIFIED LINE

//         // And swap it with the current element.
//         t = array[m];
//         array[m] = array[i];
//         array[i] = t;
//         ++seed                                     // <-- ADDED LINE
//     }

//     return array;
// }

// function random(seed) {
//     var x = Math.sin(seed++) * 10000;
//     return x - Math.floor(x);
// }