/* Planting planner (planner.html).
   Works out when to start each batch of seeds so harvests come regularly with no gaps.
   sd = weeks as a seedling before moving in, g = weeks in the setup until harvest. Rough numbers. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$("chart")) return;

  var SETUP_WORD = { jar: ["jar", "jars"], soil: ["pot", "pots"], bucket: ["bucket", "buckets"], tray: ["tray", "trays"] };
  var METHOD_NAME = { jar: "a water jar", soil: "a pot of soil", bucket: "a bubble bucket", tray: "a microgreens tray" };
  var GENERAL = { jar: { sd: 2, g: 4 }, soil: { sd: 0, g: 6 }, bucket: { sd: 2, g: 4 }, tray: { sd: 0, g: 1.5 } };
  var CROPS = {
    lettuce: { name: "lettuce", m: { jar: { sd: 2, g: 4 }, soil: { sd: 0, g: 7 }, bucket: { sd: 2, g: 4 } } },
    spinach: { name: "spinach", m: { jar: { sd: 2, g: 4 }, soil: { sd: 0, g: 6 }, bucket: { sd: 2, g: 3.5 } },
      note: "Spinach likes it cool. In a warm room it can go to seed early." },
    bokchoy: { name: "bok choy", m: { jar: { sd: 2, g: 4 }, soil: { sd: 0, g: 6 }, bucket: { sd: 2, g: 3.5 } } },
    kale: { name: "kale", m: { jar: { sd: 2, g: 5 }, soil: { sd: 0, g: 7 }, bucket: { sd: 2, g: 4 } },
      note: "Timed for baby kale. A full plant can also be picked a few leaves at a time for months." },
    cilantro: { name: "cilantro", m: { soil: { sd: 0, g: 5 }, jar: { sd: 2, g: 4 }, bucket: { sd: 2, g: 3.5 } },
      note: "Cilantro goes to seed quickly, so starting a small batch every 2 to 3 weeks works well." },
    greenonions: { name: "green onions", m: { soil: { sd: 0, g: 9 }, jar: { sd: 3, g: 6 }, bucket: { sd: 3, g: 5 } },
      note: "From seed. You can also cut them and let them regrow a couple of times." },
    microgreens: { name: "microgreens", m: { tray: { sd: 0, g: 1.5 } },
      note: "About 7 to 14 days depending on the seed. Radish and broccoli are among the quickest." },
    basil: { name: "basil", m: { jar: { sd: 2, g: 4 }, soil: { sd: 0, g: 6 }, bucket: { sd: 2, g: 3 } },
      note: "Basil keeps giving for a couple of months once it's growing, so you need fewer batches. Every 4 weeks is usually plenty." }
  };
  var ALIASES = [
    ["microgreen", "microgreens"], ["sprout", "microgreens"], ["pea shoot", "microgreens"], ["shoots", "microgreens"],
    ["lettuce", "lettuce"], ["romaine", "lettuce"], ["butterhead", "lettuce"], ["salad", "lettuce"], ["arugula", "lettuce"],
    ["spinach", "spinach"], ["kale", "kale"], ["chard", "kale"], ["bok", "bokchoy"], ["pak choi", "bokchoy"],
    ["basil", "basil"], ["cilantro", "cilantro"], ["coriander", "cilantro"],
    ["green onion", "greenonions"], ["scallion", "greenonions"], ["spring onion", "greenonions"]
  ];
  function findCrop(t) {
    t = (t || "").toLowerCase().trim();
    if (!t) return "";
    for (var i = 0; i < ALIASES.length; i++) if (t.indexOf(ALIASES[i][0]) !== -1) return ALIASES[i][1];
    return "other";
  }

  var cropKey = null, method = "jar", events = [];
  var DAY = 86400000;

  function setMethod(m) {
    method = m;
    document.querySelectorAll("[data-m]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.m === m ? "true" : "false"); });
    document.querySelectorAll(".mname").forEach(function (el) { el.textContent = SETUP_WORD[m][0]; });
  }
  function cropName() {
    var c = CROPS[cropKey];
    return c ? c.name : ($("crop").value.trim().toLowerCase() || "plants");
  }
  function applyTiming() {
    var c = CROPS[cropKey], t, note;
    if (c && c.m[method]) { t = c.m[method]; note = "Rough timing for " + c.name + " in " + METHOD_NAME[method] + ". Change it if you know better."; }
    else if (c) { t = GENERAL[method]; note = "We don't have timing for " + c.name + " in " + METHOD_NAME[method] + ", so these are general guesses."; }
    else if (cropKey === "other") { t = GENERAL[method]; note = "We don't have timing for “" + $("crop").value.trim() + "” yet. Check the seed packet for days to harvest and fill it in below."; }
    else { t = GENERAL[method]; note = "Type what you're growing above to get timing."; }
    $("timingNote").textContent = note;
    $("cropNote").textContent = c && c.note ? c.note : "";
    $("sd").value = t.sd;
    $("g").value = t.g;
    plan();
  }
  function onCrop() {
    var k = findCrop($("crop").value);
    if (k === cropKey && k !== "other") return;
    cropKey = k;
    var c = CROPS[k];
    if (c && !c.m[method]) setMethod(Object.keys(c.m)[0]);
    applyTiming();
  }

  function addDays(d, n) { return new Date(d.getTime() + Math.round(n) * DAY); }
  function fmt(d, long) {
    return d.toLocaleDateString(undefined, long ? { weekday: "short", month: "short", day: "numeric", year: "numeric" } : { weekday: "short", month: "short", day: "numeric" });
  }
  function startDate() {
    var v = $("start").value;
    if (v) { var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
    var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function plan() {
    var sd = Math.max(0, parseFloat($("sd").value) || 0);
    var g = Math.max(0.5, parseFloat($("g").value) || 0.5);
    var every = parseInt($("every").value, 10) || 1;
    var span = parseInt($("weeks").value, 10) || 12;
    var start = startDate();
    var setups = Math.ceil(g / every - 1e-9);
    var word = SETUP_WORD[method];
    var name = cropName();

    // Batches: one every `every` weeks, while its harvest still falls inside the plan.
    var batches = [];
    for (var k = 0; k < 60; k++) {
      var sow = k * every;
      var harvest = sow + sd + g;
      if (harvest > span + 0.01) break;
      batches.push({ n: k + 1, sow: sow, move: sow + sd, harvest: harvest, setup: (k % setups) + 1 });
    }
    // Keep sowing batches whose harvest lands after the plan ends, so there's no gap at the end.
    var lastSow = batches.length ? batches[batches.length - 1].sow : -every;

    $("needSetups").textContent = setups;
    $("needSetupsLabel").textContent = (setups === 1 ? word[0] : word[1]) + " in use at once";
    $("sowEvery").textContent = every === 1 ? "Every week" : "Every " + every + " weeks";
    $("firstHarvest").textContent = batches.length ? fmt(addDays(start, (sd + g) * 7)) : "After your plan";
    $("harvestCount").textContent = batches.length;
    $("harvestCountLabel").textContent = (batches.length === 1 ? "harvest" : "harvests") + " in your plan";

    // Chart
    var chart = $("chart");
    chart.innerHTML = "";
    var weeksShown = span;
    var axis = document.createElement("div");
    axis.className = "plan-axis";
    for (var w = 0; w <= weeksShown; w += (weeksShown > 16 ? 4 : 2)) {
      var tick = document.createElement("span");
      tick.style.left = (w / weeksShown * 100) + "%";
      tick.textContent = w === 0 ? "Start" : "Wk " + w;
      axis.appendChild(tick);
    }
    batches.forEach(function (b) {
      var row = document.createElement("div");
      row.className = "plan-row";
      var label = document.createElement("span");
      label.className = "plan-label";
      label.textContent = "Batch " + b.n;
      var track = document.createElement("div");
      track.className = "plan-track";
      if (sd > 0) {
        var s = document.createElement("span");
        s.className = "seg seed";
        s.style.left = (b.sow / weeksShown * 100) + "%";
        s.style.width = (sd / weeksShown * 100) + "%";
        track.appendChild(s);
      }
      var gr = document.createElement("span");
      gr.className = "seg grow";
      gr.style.left = (b.move / weeksShown * 100) + "%";
      gr.style.width = (g / weeksShown * 100) + "%";
      track.appendChild(gr);
      var h = document.createElement("span");
      h.className = "seg harvest";
      h.style.left = "calc(" + (b.harvest / weeksShown * 100) + "% - 7px)";
      track.appendChild(h);
      row.appendChild(label);
      row.appendChild(track);
      chart.appendChild(row);
    });
    chart.appendChild(axis);

    // Event list, grouped by date
    events = [];
    batches.forEach(function (b) {
      var where = word[0] + " " + b.setup;
      if (sd > 0) {
        events.push({ d: b.sow, t: "Start seeds for batch " + b.n, s: "Sow in a seed starter." });
        events.push({ d: b.move, t: "Move batch " + b.n + " into " + where, s: b.n > setups ? "Right after " + where + " is harvested." : "" });
      } else {
        events.push({ d: b.sow, t: "Sow batch " + b.n + " in " + where, s: b.n > setups ? "Right after " + where + " is harvested." : "" });
      }
      events.push({ d: b.harvest, t: "Harvest batch " + b.n, s: "From " + where + ".", h: true });
    });
    // Seeds to start before the plan ends, so harvests keep going afterwards.
    for (var sow2 = lastSow + every; sow2 < span; sow2 += every) {
      events.push({ d: sow2, t: (sd > 0 ? "Start seeds" : "Sow") + " for the next round", s: "Ready after your plan ends, so there's no gap." });
    }
    events.sort(function (a, b) { return a.d - b.d || (a.h ? -1 : 1); });

    var list = $("list");
    list.innerHTML = "";
    var lastKey = null, li, ul;
    events.forEach(function (e) {
      var date = addDays(start, e.d * 7);
      var key = date.toDateString();
      if (key !== lastKey) {
        li = document.createElement("li");
        var dt = document.createElement("p");
        dt.className = "plan-date";
        dt.textContent = fmt(date);
        li.appendChild(dt);
        ul = document.createElement("ul");
        li.appendChild(ul);
        list.appendChild(li);
        lastKey = key;
      }
      var item = document.createElement("li");
      if (e.h) item.className = "is-harvest";
      var strong = document.createElement("strong");
      strong.textContent = e.t;
      item.appendChild(strong);
      if (e.s) { item.appendChild(document.createTextNode(" " + e.s)); }
      ul.appendChild(item);
      e.date = date;
    });
    $("printTitle") && ($("printTitle").textContent = "Planting plan: " + name + " in " + METHOD_NAME[method] + ", a harvest " + $("sowEvery").textContent.toLowerCase());
  }

  // Calendar file (.ics) so the schedule can be saved to a phone or computer calendar.
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }
  function makeIcs() {
    var name = cropName();
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//The Root Collective//Planting planner//EN", "CALSCALE:GREGORIAN"];
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    events.forEach(function (e, i) {
      var next = addDays(e.date, 1);
      lines.push("BEGIN:VEVENT", "UID:rc-" + stamp + "-" + i + "@rootcollective", "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + ymd(e.date), "DTEND;VALUE=DATE:" + ymd(next),
        "SUMMARY:" + (e.t + " (" + name + ")").replace(/[,;]/g, " "),
        "DESCRIPTION:" + (e.s || "").replace(/[,;]/g, " ") + " From the Root Collective planting planner.", "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "planting-plan-" + name.replace(/[^a-z0-9]+/gi, "-") + ".ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // Defaults
  var today = new Date();
  $("start").value = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());

  document.querySelectorAll("[data-m]").forEach(function (b) {
    b.addEventListener("click", function () { setMethod(b.dataset.m); applyTiming(); });
  });
  $("crop").addEventListener("input", onCrop);
  ["sd", "g"].forEach(function (id) { $(id).addEventListener("input", plan); });
  ["every", "weeks", "start"].forEach(function (id) { $(id).addEventListener("change", plan); });
  $("printBtn").addEventListener("click", function () { window.print(); });
  $("icsBtn").addEventListener("click", makeIcs);

  setMethod("jar");
  onCrop();
})();
