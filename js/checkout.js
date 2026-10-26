/* Renders the test cart. Place order does not send anything. */
(function () {
  var list = document.getElementById("cart-list");
  var empty = document.getElementById("cart-empty");
  var summary = document.getElementById("cart-summary");
  var items = window.SykCart.read();

  if (!items.length) {
    empty.hidden = false;
    return;
  }

  var total = 0;
  items.forEach(function (item) {
    var line = item.price * item.qty;
    total += line;
    var row = document.createElement("li");
    row.innerHTML = "<div><strong></strong><p></p></div><span></span>";
    row.querySelector("strong").textContent = item.name;
    row.querySelector("p").textContent = item.color + ", " + item.size + " · Qty " + item.qty;
    row.querySelector("span").textContent = money(line);
    list.appendChild(row);
  });
  document.getElementById("cart-total").textContent = money(total);
  summary.hidden = false;

  document.getElementById("place-order").addEventListener("click", function () {
    window.SykCart.write([]);
    summary.hidden = true;
    document.getElementById("order-note").hidden = false;
  });

  function money(amount) {
    return "$" + amount.toFixed(2);
  }
})();
