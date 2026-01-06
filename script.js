const canvas = document.getElementById('canvas');
//این خط داره میگه که این بوم نقاشی توعه که توش باید کاراتو بکنی
let componentId = 0;
//برای جدا سازی هر کامپوننت
let draggedItem = null;
//این میگه ایا این کامپوننت رو پرفتی یا نه

/* ---------- DRAG FROM TOOLBAR ---------- */


document.querySelectorAll('.top-bar button').forEach(btn => {
  btn.addEventListener('dragstart', e => {
    e.dataTransfer.setData('component-type', btn.dataset.type);
    e.dataTransfer.setData('source', 'toolbar');
  });
});




/* ---------- DROP ON CANVAS ---------- */



canvas.addEventListener('dragover', e => {
  e.preventDefault();
  canvas.classList.add('drag-over');
});

canvas.addEventListener('dragleave', () => {
  canvas.classList.remove('drag-over');
});

canvas.addEventListener('drop', e => {
  e.preventDefault();
  canvas.classList.remove('drag-over');

  const source = e.dataTransfer.getData('source');
  if (source !== 'toolbar') return;

  const type = e.dataTransfer.getData('component-type');
  if (!type) return;

  addComponent(type);
});





/* ---------- ADD COMPONENT ---------- */



function addComponent(type, isInner = false) {
  componentId++;

  const wrapper = document.createElement('div');
  wrapper.className = 'form-item half';
  wrapper.draggable = true;

  /* snap */
  const snap = document.createElement('div');
  snap.className = 'snap-point';
  

  snap.onclick = () => {
    wrapper.classList.toggle('full');
    wrapper.classList.toggle('half');
  };
  wrapper.appendChild(snap);


  /* title */
  if (type !== 'group') {
    const title = document.createElement('input');
    title.className = 'form-title';
    title.placeholder = 'عنوان فیلد';
    wrapper.appendChild(title);
  }


  /* text */
  if (type === 'text') {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'متن...';
    wrapper.appendChild(input);
  }

  /* checkbox / radio */
  if (type === 'checkbox' || type === 'radio') {
    const groupName = `group_${componentId}`;
    const options = document.createElement('div');
    options.className = 'options';

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'addbtn';
    addBtn.textContent = '+ افزودن گزینه';

    addBtn.onclick = () => {
      const opt = document.createElement('div');
      opt.className = 'option';
      opt.innerHTML = `
                <input type="${type}" ${type === 'radio' ? `name="${groupName}"` : ''}>
                <input type="text" placeholder="عنوان گزینه">
            `;
      options.appendChild(opt);
    };

    wrapper.appendChild(options);
    wrapper.appendChild(addBtn);
    addBtn.click();
  }



  /*===== number =====*/



  if (type == 'number') {
    const numberInputDiv = document.createElement('div');
    numberInputDiv.className = 'number';
    wrapper.appendChild(numberInputDiv);

    const numberInput = document.createElement('div');
    numberInput.innerHTML = `<input type="${type}" placeholder="عدد">`;

    numberInputDiv.appendChild(numberInput);




  }



  /*===== Date and Time =====*/

  if (type == 'DateAndTime') {
    const box = document.createElement('div');
    box.className = 'date-time-switch';

    const buttons = document.createElement('div');
    buttons.className = 'switch-buttons';

    const dateBtn = document.createElement('button');
    dateBtn.type = 'button';
    dateBtn.textContent = 'تاریخ';
    dateBtn.id='DateBtn';

    const timeBtn = document.createElement('button');
    timeBtn.type = 'button';
    timeBtn.textContent = 'ساعت';
    timeBtn.id ='TimeBtn';

    buttons.appendChild(dateBtn);
    buttons.appendChild(timeBtn);

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    const now = new Date();
    dateInput.value = now.toISOString().split('T')[0];

    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.style.display = 'none';

    // رفتار دکمه‌ها
    dateBtn.onclick = () => {
      const now = new Date();
      dateInput.value = now.toISOString().split('T')[0];

      dateInput.style.display = 'block';
      timeInput.style.display = 'none';

      dateBtn.classList.add('active');
      timeBtn.classList.remove('active');
    };

    timeBtn.onclick = () => {
      const now = new Date();
      timeInput.value = now.toTimeString().slice(0, 5);

      timeInput.style.display = 'block';
      dateInput.style.display = 'none';

      timeBtn.classList.add('active');
      dateBtn.classList.remove('active');
    };


    dateBtn.classList.add('active');

    box.appendChild(buttons);
    box.appendChild(dateInput);
    box.appendChild(timeInput);

    wrapper.appendChild(box);
  }






  if (type === 'group') {

    wrapper.classList.add('group-item');

    // title
    if (type === 'group') {
      const title = document.createElement('input');
      title.className = 'form-title';
      title.placeholder = 'عنوان گروه';
      wrapper.appendChild(title);
    }


    // inner container
    const inner = document.createElement('div');
    inner.className = 'group-canvas';
    wrapper.appendChild(inner);

    // allow drop inside group
    inner.addEventListener('dragover', e => {
      e.preventDefault();
      inner.classList.add('drag-over');
    });

    inner.addEventListener('dragleave', () => {
      inner.classList.remove('drag-over');
    });

    inner.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation(); // 🔥 خیلی مهم
      inner.classList.remove('drag-over');

      const source = e.dataTransfer.getData('source');
      if (source !== 'toolbar') return;

      const type = e.dataTransfer.getData('component-type');
      if (!type || type === 'group') return;

      const child = addComponent(type, true);
      inner.appendChild(child);
    });

  }


  /* reorder drag */
  wrapper.addEventListener('dragstart', () => {
    draggedItem = wrapper;
    setTimeout(() => wrapper.classList.add('dragging'), 0);
  });

  wrapper.addEventListener('dragend', () => {
    draggedItem = null;
    wrapper.classList.remove('dragging');
  });

  /*delete button*/
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-bottom';
  removeBtn.textContent = 'حذف';
  removeBtn.onclick = () => wrapper.remove();

  wrapper.appendChild(removeBtn);

  if (!isInner) canvas.appendChild(wrapper);
  return wrapper;

}




/* ---------- REORDER LOGIC ---------- */




canvas.addEventListener('dragover', e => {
  e.preventDefault();
  if (!draggedItem) return;

  const after = getDragAfterElement(canvas, e.clientY);
  if (!after) canvas.appendChild(draggedItem);
  else canvas.insertBefore(draggedItem, after);
});

function getDragAfterElement(container, y) {
  const items = [...container.querySelectorAll('.form-item:not(.dragging)')];
  return items.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }
    return closest;
  }, { offset: -Infinity }).element;
}


// ===== Delete all button =====


const DeleteAllBtn = document.getElementById('DeleteAllBtn');
DeleteAllBtn.onclick = () => {
  canvas.innerHTML = "";
}


const JSONBtn = document.getElementById('JSONBtn');
JSONBtn.onclick = () => {
  console.log(canvas.children.input.value);
}

