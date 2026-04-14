// These are the 2018 values; Results might be skewed in 2026 due to changes in demographics and the related boundary redraw in BUDAPEST (1) and PEST (14)
var MEGYE_LAKOSOK = {
  1: 1328726,
  2: 309694,
  3: 424057,
  4: 291425,
  5: 539907,
  6: 335810,
  7: 344872,
  8: 360048,
  9: 435284,
  10: 245305,
  11: 309838,
  12: 248455,
  13: 160796,
  14: 1008073,
  15: 255831,
  16: 459677,
  17: 186034,
  18: 207573,
  19: 288071,
  20: 228583
}

var MEGYE_MAX = MEGYE_LAKOSOK[1];

var MEGYE_LAKOSOK_FIX = {}

for (var l in MEGYE_LAKOSOK) {
  MEGYE_LAKOSOK_FIX[l] = MEGYE_MAX / MEGYE_LAKOSOK[l];
}
