document.getElementById('generate').addEventListener('click', () => {
  const fileInput = document.getElementById('file');
  const container = document.getElementById('cards');
  const game = document.querySelector('input[name="game"]:checked').value;

  if (!fileInput.files.length) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const json = JSON.parse(e.target.result);
    const warband = json.warband || [];
    container.innerHTML = '';

    warband.forEach((model, index) => {
      const name = model.Name || `Modèle ${index + 1}`;

      const front = document.createElement('div');
      front.className = 'card';

      if (game === 'space') {
        front.innerHTML = `
          <h2>${name}</h2>
          <div class="stats">
            <strong>Stats :</strong><br>
            SPD: ${model.speed?.name} | DEF: ${model.defense?.name} | FP: ${model.firepower?.name || '-'}<br>
            PRW: ${model.prowess?.name || '-'} | WIL: ${model.willpower?.name}
          </div>
          <div class="weapons">
            <strong>Distance:</strong> ${model.rangedWeapon?.name || '–'}<br>
            <em>${model.rangedWeapon?.notes || ''}</em><br>
            <strong>Mêlée:</strong> ${model.ccWeapon?.name || '–'}<br>
            <em>${model.ccWeapon?.notes || ''}</em>
          </div>`;
      } else {
        front.innerHTML = `
          <h2>${name}</h2>
          <div class="stats">
            <strong>Stats :</strong><br>
            SPD: ${model.speed?.name} | DEF: ${model.defense?.name} | MGT: ${model.might?.name || '-'} | WIL: ${model.willpower?.name}
          </div>
          <div class="weapons">
            ${(model.Weapons || []).map(w => `
              <strong>${w.name}</strong> (${w.type})<br>
              <em>${(w.properties || []).join(', ')} / ${(w.maneuvers || []).join(', ')}</em>
            `).join('<br>')}
          </div>`;
      }

      container.appendChild(front);

      const back = document.createElement('div');
      back.className = 'card';
      let rules = '';

      if (model.leaderTrait) {
        rules += `<em>${model.leaderTrait.name}</em>: ${model.leaderTrait.power}<br>`;
      }
      if (model.equipment?.name && model.equipment.name !== 'none') {
        rules += `${model.equipment.name}: ${model.equipment.effect}<br>`;
      }
      if (model.equipment2?.name && model.equipment2.name !== 'none') {
        rules += `${model.equipment2.name}: ${model.equipment2.effect}<br>`;
      }
      if (game === 'sword') {
        if (model.class) {
          rules += `<strong>${model.class.name}</strong>: ${model.class.notes}<br>`;
        }
        if (model.class2 && model.class2.name !== 'None') {
          rules += `<strong>${model.class2.name}</strong>: ${model.class2.notes}<br>`;
        }
      }

      back.innerHTML = `
        <h2>${name}</h2>
        <div class="rules">
          <strong>Règles spéciales :</strong><br>
          ${rules}
        </div>`;
      container.appendChild(back);

      if (model.spells && model.spells.length) {
        model.spells.forEach(spell => {
          const spellCard = document.createElement('div');
          spellCard.className = 'card';
          spellCard.innerHTML = `
            <h2>${name} – Sort</h2>
            <div class="spells">
              <strong>${spell.name}</strong><br>
              <em>${spell.notes}</em><br>
              Points: ${spell.point || 0}
            </div>`;
          container.appendChild(spellCard);
        });
      }
    });
  };
  reader.readAsText(fileInput.files[0]);
});
