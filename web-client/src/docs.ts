import {marked} from "marked";
import aliasesMd from "../../docs/ALIASES.md?raw";
import bagManagerMd from "../../docs/BAG_MANAGER.md?raw";

interface DocDef { key: string; title: string; md: string; }
const docs: DocDef[] = [
    { key: 'aliases', title: 'Aliasy', md: aliasesMd },
    { key: 'bag', title: 'Mened\u017cer pojemnik\u00f3w', md: bagManagerMd },
];

function createModal() {
    const modal = document.createElement('div');
    modal.id = 'docs-modal';
    modal.className = 'hidden';
    modal.innerHTML = `
<div class="docs-modal-content">
  <div class="docs-nav">
    ${docs.map(d => `<button data-key="${d.key}">${d.title}</button>`).join('')}
    <button id="docs-close">X</button>
  </div>
  <div id="docs-content" class="docs-content"></div>
</div>`;
    document.body.appendChild(modal);
    return modal;
}

function initDocs() {
    const docsButton = document.getElementById('docs-button') as HTMLButtonElement | null;
    if (!docsButton) return;

    const modal = createModal();
    const content = modal.querySelector('#docs-content') as HTMLElement;
    const closeBtn = modal.querySelector('#docs-close') as HTMLButtonElement;
    const navButtons = Array.from(modal.querySelectorAll('.docs-nav button[data-key]')) as HTMLButtonElement[];

    async function showDoc(key: string) {
        const doc = docs.find(d => d.key === key);
        if (!doc) return;
        const html = await marked.parse(doc.md);
        content.innerHTML = html as string;
        modal.classList.remove('hidden');
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => showDoc(btn.dataset.key!));
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    docsButton.addEventListener('click', () => showDoc(docs[0].key));
}

document.addEventListener('DOMContentLoaded', initDocs);
