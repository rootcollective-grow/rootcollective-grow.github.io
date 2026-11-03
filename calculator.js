/* Savings calculator (savings.html).
   The visitor types what they're growing and picks a way to grow it.
   We fill in rough estimates from the table below; every number can be changed. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$("yearly")) return;

  // One-time setup cost for one setup, by way of growing (rough examples).
  var SETUP = { jar: 5, soil: 10, bucket: 35, tray: 8 };
  var METHOD_NAME = { jar: "a water jar", soil: "a pot of soil", bucket: "a bubble bucket", tray: "a microgreens tray" };

  // Fallback guesses when we don't know the plant, or the plant and method combination.
  var GENERAL = { jar: { w: 5, y: 1, s: 0.5 }, soil: { w: 5, y: 1, s: 0.5 }, bucket: { w: 4, y: 1, s: 0.7 }, tray: { w: 1.5, y: 3, s: 2.5 } };

  // w = weeks per harvest, y = harvest in store-sized units, s = supplies per harvest.
  var EST = "Assumes the plant is already growing well. The first harvest takes a few weeks longer.";
  var CROPS = {
    lettuce: { name: "lettuce", u: "head", note: "Counted in whole heads.", price: 3, buy: 4,
      m: { jar: { w: 6, y: 1, s: 0.75 }, soil: { w: 8, y: 1, s: 0.6 }, bucket: { w: 6, y: 1, s: 0.9 } } },
    spinach: { name: "spinach", u: "bag", note: "Counted in store bags of about 140 g (5 oz).", price: 4, buy: 2,
      m: { jar: { w: 6, y: 0.5, s: 0.6 }, soil: { w: 7, y: 0.5, s: 0.5 }, bucket: { w: 5, y: 0.75, s: 0.8 } } },
    kale: { name: "kale", u: "bunch", note: "Counted in store bunches. " + EST, price: 3, buy: 2,
      m: { soil: { w: 3, y: 1, s: 0.4 }, bucket: { w: 2.5, y: 1, s: 0.6 }, jar: { w: 4, y: 0.5, s: 0.5 } } },
    bokchoy: { name: "bok choy", u: "head", note: "Counted in whole heads of baby bok choy.", price: 2.5, buy: 4,
      m: { jar: { w: 6, y: 1, s: 0.7 }, soil: { w: 7, y: 1, s: 0.5 }, bucket: { w: 5, y: 1, s: 0.8 } } },
    basil: { name: "basil", u: "pack", note: "Counted in store packs of about 20 g (¾ oz). " + EST, price: 3, buy: 2,
      m: { soil: { w: 2, y: 1, s: 0.3 }, jar: { w: 2, y: 1, s: 0.4 }, bucket: { w: 1.5, y: 1.5, s: 0.5 } } },
    mint: { name: "mint", u: "pack", note: "Counted in store packs of about 20 g (¾ oz). " + EST, price: 3, buy: 1,
      m: { soil: { w: 2, y: 1, s: 0.3 }, jar: { w: 2, y: 1, s: 0.4 }, bucket: { w: 1.5, y: 1.5, s: 0.5 } } },
    parsley: { name: "parsley", u: "bunch", note: "Counted in store bunches. " + EST, price: 2, buy: 2,
      m: { soil: { w: 3, y: 1, s: 0.3 }, jar: { w: 3, y: 1, s: 0.4 }, bucket: { w: 2, y: 1, s: 0.5 } } },
    cilantro: { name: "cilantro", u: "bunch", note: "Counted in store bunches. Cilantro goes to seed quickly, so sow a little every few weeks.", price: 2, buy: 2,
      m: { soil: { w: 5, y: 1, s: 0.3 }, jar: { w: 5, y: 1, s: 0.4 }, bucket: { w: 4, y: 1, s: 0.5 } } },
    greenonions: { name: "green onions", u: "bunch", note: "Counted in store bunches. Green onions regrow after cutting.", price: 1.5, buy: 3,
      m: { soil: { w: 3, y: 1, s: 0.2 }, jar: { w: 2, y: 1, s: 0.1 }, bucket: { w: 3, y: 2, s: 0.4 } } },
    chives: { name: "chives", u: "pack", note: "Counted in store packs of about 20 g (¾ oz). " + EST, price: 3, buy: 1,
      m: { soil: { w: 3, y: 1, s: 0.2 }, jar: { w: 3, y: 1, s: 0.3 }, bucket: { w: 2, y: 1.5, s: 0.4 } } },
    microgreens: { name: "microgreens", u: "container", note: "Counted in store containers of about 60 g (2 oz).", price: 4, buy: 4,
      m: { tray: { w: 1.5, y: 3, s: 2.5 } } },
    tomatoes: { name: "cherry tomatoes", u: "container", note: "Counted in store containers of about 300 g (10 oz). Assumes the plant is already fruiting, which takes about 2 to 3 months.", price: 5, buy: 2,
      m: { bucket: { w: 1, y: 1, s: 0.6 }, soil: { w: 1.5, y: 1, s: 0.5 } } },
    peppers: { name: "peppers", u: "pepper", note: "Counted in single peppers. Assumes the plant is already fruiting, which takes about 3 months.", price: 1.5, buy: 4,
      m: { bucket: { w: 1, y: 1, s: 0.4 }, soil: { w: 1.5, y: 1, s: 0.4 } } },
    strawberries: { name: "strawberries", u: "container", note: "Counted in store containers of about 450 g (1 lb). Indoor plants give small harvests, so this is a modest one.", price: 5, buy: 1,
      m: { soil: { w: 4, y: 0.5, s: 0.5 }, bucket: { w: 3, y: 0.5, s: 0.6 } } }
  };
  var ALIASES = [
    ["microgreen", "microgreens"], ["sprout", "microgreens"], ["pea shoot", "microgreens"], ["shoots", "microgreens"],
    ["lettuce", "lettuce"], ["romaine", "lettuce"], ["butterhead", "lettuce"], ["salad", "lettuce"], ["arugula", "lettuce"],
    ["spinach", "spinach"], ["kale", "kale"], ["chard", "kale"], ["bok", "bokchoy"], ["pak choi", "bokchoy"],
    ["basil", "basil"], ["mint", "mint"], ["parsley", "parsley"], ["cilantro", "cilantro"], ["coriander", "cilantro"],
    ["green onion", "greenonions"], ["scallion", "greenonions"], ["spring onion", "greenonions"], ["chive", "chives"],
    ["tomato", "tomatoes"], ["pepper", "peppers"], ["chil", "peppers"], ["strawberr", "strawberries"]
  ];
  function findCrop(text) {
    var t = (text || "").toLowerCase().trim();
    if (!t) return "";
    for (var i = 0; i < ALIASES.length; i++) if (t.indexOf(ALIASES[i][0]) !== -1) return ALIASES[i][1];
    return "other";
  }

  var cropKey = null, method = "jar";

  function num(id) { return Math.max(0, parseFloat($(id).value) || 0); }
  function money(v) {
    var c = $("cur").value || "";
    var a = Math.abs(v);
    var n = a < 100 ? a.toFixed(2) : Math.round(a).toLocaleString();
    return (v < 0 ? "−" : "") + c + n;
  }
  function setMethod(m) {
    method = m;
    document.querySelectorAll("[data-m]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.m === m ? "true" : "false"); });
  }
  function methodsText(c) {
    var list = Object.keys(c.m).map(function (k) { return METHOD_NAME[k]; });
    return list.length > 1 ? list.slice(0, -1).join(", ") + " or " + list[list.length - 1] : list[0];
  }

  // Fill in the estimate fields. newCrop = true also resets the store price and amount.
  function applyEstimates(newCrop) {
    var c = CROPS[cropKey], e, note;
    var typed = $("crop").value.trim();
    if (!cropKey) {
      e = GENERAL[method];
      note = "Type what you're growing above to get estimates.";
    } else if (!c) {
      e = GENERAL[method];
      note = "We don't have estimates for “" + typed + "” yet, so these are general guesses for " + METHOD_NAME[method] + ". Change them if you know better.";
    } else if (c.m[method]) {
      e = c.m[method];
      note = "Rough estimates for " + c.name + " in " + METHOD_NAME[method] + ".";
    } else {
      e = GENERAL[method];
      note = "We don't have estimates for " + c.name + " in " + METHOD_NAME[method] + ", so these are general guesses. People usually grow " + c.name + " in " + methodsText(c) + ".";
    }
    $("matchNote").textContent = note;
    document.querySelectorAll(".calc-section .u").forEach(function (el) { el.textContent = c ? c.u : "item"; });
    $("unitNote").textContent = c ? c.note : "Counted in whatever size you usually buy.";
    if (newCrop) {
      $("price").value = c ? c.price : 3;
      $("buy").value = c ? c.buy : 4;
    }
    $("yield").value = e.y;
    $("weeks").value = e.w;
    $("supplies").value = e.s;
    $("setup").value = SETUP[method];
    calc();
  }

  function onCrop() {
    var k = findCrop($("crop").value);
    if (k === cropKey && k !== "other") return;
    var changed = k !== cropKey;
    cropKey = k;
    var c = CROPS[k];
    if (c && !c.m[method]) setMethod(Object.keys(c.m)[0]);
    applyEstimates(changed);
  }

  function calc() {
    var price = num("price"), buy = num("buy"), y = Math.max(0.1, num("yield")), w = Math.max(0.5, num("weeks"));
    var sup = num("supplies"), setup = num("setup"), light = $("useLight").checked;
    $("lightFields").hidden = !light;
    var perSetupMonth = y * (4.345 / w);
    var setups = buy > 0 ? Math.ceil(buy / perSetupMonth) : 0;
    var kwh = light ? num("watts") * Math.min(24, num("hours")) * 30.4 / 1000 : 0;
    var energy = kwh * num("kwh");
    var store = price * buy, grow = (buy / y) * sup + energy, save = store - grow;
    var start = setups * setup + (light ? num("lightCost") : 0);
    $("yearly").textContent = money(save * 12);
    $("yearlyNote").textContent = save >= 0 ? "a year, after supplies" + (light ? " and electricity" : "") : "a year more than buying it. Try changing the numbers.";
    var mx = Math.max(store, grow, 0.01);
    $("bStore").style.width = (store / mx * 100) + "%";
    $("bGrow").style.width = (grow / mx * 100) + "%";
    $("tStore").textContent = money(store);
    $("tGrow").textContent = money(grow);
    $("setups").textContent = setups;
    $("setupsLabel").textContent = (setups === 1 ? "setup" : "setups") + " to keep you supplied";
    $("payback").textContent = save > 0 ? (start / save < 1 ? "Under 1 month" : Math.ceil(start / save) + " months") : "Not yet";
    $("energy").textContent = light ? money(energy) + " (" + kwh.toFixed(1) + " kWh)" : "None";
    $("perUnit").textContent = buy > 0 ? money(grow / buy) : money(sup / y);
  }

  document.querySelectorAll("[data-m]").forEach(function (b) {
    b.addEventListener("click", function () { setMethod(b.dataset.m); applyEstimates(false); });
  });
  $("crop").addEventListener("input", onCrop);
  document.querySelectorAll(".calc-section input:not(#crop)").forEach(function (i) { i.addEventListener("input", calc); });

  onCrop();
})();
