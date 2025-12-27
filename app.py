from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_plan', methods=['POST'])
def generate_plan():
    data = request.json
    subjects = data.get('subjects', [])
    hours_per_day = float(data.get('hours_per_day', 4))
    
    if not subjects:
        return jsonify({"error": "No subjects provided"}), 400

    today = datetime.now()
    processed_subjects = []
    total_priority_score = 0

    # 1. Calculate Priority Scores
    for sub in subjects:
        exam_date = datetime.strptime(sub['date'], '%Y-%m-%d')
        days_remaining = (exam_date - today).days
        
        # Ensure days_remaining is at least 1 to avoid division by zero
        days_remaining = max(1, days_remaining)
        
        # Priority Logic: Higher difficulty and closer dates increase the score
        # Difficulty is 1-5
        priority_score = (int(sub['difficulty']) * 10) / days_remaining
        
        processed_subjects.append({
            'name': sub['name'],
            'priority_score': priority_score,
            'days_left': days_remaining
        })
        total_priority_score += priority_score

    # 2. Allocate Hours
    # We generate a 7-day plan
    weekly_plan = []
    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for i in range(7):
        day_tasks = []
        for sub in processed_subjects:
            # Proportion of the daily hours based on subject weight
            allocated_time = (sub['priority_score'] / total_priority_score) * hours_per_day
            if allocated_time > 0.5:  # Only add if more than 30 mins
                day_tasks.append({
                    'subject': sub['name'],
                    'hours': round(allocated_time, 1)
                })
        
        weekly_plan.append({
            'day': days_of_week[i],
            'tasks': day_tasks
        })

    return jsonify(weekly_plan)

if __name__ == '__main__':
    app.run(debug=True)