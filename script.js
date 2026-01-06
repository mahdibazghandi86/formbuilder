const components = document.querySelectorAll('.component');
const dropZone = document.getElementById('drop-zone');

let componentId = 0;

components.forEach(c => {
  c.addEventListener('dragstart', e => {
    e.dataTransfer.setData('type', c.dataset.type);
  });
});

dropZone.addEventListener('dragover', e => e.preventDefault());

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  addComponent(e.dataTransfer.getData('type'));
});

function addComponent(type) {
  componentId++;

  const wrapper = document.createElement('div');
  wrapper.className = 'form-item';

  const title = document.createElement('input');
  title.className = 'form-title';
  title.placeholder = 'عنوان فیلد';
  wrapper.appendChild(title);

  if (type === 'text') {
    wrapper.innerHTML += `<input type="text" placeholder="متن...">`;
  }

  if (type === 'checkbox' || type === 'radio') {
    const optionsContainer = document.createElement('div');
    const groupName = `group_${componentId}`; // 👈 کلید حل مشکل

    const addBtn = document.createElement('button');
    addBtn.className = 'add-option';
    addBtn.innerText = '+ افزودن گزینه';

    addBtn.onclick = () => {
      const opt = document.createElement('div');
      opt.className = 'option';

      opt.innerHTML = `
        <input 
          type="${type}" 
          name="${type === 'radio' ? groupName : ''}"
        >
        <input type="text" placeholder="عنوان گزینه">
      `;

      optionsContainer.appendChild(opt);
    };

    wrapper.appendChild(optionsContainer);
    wrapper.appendChild(addBtn);

    addBtn.click(); // گزینه اولیه
  }

  dropZone.appendChild(wrapper);
}
