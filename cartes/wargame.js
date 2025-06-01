document.getElementById("generate").addEventListener("click", () => {
  const fileInput = document.getElementById("file");
  const game = document.querySelector("input[name='game']:checked").value;
  const container = document.getElementById("card-sheet");

  if (!fileInput.files.length) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = JSON.parse(e.target.result);
    const warband = data.warband || [];
    container.innerHTML = "";

    warband.forEach((unit, index) => {
      const name = unit.Name || `Unit ${index + 1}`;

      const statLabels = game === "space"
        ? ["SPD", "DEF", "FP", "PRW", "WIL"]
        : ["SPD", "DEF", "MGT", "WIL"];
      const statFields = game === "space"
        ? [unit.speed, unit.defense, unit.firepower, unit.prowess, unit.willpower]
        : [unit.speed, unit.defense, unit.might, unit.willpower];

      let traitText = "";
      if (game === "sword") {
        if (unit.class) traitText += `${unit.class.name}: ${unit.class.notes}\n`;
        if (unit.class2 && unit.class2.name !== "None") traitText += `${unit.class2.name}: ${unit.class2.notes}\n`;
      }
      if (unit.leaderTrait) traitText += `${unit.leaderTrait.name}: ${unit.leaderTrait.power}\n`;
      if (unit.equipment?.name && unit.equipment.name !== "none") traitText += `${unit.equipment.name}: ${unit.equipment.effect}\n`;
      if (unit.equipment2?.name && unit.equipment2.name !== "none") traitText += `${unit.equipment2.name}: ${unit.equipment2.effect}\n`;

      let weaponText = "";
      if (game === "space") {
        if (unit.rangedWeapon?.name && unit.rangedWeapon.name !== "none") {
          weaponText += `${unit.rangedWeapon.name}: ${unit.rangedWeapon.notes || ""}\n`;
        }
        if (unit.ccWeapon?.name && unit.ccWeapon.name !== "none") {
          weaponText += `${unit.ccWeapon.name}: ${unit.ccWeapon.notes || ""}\n`;
        }
      } else {
        (unit.Weapons || []).forEach(w => {
          weaponText += `${w.name}: ${[...(w.properties || []), ...(w.maneuvers || [])].join(", ")}\n`;
        });
      }

      const totalLength = (traitText + weaponText).length;
      const splitNeeded = totalLength > 900;

      const createCard = (titleText, traitsHTML, weaponsHTML, showTraits = true) => {
        const card = document.createElement("div");
        card.className = "card-unit";

        const title = document.createElement("h2");
        title.textContent = titleText;
        card.appendChild(title);

        const stats = document.createElement("div");
        stats.className = "stats-row";
        statLabels.forEach((label, i) => {
          const stat = document.createElement("div");
          stat.textContent = `${label} ${statFields[i]?.name ?? "-"}`;
          stats.appendChild(stat);
        });
        card.appendChild(stats);

        if (showTraits && traitsHTML.trim()) {
          const traits = document.createElement("div");
          traits.className = "traits-box";
          traits.innerHTML = traitsHTML;
          card.appendChild(traits);
        }

        card.appendChild(weaponsHTML);
        container.appendChild(card);
      };

      const weaponsTable = document.createElement("table");
      weaponsTable.className = "weapon-table";
      if (game === "space") {
        weaponsTable.innerHTML = `
          <thead><tr><th>Weapon</th><th>Action</th><th>Notes</th></tr></thead>
          <tbody></tbody>`;
      } else {
        weaponsTable.innerHTML = `
          <thead><tr><th>Weapon</th><th>Hands</th><th>Properties</th><th>Maneuvers</th></tr></thead>
          <tbody></tbody>`;
      }
      const tbody = weaponsTable.querySelector("tbody");

      if (game === "space") {
        if (unit.rangedWeapon?.name && unit.rangedWeapon.name !== "none") {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${unit.rangedWeapon.name}</td>
            <td>Ranged</td>
            <td>${unit.rangedWeapon.notes || ""}</td>`;
          tbody.appendChild(tr);
        }
        if (unit.ccWeapon?.name && unit.ccWeapon.name !== "none") {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${unit.ccWeapon.name}</td>
            <td>Melee</td>
            <td>${unit.ccWeapon.notes || ""}</td>`;
          tbody.appendChild(tr);
        }
      } else {
        (unit.Weapons || []).forEach(w => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${w.name}</td>
            <td>${w.hands || '-'}</td>
            <td>${(w.properties || []).join(", ")}</td>
            <td>${(w.maneuvers || []).join(", ")}</td>`;
          tbody.appendChild(tr);
        });
      }

      if (!splitNeeded) {
        createCard(name, traitText.replaceAll("\n", "<br>"), weaponsTable, traitText.trim().length > 0);
      } else {
        createCard(name, traitText.replaceAll("\n", "<br>"), document.createElement("div"), traitText.trim().length > 0);
        createCard(name + " – Suite", "", weaponsTable, false);
      }

      if (unit.spells?.length) {
        unit.spells.forEach(spell => {
          const spellCard = document.createElement("div");
          spellCard.className = "card-unit sort-card";
          spellCard.innerHTML = `
            <div class="spell-name">${spell.name}</div>
            <div class="caster-name">${name}</div>
            <div class="spell-text">${spell.notes || ""}</div>
            <div class="spell-cost">Points: ${spell.point ?? 0}</div>`;
          container.appendChild(spellCard);
        });
      }
    });
  };
  reader.readAsText(fileInput.files[0]);
});
