/* Test cart for the apparel example. Kept in sessionStorage so a refresh of the tab still shows it. */
(function () {
  var KEY = "syk-cart";

  function read() {
    try {
      var items = JSON.parse(sessionStorage.getItem(KEY));
      return Array.isArray(items) ? items : [];
    } catch (error) {
      return [];
    }
  }

  function write(items) {
    sessionStorage.setItem(KEY, JSON.stringify(items));
    paint();
  }

  function paint() {
    var count = read().reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (badge) {
      badge.textContent = String(count);
      badge.hidden = count < 1;
    });
  }

  window.SykCart = { read: read, write: write };
  paint();
})();
