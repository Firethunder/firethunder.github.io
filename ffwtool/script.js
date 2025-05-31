// Initiales JSON-Objekt
let data = {
    "termine": [
      {
        "id": "599",
        "datum": "2024-10-26 15:00:00",
        "name": "Kameradschaftsabend",
        "veranstalter": "Alle",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "600",
        "datum": "2025-02-07 20:00:00",
        "name": "Fahrzeugkunde und Ausleuchten",
        "veranstalter": "Harry und Valentin",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "601",
        "datum": "2025-02-06 19:00:00",
        "name": "Jugendfeuerwehr Quizapp + Knoten",
        "veranstalter": "Johannes, Robert, Bernd H., Rainer, Harry, Darron",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "602",
        "datum": "2025-02-07 20:00:00",
        "name": "Fahrzeugkunde + Ausleuchten",
        "veranstalter": "Harry, Valentin",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "603",
        "datum": "2025-02-12 20:00:00",
        "name": "Übungsbeteiligung 2024 – Kartbahn Sulz",
        "veranstalter": "Robert, Michael, Rainer, Steffen, Darron, Steven, Daniel, Manuel, Valentin",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "604",
        "datum": "2025-03-06 19:00:00",
        "name": "Jugendfeuerwehr Quizapp + Knoten",
        "veranstalter": "Darron, Michael, Harry, Steven, Robert, Bernd H.",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "605",
        "datum": "2025-03-07 20:00:00",
        "name": "Einweisung TS8 + Atemschutz",
        "veranstalter": "Rainer, Steven",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "606",
        "datum": "2025-03-14 19:00:00",
        "name": "Hauptversammlung Isingen",
        "veranstalter": "Alle",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "607",
        "datum": "2025-03-18 20:00:00",
        "name": "Absturzsicherung",
        "veranstalter": "Harry, Tobias",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "608",
        "datum": "2025-03-22 13:00:00",
        "name": "KFV-Versammlung Onstmetting",
        "veranstalter": "Führung",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "609",
        "datum": "2025-04-04 20:00:00",
        "name": "Funkübung",
        "veranstalter": "Robert, Bernd H.",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "610",
        "datum": "2025-04-08 20:00:00",
        "name": "Führungsgruppe Rosenfeld",
        "veranstalter": "Steven, Tobias, Harry, Manuel",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "611",
        "datum": "2025-04-12 12:00:00",
        "name": "Jubiläum – Handwerkerversper in Bickelsberg",
        "veranstalter": "Alle",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": "612",
        "datum": "2025-04-15 20:00:00",
        "name": "Gesamtausschusssitzung Heiligenzimmern",
        "veranstalter": "Führung",
        "Gruppe": "Alle",
        "send": "0"
      },
      {
        "id": 613,
        "datum": "2025-05-30 18:00:00",
        "name": "Maibaum",
        "veranstalter": "Alle",
        "gruppe": "Alle",
        "send": "0"
      },
      {
        "id": 614,
        "datum": "2025-05-01 12:00:00",
        "name": "Maihockete Täbingen",
        "veranstalter": "Alle",
        "gruppe": "Alle",
        "send": "0"
      },
      {
        "id": 615,
        "datum": "2025-05-02 20:00:00",
        "name": "Löschangriff Staffel",
        "veranstalter": "Gruppe A/Steven, Kevin",
        "gruppe": "Alle",
        "send": "0"
      },
      {
        "id": 616,
        "datum": "2025-05-02 20:00:00",
        "name": "Selbstretten",
        "veranstalter": "Gruppe B/Harry, Tobias",
        "gruppe": "Alle",
        "send": "0"
      },
      {
        "id": 617,
        "datum": "2025-05-16 19:30:00",
        "name": "Zugübung Rosenfeld/Heilizgenzimmern",
        "veranstalter": "3-48: Steffen, Kevin, Patrick, Daniel, Darron, Sven. 3-11: Steven, Tobias, Bernd H.",
        "gruppe": "Zug",
        "send": "0"
      },
      {
        "id": 618,
        "datum": "2025-05-27 20:00:00",
        "name": "Atemschutzstrecke Sulz",
        "veranstalter": "Steffen, Kai, Manuel, Robert, Patrick, Tobias, Darron, Sven",
        "gruppe": "Alle",
        "send": "0"
      },
      {
        "id": 619,
        "datum": "2025-05-28 20:00:00",
        "name": "Atemschutzstrecke Sulz",
        "veranstalter": "Rainer, Volker, Harry, Kevin, Steven, Michael, Valentin",
        "gruppe": "Alle",
        "send": "0"
      }
    ],
    "stand": "2025-04-22 00:00:00",
    "gruppen": {
      "A": [],
      "B": []
    }
  };
let idx = 0;

// Funktion zum Rendern der Termine in die Tabelle
function renderTable() {
    const $tableBody = $("#termineTable tbody");
    $tableBody.empty();

    data.termine.forEach((termin, index) => {
        if (idx < termin.id) {
            idx = termin.id;
        }
        const row = `<tr>
            <td><input type="datetime-local" class="datum w3-input" value="${termin.datum}" onchange="updateTermin(${index})"></td>
            <td><input type="text" class="name w3-input" value="${termin.name}" onchange="updateTermin(${index})"></td>
            <td><input type="text" class="veranstalter w3-input" value="${termin.veranstalter}" onchange="updateTermin(${index})"></td>
            <td>
                <select class="gruppe w3-select w3-center">
                    <option value="Alle" ${termin.gruppe === "Alle" ? "selected" : ""}>Alle</option>
                    <option value="Zug" ${termin.gruppe === "Zug" ? "selected" : ""}>Zug</option>
                    <option value="HoSi" ${termin.gruppe === "HoSi" ? "selected" : ""}>HoSi</option>
                </select>
            </td>
            <td>
                <button onclick="deleteTermin(${index})" class="w3-button w3-small"><i class="fa fa-trash"></i></button>
            </td>
        </tr>`;
        $tableBody.append(row);
    });
}

function updateTermin(index) {
  const row = $("#termineTable tbody tr").eq(index);
  const updatedTermin = {
      id: data.termine[index].id,
      datum: row.find(".datum").val(),
      name: row.find(".name").val(),
      veranstalter: row.find(".veranstalter").val(),
      Gruppe: row.find(".gruppe").val(),
      send: '0'
  };
  data.termine[index] = updatedTermin;
}

// Funktion zum Löschen eines Termins
function deleteTermin(index) {
    data.termine.splice(index, 1);
    renderTable();
}

function addTermin() {
  const row = $("#termineTable tfoot tr");
    const newTermin = {
        id: ++idx,
        datum: row.find(".datum").val(),
        name: row.find(".name").val(),
        veranstalter: row.find(".veranstalter").val(),
        Gruppe: row.find(".gruppe").val(),
        send: '0' 
    };
    data.termine.push(newTermin);
    row.find(".datum").val('')
    row.find(".name").val('')
    row.find(".veranstalter").val('')
    row.find(".gruppe").val('')
    renderTable();
}

// Funktion zum Anzeigen des JSON-Outputs
$("#showJsonButton").on("click", function() {
    $("#jsonOutput").text(JSON.stringify(data, null, 2));
});

// Initiales Rendern der Tabelle
renderTable();
