document.addEventListener('DOMContentLoaded', () => {
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const generateBtn = document.getElementById('generateBtn');
    const subjectInputs = document.getElementById('subjectInputs');
    let totalTasks = 0;
    let completedTasks = 0;

    // Add new subject input row
    addSubjectBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'subject-row';
        row.innerHTML = `
            <input type="text" placeholder="Subject Name" class="sub-name">
            <input type="date" class="sub-date">
            <select class="sub-diff">
                <option value="1">Easy (1)</option>
                <option value="3" selected>Medium (3)</option>
                <option value="5">Hard (5)</option>
            </select>
        `;
        subjectInputs.appendChild(row);
    });

    // Send data to backend and render schedule
    generateBtn.addEventListener('click', async () => {
        const subjects = [];
        document.querySelectorAll('.subject-row').forEach(row => {
            const name = row.querySelector('.sub-name').value;
            const date = row.querySelector('.sub-date').value;
            const difficulty = row.querySelector('.sub-diff').value;
            if (name && date) subjects.push({ name, date, difficulty });
        });

        const hours = document.getElementById('dailyHours').value;

        const response = await fetch('/generate_plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjects, hours_per_day: hours })
        });

        const plan = await response.json();
        renderSchedule(plan);
    });

    function renderSchedule(plan) {
        const grid = document.getElementById('scheduleGrid');
        const resultSection = document.getElementById('resultSection');
        grid.innerHTML = '';
        resultSection.classList.remove('hidden');
        
        totalTasks = 0;
        completedTasks = 0;

        plan.forEach(dayPlan => {
            const card = document.createElement('div');
            card.className = 'day-card';
            let tasksHtml = `<h4>${dayPlan.day}</h4>`;
            
            dayPlan.tasks.forEach(task => {
                totalTasks++;
                tasksHtml += `
                    <div class="task-item">
                        <input type="checkbox" class="task-check" onchange="updateProgress(this)">
                        <span><strong>${task.subject}</strong>: ${task.hours} hrs</span>
                    </div>
                `;
            });

            card.innerHTML = tasksHtml;
            grid.appendChild(card);
        });
        updateProgressBar();
    }

    window.updateProgress = (checkbox) => {
        if (checkbox.checked) completedTasks++;
        else completedTasks--;
        updateProgressBar();
    };

    function updateProgressBar() {
        const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressText').innerText = `${percent}% Completed`;
    }
});