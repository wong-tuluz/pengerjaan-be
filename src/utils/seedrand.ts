import seedrandom from 'seedrandom';

export function shuffle<T>(items: readonly T[], seed: string): T[] {
    // Create a fresh RNG instance per call
    const rng = seedrandom(seed, { entropy: false });

    const array = items.slice();

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}
