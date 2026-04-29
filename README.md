# celeste-rl-web

Results writeup site for [**celeste-rl**](https://github.com/jmtorr3/celeste-rl) — a deep reinforcement learning project training agents to play Celeste Classic on the Pyleste emulator (Virginia Tech CS 4824 ML final project).

> 🔗 **Live:** [jmtorr3.github.io/celeste-rl-web](https://jmtorr3.github.io/celeste-rl-web/)

The site is a single-page PICO-8-styled writeup that pulls comparison charts, training curves, and gameplay GIFs directly from the `celeste-rl` repo's `docs/` folder, so the writeup always reflects the latest experiment outputs.

## What's on the page

- Methodology — agents trained (DQN, BC, hybrid), reward shaping, and evaluation protocol
- Training curves for the strongest runs (`dqn_r1`, `v3_r9`)
- Comparison plots — completion rate, outcome breakdown, height distribution
- Side-by-side gameplay GIFs of the trained agents

## Stack

React 19 · TypeScript · Vite · deployed via `gh-pages`.

## Running locally

```bash
npm install
npm run dev
```

## Deploying

```bash
npm run deploy   # builds and pushes dist/ to gh-pages branch
```

## Related

- **[celeste-rl](https://github.com/jmtorr3/celeste-rl)** — the training pipeline, agents, and evaluation code (this site is the public-facing report for that repo).
