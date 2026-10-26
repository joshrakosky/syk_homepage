/* Three-step visual checkout. Nothing is charged and the shipper number is not verified. */
(function () {
  var steps = document.getElementById("steps");
  var empty = document.getElementById("cart-empty");
  var done = document.getElementById("order-done");
  var stepCart = document.getElementById("step-cart");
  var stepShip = document.getElementById("step-ship");
  var stepPay = document.getElementById("step-pay");
  var list = document.getElementById("cart-list");
  var panels = { cart: stepCart, ship: stepShip, pay: stepPay };

  var addresses = document.getElementById("address");
  var newAddress = document.getElementById("new-address");
  var shipping = document.getElementById("shipping");
  var thirdParty = document.getElementById("third-party");

  render();

  addresses.addEventListener("change", function () {
    newAddress.hidden = addresses.value !== "new";
    document.getElementById("ship-note").textContent = "";
  });

  shipping.addEventListener("change", function () {
    thirdParty.hidden = shipping.value !== "third";
    document.getElementById("ship-note").textContent = "";
  });

  document.getElementById("to-ship").addEventListener("click", function () {
    if (!window.SykCart.read().length) {
      render();
      return;
    }
    show("ship");
  });
  document.getElementById("back-cart").addEventListener("click", function () {
    show("cart");
  });
  document.getElementById("back-ship").addEventListener("click", function () {
    show("ship");
  });

  document.getElementById("ship-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var note = document.getElementById("ship-note");
    if (!addresses.value) {
      note.textContent = "Choose an address.";
      return;
    }
    if (addresses.value === "new" && !newAddressComplete()) {
      note.textContent = "Enter the new address.";
      return;
    }
    if (!shipping.value) {
      note.textContent = "Choose a shipping method.";
      return;
    }
    if (shipping.value === "third" && !thirdPartyComplete()) {
      note.textContent = "Choose UPS or FedEx and enter a shipper number.";
      return;
    }
    note.textContent = "";
    show("pay");
  });

  document.getElementById("pay-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var note = document.getElementById("pay-note");
    if (!paymentComplete()) {
      note.textContent = "Enter the name, card number, expiration, and security code.";
      return;
    }
    note.textContent = "";
    var order = "SYK-" + String(100 + Math.floor(Math.random() * 900));
    document.getElementById("order-number").textContent = order;
    done.textContent = "Order " + order + " has been received.";
    window.SykCart.write([]);
    steps.hidden = true;
    stepCart.hidden = true;
    stepShip.hidden = true;
    stepPay.hidden = true;
    done.hidden = false;
    document.getElementById("order-sent").showModal();
  });

  document.querySelectorAll("[data-close-order]").forEach(function (button) {
    button.addEventListener("click", function () {
      document.getElementById("order-sent").close();
    });
  });

  function render() {
    var items = window.SykCart.read();
    list.textContent = "";
    if (!items.length) {
      steps.hidden = true;
      stepCart.hidden = true;
      stepShip.hidden = true;
      stepPay.hidden = true;
      empty.hidden = false;
      return;
    }

    var total = 0;
    items.forEach(function (item, index) {
      total += item.price * item.qty;
      list.appendChild(cartRow(item, index));
    });
    document.getElementById("cart-total").textContent = money(total);
    empty.hidden = true;
    show("cart");
  }

  function cartRow(item, index) {
    var row = document.createElement("li");
    var info = document.createElement("div");
    var name = document.createElement("strong");
    name.textContent = item.name;
    var detail = document.createElement("p");
    detail.textContent = item.color + ", " + item.size;
    var qtyLabel = document.createElement("label");
    qtyLabel.className = "cart-qty";
    qtyLabel.appendChild(document.createTextNode("Qty"));
    var qty = document.createElement("input");
    qty.type = "number";
    qty.min = "1";
    qty.value = String(item.qty);
    qty.setAttribute("aria-label", item.name + " " + item.size + " quantity");
    qty.addEventListener("change", function () {
      updateQty(index, qty.value);
    });
    qtyLabel.appendChild(qty);

    var side = document.createElement("div");
    side.className = "cart-side";
    var price = document.createElement("span");
    price.textContent = money(item.price * item.qty);
    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.textContent = "Remove";
    remove.addEventListener("click", function () {
      var next = window.SykCart.read();
      next.splice(index, 1);
      window.SykCart.write(next);
      render();
    });

    info.appendChild(name);
    info.appendChild(detail);
    info.appendChild(qtyLabel);
    side.appendChild(price);
    side.appendChild(remove);
    row.appendChild(info);
    row.appendChild(side);
    return row;
  }

  function updateQty(index, value) {
    var next = window.SykCart.read();
    var count = Math.floor(Number(value));
    if (!next[index]) return;
    if (!count || count < 1) {
      next.splice(index, 1);
    } else {
      next[index].qty = count;
    }
    window.SykCart.write(next);
    render();
  }

  function show(name) {
    empty.hidden = true;
    done.hidden = true;
    steps.hidden = false;
    Object.keys(panels).forEach(function (key) {
      panels[key].hidden = key !== name;
    });
    steps.querySelectorAll("[data-step]").forEach(function (item) {
      var key = item.getAttribute("data-step");
      item.classList.toggle("is-current", key === name);
      item.classList.toggle("is-done", stepIndex(key) < stepIndex(name));
    });
  }

  function stepIndex(name) {
    return ["cart", "ship", "pay"].indexOf(name);
  }

  function newAddressComplete() {
    return ["addr-name", "addr-street", "addr-city", "addr-state", "addr-zip"].every(function (id) {
      return document.getElementById(id).value.trim();
    });
  }

  function thirdPartyComplete() {
    var carrier = document.getElementById("third-carrier").value;
    var shipper = document.getElementById("shipper").value.trim();
    return (carrier === "UPS" || carrier === "FedEx") && /^[A-Za-z0-9]{6,}$/.test(shipper);
  }

  function paymentComplete() {
    var card = document.getElementById("pay-card").value.replace(/\s+/g, "");
    var exp = document.getElementById("pay-exp").value.trim();
    var cvc = document.getElementById("pay-cvc").value.trim();
    return document.getElementById("pay-name").value.trim() &&
      /^\d{13,19}$/.test(card) &&
      /^\d{2}\/\d{2}$/.test(exp) &&
      /^\d{3,4}$/.test(cvc);
  }

  function money(amount) {
    return "$" + amount.toFixed(2);
  }
})();
