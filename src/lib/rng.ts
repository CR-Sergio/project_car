/** small seeded PRNG (mulberry32-style) so cut-paper letters and graffiti look the same on every visit */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5) | 0), ((s ^ (s >>> 14)) >>> 0) / 4294967296);
}
