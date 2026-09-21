/* FairChore engine - chore assignment optimizer, pure functions.
   Solves the real problem: everyone hates different chores, so the fair split
   is not equal counts - it's equal counts AND minimum total misery. */
(function (global) {
  'use strict';

  /*
   * assign(mates, chores, dislike) -> { byMate: [[choreIdx...]...], total: number }
   * mates: array of mate names (M), chores: array of chore names (C)
   * dislike[m][c]: 1..5 (5 = hates it most)
   * Guarantees: every chore assigned once; per-mate counts differ by at most 1;
   * total misery minimized via greedy seed + pairwise swap descent (deterministic).
   */
  function assign(mates, chores, dislike) {
    var M = mates.length, C = chores.length;
    var base = Math.max(1, Math.floor(C / M));

    // Order chores by preference spread (most contested first), ties by index.
    var order = [];
    for (var c = 0; c < C; c++) {
      var mn = 6, mx = 0;
      for (var m = 0; m < M; m++) {
        if (dislike[m][c] < mn) mn = dislike[m][c];
        if (dislike[m][c] > mx) mx = dislike[m][c];
      }
      order.push({ c: c, spread: mx - mn, mn: mn });
    }
    order.sort(function (a, b) {
      if (b.spread !== a.spread) return b.spread - a.spread;
      if (a.mn !== b.mn) return a.mn - b.mn;
      return a.c - b.c;
    });

    // Greedy seed, two phases for exact balance: phase 1 fills every mate to the
    // base quota (cap=base, total slots M*base, so every mate ends exactly at base);
    // phase 2 places the C%M leftover chores with cap=base+1.
    var byMate = [];
    var counts = [];
    var baseSlots = M * base;
    for (var i = 0; i < M; i++) { byMate.push([]); counts.push(0); }
    for (var k = 0; k < order.length; k++) {
      var ci = order[k].c;
      var capNow = k < baseSlots ? base : base + 1;
      var bestM = -1, bestKey = null;
      for (var mm = 0; mm < M; mm++) {
        if (counts[mm] >= capNow) continue;
        var key = dislike[mm][ci] * 1000 + counts[mm] * 100 + mm;
        if (bestKey === null || key < bestKey) { bestKey = key; bestM = mm; }
      }
      byMate[bestM].push(ci);
      counts[bestM]++;
    }

    // Round-robin baseline seed (always balanced); keep whichever seed is cheaper.
    var rr = [];
    for (var r = 0; r < M; r++) rr.push([]);
    for (var c2 = 0; c2 < C; c2++) rr[c2 % M].push(c2);
    function totalOf(assign) {
      var t = 0;
      for (var m = 0; m < M; m++) {
        for (var j = 0; j < assign[m].length; j++) t += dislike[m][assign[m][j]];
      }
      return t;
    }
    if (totalOf(rr) < totalOf(byMate)) byMate = rr;

    function total(assign) {
      var t = 0;
      for (var m = 0; m < M; m++) {
        for (var j = 0; j < assign[m].length; j++) t += dislike[m][assign[m][j]];
      }
      return t;
    }

    // Pairwise swap descent: swap chore a (mate A) with chore b (mate B) if it lowers misery.
    var cur = total(byMate);
    var improved = true;
    var guard = 0;
    while (improved && guard < 200) {
      improved = false;
      guard++;
      for (var a = 0; a < M && !improved; a++) {
        for (var b = a + 1; b < M && !improved; b++) {
          for (var ia = 0; ia < byMate[a].length && !improved; ia++) {
            for (var ib = 0; ib < byMate[b].length && !improved; ib++) {
              var ca = byMate[a][ia], cb = byMate[b][ib];
              var delta = (dislike[a][cb] + dislike[b][ca]) - (dislike[a][ca] + dislike[b][cb]);
              if (delta < 0) {
                byMate[a][ia] = cb;
                byMate[b][ib] = ca;
                cur += delta;
                improved = true;
              }
            }
          }
        }
      }
    }

    return { byMate: byMate, total: cur };
  }

  /* Per-mate misery for display. */
  function mateTotals(byMate, dislike) {
    return byMate.map(function (list, m) {
      var t = 0;
      for (var i = 0; i < list.length; i++) t += dislike[m][list[i]];
      return t;
    });
  }

  /* Fairness spread: max per-mate misery minus min (lower = fairer). */
  function fairnessSpread(totals) {
    var mn = Math.min.apply(null, totals), mx = Math.max.apply(null, totals);
    return mx - mn;
  }

  var api = { assign: assign, mateTotals: mateTotals, fairnessSpread: fairnessSpread };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.FairChore = api;
})(typeof window !== 'undefined' ? window : globalThis);
