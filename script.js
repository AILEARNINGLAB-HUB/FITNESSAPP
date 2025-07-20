let userGoal;

document.getElementById('goal-form').addEventListener('submit', function(event) {
    event.preventDefault();
    userGoal = document.getElementById('goal').value;
    console.log('User goal:', userGoal);
    alert('Your goal has been set to: ' + userGoal);
});

document.getElementById('generate-workout').addEventListener('click', function() {
    if (!userGoal) {
        alert('Please set your goal first!');
        return;
    }

    const workoutOutput = document.getElementById('workout-output');
    let workoutPlan = '';

    switch (userGoal) {
        case 'lose-weight':
            workoutPlan = `
                <h3>Workout Plan for Losing Weight</h3>
                <ul>
                    <li>Monday: Cardio (30 minutes)</li>
                    <li>Tuesday: Full Body Strength Training</li>
                    <li>Wednesday: Cardio (30 minutes)</li>
                    <li>Thursday: Full Body Strength Training</li>
                    <li>Friday: Cardio (30 minutes)</li>
                    <li>Saturday: Rest</li>
                    <li>Sunday: Rest</li>
                </ul>
            `;
            break;
        case 'gain-muscle':
            workoutPlan = `
                <h3>Workout Plan for Gaining Muscle</h3>
                <ul>
                    <li>Monday: Chest and Triceps</li>
                    <li>Tuesday: Back and Biceps</li>
                    <li>Wednesday: Legs</li>
                    <li>Thursday: Shoulders and Abs</li>
                    <li>Friday: Full Body Strength Training</li>
                    <li>Saturday: Rest</li>
                    <li>Sunday: Rest</li>
                </ul>
            `;
            break;
        case 'improve-fitness':
            workoutPlan = `
                <h3>Workout Plan for Improving Fitness</h3>
                <ul>
                    <li>Monday: High-Intensity Interval Training (HIIT)</li>
                    <li>Tuesday: Yoga or Stretching</li>
                    <li>Wednesday: High-Intensity Interval Training (HIIT)</li>
                    <li>Thursday: Active Recovery (e.g., light walk, swimming)</li>
                    <li>Friday: High-Intensity Interval Training (HIIT)</li>
                    <li>Saturday: Rest</li>
                    <li>Sunday: Rest</li>
                </ul>
            `;
            break;
    }

    workoutOutput.innerHTML = workoutPlan;
});

document.getElementById('generate-eating-guide').addEventListener('click', function() {
    if (!userGoal) {
        alert('Please set your goal first!');
        return;
    }

    const eatingGuideOutput = document.getElementById('eating-guide-output');
    let eatingGuide = '';

    switch (userGoal) {
        case 'lose-weight':
            eatingGuide = `
                <h3>Eating Guide for Losing Weight</h3>
                <ul>
                    <li>Breakfast: Oatmeal with berries</li>
                    <li>Lunch: Grilled chicken salad</li>
                    <li>Dinner: Salmon with roasted vegetables</li>
                    <li>Snacks: Greek yogurt, almonds</li>
                </ul>
            `;
            break;
        case 'gain-muscle':
            eatingGuide = `
                <h3>Eating Guide for Gaining Muscle</h3>
                <ul>
                    <li>Breakfast: Scrambled eggs with spinach and whole wheat toast</li>
                    <li>Lunch: Lean beef with quinoa and broccoli</li>
                    <li>Dinner: Chicken breast with sweet potato and asparagus</li>
                    <li>Snacks: Protein shake, cottage cheese</li>
                </ul>
            `;
            break;
        case 'improve-fitness':
            eatingGuide = `
                <h3>Eating Guide for Improving Fitness</h3>
                <ul>
                    <li>Breakfast: Smoothie with fruits, vegetables, and protein powder</li>
                    <li>Lunch: Turkey wrap with whole wheat tortilla</li>
                    <li>Dinner: Baked tilapia with brown rice and mixed greens</li>
                    <li>Snacks: Apple with peanut butter, hard-boiled eggs</li>
                </ul>
            `;
            break;
    }

    eatingGuideOutput.innerHTML = eatingGuide;
});
