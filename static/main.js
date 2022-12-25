var opc;
var goodBytes = true;
var necessaryIdx = [];
var necessaryHead = {
  "0F": "0F prefix",
  po: "Primary byte",
  so: "Secondary byte",
  mnemonic: "Instruction",
  op1: "operand 1",
  op2: "operand 2",
  op3: "operand 3",
};
var table = document.createElement("table");

function error(msg) {
  // console.log(msg);
  showNotification(msg);
  return -1;
}

function load() {
  return refreshTable(table);
}

function fillDataCell(row, tr, idx) {
  var td = document.createElement("td");
  td.appendChild(document.createTextNode(row[opc.head[idx]]));
  tr.appendChild(td);
  delete td;
}

function fillHeading(tbody) {
  var tr = document.createElement("tr");
  tbody.appendChild(tr);
  for (var i = 0; i < opc.head.length; i++) {
    if (!Object.keys(necessaryHead).includes(opc.head[i])) continue;
    necessaryIdx.push(i);
    var th = document.createElement("th");
    th.appendChild(document.createTextNode(necessaryHead[opc.head[i]]));

    tr.appendChild(th);
    delete th;
  }
  delete tr;
}

function checkThisRow(row, userBytes) {
  let keepRow = true;
  for (const field of row) {
    if (field == "") continue;
    if (!userBytes.includes(field) && goodBytes) {
      // console.log(userBytes, " is there? ", field);
      keepRow = false;
      break;
    }
    if (userBytes.includes(field) && !goodBytes) {
      keepRow = false;
      break;
    }
  }
  return keepRow;
}

function fillRow(row, tr) {
  necessaryIdx.forEach((idx) => {
    fillDataCell(row, tr, idx);
  });
}

function fillTable(table, userBytes) {
  var row;
  var tbody = table.firstChild;

  for (var j = 0; j < opc.body.length; j++) {
    if (opc.body[j]["mnemonic"] == "invalid") continue;
    if (opc.body[j]["pf"] != "") continue;
    var tr = document.createElement("tr");
    tbody.appendChild(tr);
    row = opc.body[j];

    if (userBytes != undefined) {
      if (!checkThisRow([row["0F"], row["po"], row["so"]], userBytes)) continue;
    }

    fillRow(row, tr);
    delete tr;
  }
}

function emptyTable() {
  var rows = table.rows;
  var i = rows.length;
  while (--i) {
    rows[i].parentNode.removeChild(rows[i]);
    // or
    // table.deleteRow(i);
  }
}

function tableInit(table) {
  var tbody = document.createElement("tbody");
  var tdiv = document.getElementById("below");
  fillHeading(tbody);

  table.appendChild(tbody);
  tdiv.appendChild(table);
}

function refreshTable(table) {
  var ta = document.getElementById("userbyte").value;
  var radio = document.getElementsByName("delimiter");
  var type = document.getElementsByName("bytetype");

  goodBytes = parseByteType(type);
  if (goodBytes == -1) return;
  var userBytes = parseInput(ta, radio);
  if (userBytes == -1) return;

  emptyTable(table);
  fillTable(table, userBytes);
}

function parseInput(ta, radio) {
  var input;
  var delimiter = returnCheck(radio);
  if (!ta.length) return error("Enter some bytes.");
  ta = ta.toUpperCase();

  if (delimiter == -1) {
    // console.log("it was here");
    return error("Select Delimiter type");
  } else if (delimiter == "slashx") {
    input = ta.trim().replaceAll("\\X", "");
  } else if (delimiter == "zerox") {
    input = ta.trim().slice(2);
  } else if (delimiter == "space") {
    input = ta.trim().replaceAll(" ", "");
  } else if (delimiter == "zeroxcomma") {
    input = ta.trim().replaceAll("0X", "").replaceAll(",", "");
  } else if (delimiter == "zeroxspace") {
    input = ta.trim().replaceAll("0X", "").replaceAll(" ", "");
  } else if (delimiter == "empty") {
    input = ta.trim().replaceAll(" ", "");
  }
  input = input.match(/.{1,2}/g).filter((e) => e);
  for (var i = 0; i < input.length; i++) {
    if (!/^[0-9A-Fa-f]{2}$/.test(input[i])) {
      return error("Bad byte format!");
    }
  }
  // console.log(input);

  return input;
}

function parseByteType(type) {
  var check = returnCheck(type);
  var checked;
  if (check == "GOOD") checked = true;
  else if (check == -1) checked = -1;
  else checked = false;
  if (checked != -1) return checked;
  return error("Select byte type");
}

function returnCheck(ele) {
  for (i = 0; i < ele.length; i++) {
    if (ele[i].checked) {
      return ele[i].value;
    }
  }
  return -1;
}

(async function () {
  opc = await fetch("static/64bitopcodes.json");
  opc = await opc.json();
  tableInit(table);
  fillTable(table);
})();

function showNotification(message) {
  console.log("sadf");
  document.getElementById("notification").style.display = "block";
  document.getElementById("notification-message").innerHTML = message;
  setTimeout(hideNotification, 5000);
}

function hideNotification() {
  document.getElementById("notification").style.display = "none";
}
