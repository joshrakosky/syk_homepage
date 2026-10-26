/* Variable-data business card. The proof updates only when Generate proof is clicked. */
(function () {
  var prices = { "100": 48, "250": 79, "500": 129, "1000": 189 };
  var proved = false;

  var qty = document.getElementById("card-qty");
  var price = document.getElementById("card-price");
  var note = document.getElementById("form-note");

  qty.addEventListener("change", paintPrice);
  paintPrice();

  document.getElementById("card-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var fields = readFields();
    if (!fields.name) {
      note.textContent = "Enter a name.";
      return;
    }
    note.textContent = "";
    writeLine("proof-name", fields.name, "Your name");
    writeLine("proof-title", fields.title, "Title");
    writeLine("proof-email", fields.email, "Email");
    writeLine("proof-phone", fields.phone, "Phone");
    writeLine("proof-address", fields.address, "Address");
    proved = true;
  });

  var added = document.getElementById("added");
  added.querySelector("[data-close-added]").addEventListener("click", function () {
    added.close();
  });

  document.getElementById("add-cart").addEventListener("click", function () {
    if (!proved) {
      note.textContent = "Generate a proof first.";
      return;
    }
    note.textContent = "";
    var fields = readFields();
    var pack = qty.value;
    var items = window.SykCart.read();
    var existing = items.find(function (item) {
      return item.id === "Stryker Business Card" && item.color === fields.name && item.size === pack + " cards";
    });
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({
        id: "Stryker Business Card",
        name: "Stryker Business Card",
        color: fields.name,
        size: pack + " cards",
        price: prices[pack],
        qty: 1
      });
    }
    window.SykCart.write(items);
    document.getElementById("added-text").textContent = "Stryker Business Card, " + fields.name + ", " + pack + " cards.";
    added.showModal();
  });

  function readFields() {
    return {
      name: value("card-name"),
      title: value("card-title"),
      email: value("card-email"),
      phone: value("card-phone"),
      address: value("card-address")
    };
  }

  function value(id) {
    return document.getElementById(id).value.trim();
  }

  function writeLine(id, text, placeholder) {
    var line = document.getElementById(id);
    var filled = text.length > 0;
    line.textContent = filled ? text : placeholder;
    line.classList.toggle("is-empty", !filled);
  }

  function paintPrice() {
    price.textContent = "$" + prices[qty.value].toFixed(2);
  }
})();
