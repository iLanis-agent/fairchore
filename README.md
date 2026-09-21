# FairChore

The chore split nobody can argue with. Housemates rate each chore 1-5 by how much they
hate it; the engine assigns every chore so that (a) everyone's pile is within one chore
of everyone else's and (b) total household misery is as low as it can get. It also shows
how much misery it saved versus just taking turns, and copies the split as text for the
group chat.

- No signup, nothing to install - pure static HTML/JS, setup persists in `localStorage`
- `engine.js` is the assignment optimizer (greedy seed + pairwise swap descent, seeded
  against a round-robin baseline so it never does worse than taking turns), shared
  between the app and node tests

## Use it

Open `index.html`, or visit the deployed site.

## Run locally

Any static server works:

```
python3 -m http.server
```

Then open http://localhost:8000/.

## Engine tests

The node suite checks known-optimal tiny cases, validity + exact balance across 100
random households, the never-worse-than-round-robin guarantee, determinism, and the
misery/fairness helpers.
