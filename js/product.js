/* Fills the product page from ?id= and adds the chosen color and size to the test cart. */
(function () {
  var catalog = {
    polo: {
      name: "Classic Polo",
      sku: "21408",
      price: 42,
      text: "A short-sleeve polo for meetings, clinics, and everyday uniform wear.",
      colors: [
        { name: "Black", hex: "#1a1a1a" },
        { name: "Charcoal", hex: "#5c5c5c" },
        { name: "Gold", hex: "#ffb500" }
      ],
      sizes: ["XS", "S", "M", "L", "XL", "2XL"]
    },
    pullover: {
      name: "Everyday Pullover",
      sku: "21436",
      price: 68,
      text: "A midweight pullover for travel days and cooler clinics.",
      colors: [
        { name: "Black", hex: "#1a1a1a" },
        { name: "Navy", hex: "#1d2a44" }
      ],
      sizes: ["S", "M", "L", "XL", "2XL"]
    },
    shirt: {
      name: "Dress Shirt",
      sku: "21451",
      price: 54,
      text: "A pressed dress shirt for conferences and customer meetings.",
      colors: [
        { name: "White", hex: "#f4f4f4" },
        { name: "Light Blue", hex: "#c5d4e8" }
      ],
      sizes: ["S", "M", "L", "XL", "2XL"]
    },
    jacket: {
      name: "Softshell Jacket",
      sku: "21477",
      price: 96,
      text: "A light softshell for events, travel, and outdoor programs.",
      colors: [
        { name: "Black", hex: "#1a1a1a" },
        { name: "Charcoal", hex: "#5c5c5c" }
      ],
      sizes: ["S", "M", "L", "XL", "2XL"]
    }
  };

  var params = new URLSearchParams(window.location.search);
  var product = catalog[params.get("id")] || catalog.polo;
  var color = "";
  var size = "";

  document.title = "Stryker | " + product.name;
  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-sku").textContent = "Item # " + product.sku;
  document.getElementById("crumb-name").textContent = product.name;
  document.getElementById("product-text").textContent = product.text;
  document.getElementById("product-price").textContent = money(product.price);

  var colorRow = document.getElementById("color-row");
  var sizeRow = document.getElementById("size-row");
  var bulkGrid = document.getElementById("bulk-grid");
  product.colors.forEach(function (item) {
    colorRow.appendChild(choiceButton(item.name, "color", function () {
      color = item.name;
    }, item.hex));
  });
  product.sizes.forEach(function (item) {
    sizeRow.appendChild(choiceButton(item, "size", function () {
      size = item;
    }));
    bulkGrid.appendChild(bulkCell(item));
  });

  var bulkToggle = document.getElementById("bulk-order");
  var sizeChoice = document.getElementById("size-choice");
  var qtySingle = document.getElementById("qty-single");
  bulkToggle.addEventListener("change", function () {
    var on = bulkToggle.checked;
    bulkGrid.hidden = !on;
    sizeChoice.hidden = on;
    qtySingle.hidden = on;
    document.getElementById("form-note").textContent = "";
  });

  var chart = document.getElementById("size-chart");
  document.getElementById("open-chart").addEventListener("click", function () {
    chart.showModal();
  });
  chart.querySelector("[data-close-chart]").addEventListener("click", function () {
    chart.close();
  });

  var added = document.getElementById("added");
  added.querySelector("[data-close-added]").addEventListener("click", function () {
    added.close();
  });

  document.getElementById("add-cart").addEventListener("click", function () {
    var note = document.getElementById("form-note");
    if (!color) {
      note.textContent = "Choose a color.";
      return;
    }

    var lines = [];
    if (bulkToggle.checked) {
      bulkGrid.querySelectorAll("input").forEach(function (input) {
        var count = Math.max(0, Number(input.value) || 0);
        if (count > 0) lines.push({ size: input.dataset.size, qty: count });
      });
      if (!lines.length) {
        note.textContent = "Enter a quantity for at least one size.";
        return;
      }
    } else {
      if (!size) {
        note.textContent = "Choose a color and a size.";
        return;
      }
      lines.push({
        size: size,
        qty: Math.max(1, Number(document.getElementById("qty").value) || 1)
      });
    }

    note.textContent = "";
    var items = window.SykCart.read();
    lines.forEach(function (line) {
      var existing = items.find(function (item) {
        return item.id === product.name && item.color === color && item.size === line.size;
      });
      if (existing) {
        existing.qty += line.qty;
      } else {
        items.push({
          id: product.name,
          name: product.name,
          color: color,
          size: line.size,
          price: product.price,
          qty: line.qty
        });
      }
    });
    window.SykCart.write(items);
    document.getElementById("added-text").textContent = addedCopy(lines);
    added.showModal();
  });

  function bulkCell(label) {
    var wrap = document.createElement("label");
    wrap.className = "bulk-cell";
    wrap.appendChild(document.createTextNode(label));
    var input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = "0";
    input.dataset.size = label;
    input.setAttribute("aria-label", label + " quantity");
    wrap.appendChild(input);
    return wrap;
  }

  function choiceButton(label, group, onPick, hex) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = hex ? "swatch" : "size";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", label);
    if (hex) {
      button.style.background = hex;
    } else {
      button.textContent = label;
    }
    button.addEventListener("click", function () {
      button.parentElement.querySelectorAll("button").forEach(function (other) {
        other.setAttribute("aria-pressed", "false");
      });
      button.setAttribute("aria-pressed", "true");
      onPick();
      if (hex) document.getElementById("color-name").textContent = "· " + label;
    });
    return button;
  }

  function money(amount) {
    return "$" + amount.toFixed(2);
  }

  function addedCopy(lines) {
    var pieces = lines.map(function (line) {
      return line.qty + " " + line.size;
    }).join(", ");
    return product.name + ", " + color + ": " + pieces + ".";
  }
})();
