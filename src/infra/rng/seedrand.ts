import seedrandom from 'seedrandom';

export function shuffle<T>(items: T[], seed: string): T[] {
    const rng = seedrandom(seed);
    const array = [...items];

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}
