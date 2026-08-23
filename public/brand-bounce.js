document.addEventListener(
  "click",
  function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var brand = target.closest("a.brand");
    if (!brand) return;

    brand.classList.remove("is-bouncing");
    void brand.getBoundingClientRect();
    brand.classList.add("is-bouncing");
  },
  true,
);

document.addEventListener("animationend", function (event) {
  if (!(event.target instanceof Element)) return;
  if (!event.target.classList.contains("brand")) return;
  if (event.animationName.indexOf("brand-bounce") === -1) return;
  event.target.classList.remove("is-bouncing");
});
