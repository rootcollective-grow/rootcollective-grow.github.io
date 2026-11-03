// "Watch it grow" sliders: swap the picture and text as you drag through the stages.
// alt = a short description of the picture for people using screen readers.

// Lettuce in a jar: what happens each week, from planting the seed (week 0) to picking (week 6).
const weeks = [
  { alt: "A glass jar of water with a growing cube in the lid, ready for a seed", text: "Press a few seeds into a damp growing cube in a small net cup (a plastic pot full of holes) sitting in the jar's lid. Fill the jar with nutrient water until it just touches the bottom of the cup." },
  { alt: "A tiny green sprout on top of the growing cube", text: "A tiny sprout pops up, usually within 3 to 7 days. Keep it somewhere bright, and snip off all but the strongest one." },
  { alt: "A small lettuce seedling with short roots reaching into the water", text: "The first real leaves appear and the roots reach down into the water." },
  { alt: "A young lettuce, with the water level starting to drop below the cup", text: "The plant grows fast and drinks water, so the level drops. That's on purpose! The gap of air at the top lets the upper roots breathe." },
  { alt: "A leafy lettuce with long roots and an air gap above the water", text: "Lots of leaves now. If the water gets very low, add a little nutrient water, but don't fill it back to the top. The roots still need that air gap." },
  { alt: "A nearly full-grown lettuce with roots filling the jar", text: "Nearly there. You can start picking a few outer leaves for a salad." },
  { alt: "A full lettuce ready to harvest, with the water about half gone", text: "Harvest time! Pick the outer leaves as you need them. A full head takes a week or two longer." },
];

// Microgreens: what happens every couple of days, from sowing (day 0) to harvest (day 10).
const days = [
  { day: 0, alt: "A tray of dark soil with seeds scattered thickly over the top", text: "Sow the seeds thickly on damp growing mix, so they almost touch. Mist them, then cover the tray to keep it dark." },
  { day: 2, alt: "Tiny white sprouts poking out of the seeds all over the tray", text: "Under the cover, the seeds crack open and send out tiny white shoots and roots." },
  { day: 4, alt: "A tray of short, pale yellow shoots", text: "Uncover the tray and give it light. The shoots look pale yellow at first because they grew in the dark. That's normal." },
  { day: 6, alt: "A tray of short green seedlings with small round leaves", text: "Within a day or so of light they turn green. From now on, water from below by pouring water into the tray underneath." },
  { day: 8, alt: "A thick carpet of green microgreens with their first leaves open", text: "The first leaves are open. Fast growers like radish can already be cut." },
  { day: 10, alt: "A full tray of tall, leafy microgreens ready to cut", text: "Harvest time! Cut just above the soil with scissors, rinse, and enjoy. Slower types like peas take a few more days." },
];

const guides = {
  jar: { steps: weeks, image: (n) => `images/grow-week${n}.jpg`, label: (n) => `Week ${n} of 6` },
  mg: { steps: days, image: (n) => `images/mg-day${days[n].day}.jpg`, label: (n) => `Day ${days[n].day}` },
};

document.querySelectorAll(".grow-demo[data-grow]").forEach((demo) => {
  const guide = guides[demo.dataset.grow];
  const slider = demo.querySelector(".grow-range");
  const step = demo.querySelector(".grow-step");
  const text = demo.querySelector(".grow-text");
  const photo = demo.querySelector(".grow-photo");

  // Load all the pictures in advance so dragging the slider feels instant.
  guide.steps.forEach((_, n) => { new Image().src = guide.image(n); });

  function show(n) {
    step.textContent = guide.label(n);
    text.textContent = guide.steps[n].text;
    if (photo.getAttribute("src") !== guide.image(n)) {
      photo.classList.remove("photo-in");
      void photo.offsetWidth; // restart the fade-in animation
      photo.classList.add("photo-in");
    }
    photo.src = guide.image(n);
    photo.alt = guide.steps[n].alt;
  }
  slider.addEventListener("input", () => show(Number(slider.value)));
  show(0);
});

// Featured guides carousel: the tabs and arrows switch between the two guides.
const tabs = Array.from(document.querySelectorAll('.feature-tabs [role="tab"]'));
let current = 0;

function showSlide(n, focusTab) {
  current = (n + tabs.length) % tabs.length;
  tabs.forEach((tab, i) => {
    const on = i === current;
    tab.setAttribute("aria-selected", on);
    tab.tabIndex = on ? 0 : -1;
    const slide = document.getElementById(tab.getAttribute("aria-controls"));
    slide.hidden = !on;
    if (on) { slide.classList.remove("slide-in"); void slide.offsetWidth; slide.classList.add("slide-in"); }
  });
  if (focusTab) tabs[current].focus();
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => showSlide(i));
  tab.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") showSlide(current + 1, true);
    if (e.key === "ArrowLeft") showSlide(current - 1, true);
  });
});
document.querySelectorAll(".feature-arrow").forEach((btn) => {
  btn.addEventListener("click", () => showSlide(current + Number(btn.dataset.step)));
});
