// recipes.js
async function loadRecipes() {
  const res = await fetch('recipes_starter.json');
  const data = await res.json();
  window.ALL_RECIPES = data;
  renderRecipes(data);
  buildTagCloud(data);
}

function renderRecipes(list) {
  const wrap = document.getElementById('recipes');
  const count = document.getElementById('count');
  wrap.innerHTML = '';
  count.textContent = list.length + ' recipes';
  list.forEach(r => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h3>${r.title}</h3>
      <p class="summary">${r.summary || ''}</p>
      <p class="meta">⏱ ${r.time_total_min} min • ${r.servings} servings • ${r.difficulty}</p>
      <p class="appliances">${(r.appliances||[]).join(' • ')}</p>
      <details>
        <summary>Ingredients</summary>
        <ul>${r.ingredients.map(i=>`<li>${i}</li>`).join('')}</ul>
      </details>
      <details>
        <summary>Instructions</summary>
        <ol>${r.instructions.map(i=>`<li>${i}</li>`).join('')}</ol>
      </details>
      <p class="tags">${(r.tags||[]).map(t=>`<button class="tag" data-tag="${t}">${t}</button>`).join(' ')}</p>
    `;
    wrap.appendChild(card);
  });

  // tag buttons
  wrap.querySelectorAll('button.tag').forEach(btn=>{
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      const q = document.getElementById('search').value.toLowerCase();
      filterRecipes(q, [tag]);
      highlightActiveTag(tag);
    });
  });
}

function buildTagCloud(data){
  const allTags = new Set();
  data.forEach(r => (r.tags||[]).forEach(t => allTags.add(t)));
  const cloud = document.getElementById('tag-cloud');
  cloud.innerHTML = '';
  Array.from(allTags).sort().forEach(t=>{
    const b = document.createElement('button');
    b.className = 'tag';
    b.dataset.tag = t;
    b.textContent = t;
    b.addEventListener('click', ()=>{
      const q = document.getElementById('search').value.toLowerCase();
      filterRecipes(q, [t]);
      highlightActiveTag(t);
    });
    cloud.appendChild(b);
  });
}

function highlightActiveTag(tag){
  document.querySelectorAll('#tag-cloud .tag').forEach(b=>{
    b.classList.toggle('active', b.dataset.tag === tag);
  });
}

function filterRecipes(query, tags){
  let list = window.ALL_RECIPES || [];
  if (query) {
    list = list.filter(r => (
      r.title.toLowerCase().includes(query) ||
      (r.summary||'').toLowerCase().includes(query) ||
      (r.ingredients||[]).join(' ').toLowerCase().includes(query)
    ));
  }
  if (tags && tags.length){
    list = list.filter(r => (r.tags||[]).some(t => tags.includes(t)));
  }
  renderRecipes(list);
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadRecipes();
  document.getElementById('search').addEventListener('input', (e)=>{
    filterRecipes(e.target.value.toLowerCase(), getActiveTags());
  });
});

function getActiveTags(){
  const active = [];
  document.querySelectorAll('#tag-cloud .tag.active').forEach(b=>active.push(b.dataset.tag));
  return active;
}
