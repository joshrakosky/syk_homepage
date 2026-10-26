/* Reorders the category cards. Featured keeps the order written in the page. */
(function () {
  var grid = document.querySelector(".product-grid");
  var select = document.getElementById("product-sort");
  if (!grid || !select) return;

  var cards = Array.prototype.slice.call(grid.children);

  select.addEventListener("change", function () {
    var value = select.value;
    var next = cards.slice();

    if (value === "name-asc" || value === "name-desc") {
      next.sort(function (a, b) {
        return a.dataset.name.localeCompare(b.dataset.name);
      });
      if (value === "name-desc") next.reverse();
    } else if (value === "price-asc" || value === "price-desc") {
      next.sort(function (a, b) {
        return Number(a.dataset.price) - Number(b.dataset.price);
      });
      if (value === "price-desc") next.reverse();
    }

    next.forEach(function (card) {
      grid.appendChild(card);
    });
  });
})();
