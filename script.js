document.addEventListener('DOMContentLoaded', () => {
    const greeting = document.getElementById('greeting');
    greeting.textContent = "Welcome back! 🚀";
  
    const widgets = document.getElementById('widgets');
    const navButtons = document.querySelectorAll('.sidebar nav button');
    navButtons.forEach(btn =>
      btn.addEventListener('click', () => loadWidget(btn.dataset.widget))
    );
  
    loadWidget('planner');
  
    function loadWidget(name) {
      let html = '';
      switch (name) {
        case 'planner':
          html = `
            <div class="widget">
              <h2>Planner</h2>
              <input type="text" id="task-title" placeholder="Task title">
              <input type="date" id="task-date">
              <select id="task-priority">
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
              <button id="add-task">Add Task</button>
              <div class="filters">
                <button data-filter="all" class="active">All</button>
                <button data-filter="active">Active</button>
                <button data-filter="done">Done</button>
              </div>
              <ul id="task-list"></ul>
            </div>`;
          break;
  
        case 'habits':
          html = `
            <div class="widget">
              <h2>Habit Tracker</h2>
              <input type="text" id="habit-name" placeholder="Habit name">
              <button id="create-habit">Start Habit</button>
              <div id="habit-grid"></div>
            </div>`;
          break;
  
        case 'goals':
          html = `
            <div class="widget">
              <h2>Goals</h2>
              <input type="text" id="goal-name" placeholder="Goal name">
              <input type="number" id="goal-target" placeholder="Target value">
              <button id="create-goal">Add Goal</button>
              <div id="goal-list"></div>
            </div>`;
          break;
  
        case 'notes':
          html = `
            <div class="widget">
              <h2>Notes</h2>
              <textarea id="note-text" placeholder="New note"></textarea>
              <button id="save-note">Save Note</button>
              <div id="note-list"></div>
            </div>`;
          break;
  
        case 'focus':
          html = `
            <div class="widget">
              <h2>Focus Timer</h2>
              <h3 id="focus-time">25:00</h3>
              <button id="focus-start">Start</button>
              <button id="focus-reset">Reset</button>
            </div>`;
          break;
      }
      widgets.innerHTML = html;
      attachEvents(name);
    }
  
    function attachEvents(name) {
      if (name === 'planner') {
        let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        let currentFilter = 'all';
  
        const save = () => localStorage.setItem('tasks', JSON.stringify(tasks));
        const render = () => {
          const list = document.getElementById('task-list');
          list.innerHTML = '';
          tasks.filter(t => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'active') return !t.done;
            if (currentFilter === 'done') return t.done;
          }).forEach((t, i) => {
            const li = document.createElement('li');
            li.className = 'task-item' + (t.done ? ' done' : '');
            li.innerHTML = `
              <span><strong>${t.title}</strong> [${t.priority}] (${t.date})</span>
              <div><button class="done-btn">${t.done ? 'Undo' : 'Done'}</button>
              <button class="delete-btn">🗑️</button></div>`;
            li.querySelector('.done-btn').onclick = () => { t.done = !t.done; save(); render(); };
            li.querySelector('.delete-btn').onclick = () => { tasks.splice(i, 1); save(); render(); };
            list.appendChild(li);
          });
        };
        document.getElementById('add-task').onclick = () => {
          const title = document.getElementById('task-title').value.trim();
          const date = document.getElementById('task-date').value;
          const priority = document.getElementById('task-priority').value;
          if (title && date) {
            tasks.push({ title, date, priority, done: false });
            save(); render();
          }
        };
        document.querySelectorAll('.filters button').forEach(b => b.onclick = () => {
          document.querySelectorAll('.filters button').forEach(x => x.classList.remove('active'));
          b.classList.add('active'); currentFilter = b.dataset.filter; render();
        });
        render();
      }
  
      if (name === 'habits') {
        let habitName = '';
        const grid = document.getElementById('habit-grid');
        const days = 30;
        const states = JSON.parse(localStorage.getItem('habits') || '{}');
        document.getElementById('create-habit').onclick = () => {
          habitName = document.getElementById('habit-name').value.trim();
          if (!habitName) return;
          grid.innerHTML = '';
          const arr = states[habitName] || Array(days).fill(0);
          arr.forEach((v, i) => {
            const box = document.createElement('div');
            if (v) box.classList.add('active');
            box.onclick = () => { arr[i] = arr[i] ? 0 : 1; states[habitName] = arr; localStorage.setItem('habits', JSON.stringify(states)); box.classList.toggle('active'); };
            grid.appendChild(box);
          });
        };
      }
  
      if (name === 'goals') {
        const list = document.getElementById('goal-list');
        let goals = JSON.parse(localStorage.getItem('goals') || '[]');
        const save = () => localStorage.setItem('goals', JSON.stringify(goals));
        const render = () => {
          list.innerHTML = '';
          goals.forEach((g, i) => {
            const div = document.createElement('div');
            div.className = 'goal-item';
            div.innerHTML = `<strong>${g.name}</strong> ${g.current}/${g.target}
              <div class="goal-bar"><div class="goal-progress" style="width:${(g.current/g.target)*100}%"></div></div>
              <button class="add-progress">+10</button>`;
            div.querySelector('.add-progress').onclick = () => { g.current = Math.min(g.target, g.current+10); save(); render(); };
            list.appendChild(div);
          });
        };
        document.getElementById('create-goal').onclick = () => {
          const name = document.getElementById('goal-name').value.trim();
          const target = +document.getElementById('goal-target').value;
          if (name && target) { goals.push({ name, target, current: 0 }); save(); render(); }
        };
        render();
      }
  
      if (name === 'notes') {
        let notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const list = document.getElementById('note-list');
        const save = () => localStorage.setItem('notes', JSON.stringify(notes));
        const render = () => {
          list.innerHTML = '';
          notes.forEach((n, i) => {
            const div = document.createElement('div');
            div.className = 'note-item';
            div.innerHTML = `<span>${n}</span> <button class="delete-note">🗑️</button>`;
            div.querySelector('.delete-note').onclick = () => { notes.splice(i, 1); save(); render(); };
            list.appendChild(div);
          });
        };
        document.getElementById('save-note').onclick = () => {
          const text = document.getElementById('note-text').value.trim();
          if (text) { notes.push(text); save(); render(); document.getElementById('note-text').value = ''; }
        };
        render();
      }
  
      if (name === 'focus') {
        let time = 25 * 60, timerId = null;
        const display = document.getElementById('focus-time');
        const update = () => {
          const m = Math.floor(time/60); const s = time%60;
          display.textContent = `${m}:${s<10?'0':''}${s}`;
        };
        update();
        document.getElementById('focus-start').onclick = () => {
          if (timerId) return;
          timerId = setInterval(() => { if (time>0) { time--; update(); } else { clearInterval(timerId); alert('Time\'s up!'); } }, 1000);
        };
        document.getElementById('focus-reset').onclick = () => { clearInterval(timerId); timerId=null; time=25*60; update(); };
      }
    }
  });
  
