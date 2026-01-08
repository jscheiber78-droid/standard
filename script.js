document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('age-calculator-form');
    const resultsSection = document.getElementById('results');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateBiologicalAge();
    });
});

function calculateBiologicalAge() {
    // Get form values
    const chronologicalAge = parseInt(document.getElementById('chronological-age').value);
    const exercise = parseInt(document.getElementById('exercise').value);
    const diet = parseInt(document.getElementById('diet').value);
    const sleep = parseInt(document.getElementById('sleep').value);
    const stress = parseInt(document.getElementById('stress').value);
    const smoking = parseInt(document.getElementById('smoking').value);
    const alcohol = parseInt(document.getElementById('alcohol').value);
    const bmi = parseInt(document.getElementById('bmi').value);
    const social = parseInt(document.getElementById('social').value);

    // Calculate lifestyle score (0-40 range)
    const lifestyleScore = exercise + diet + sleep + stress + smoking + alcohol + bmi + social;
    const maxScore = 40; // Maximum possible score (8 factors × 5 points each)

    // Convert lifestyle score to age modifier
    // Perfect score (40): -10 years
    // Average score (20): 0 years
    // Poor score (0): +15 years
    const scorePercentage = lifestyleScore / maxScore;

    let ageModifier;
    if (scorePercentage >= 0.75) {
        // Excellent lifestyle: reduce age by 5-10 years
        ageModifier = -10 + ((1 - scorePercentage) * 20);
    } else if (scorePercentage >= 0.5) {
        // Good lifestyle: reduce age by 0-5 years
        ageModifier = -5 + ((0.75 - scorePercentage) * 20);
    } else if (scorePercentage >= 0.25) {
        // Fair lifestyle: increase age by 0-8 years
        ageModifier = ((0.5 - scorePercentage) * 32);
    } else {
        // Poor lifestyle: increase age by 8-15 years
        ageModifier = 8 + ((0.25 - scorePercentage) * 28);
    }

    // Calculate biological age
    let biologicalAge = Math.round(chronologicalAge + ageModifier);

    // Ensure biological age is within reasonable bounds
    biologicalAge = Math.max(18, Math.min(120, biologicalAge));

    // Display results
    displayResults(chronologicalAge, biologicalAge, lifestyleScore, maxScore);
}

function displayResults(chronologicalAge, biologicalAge, lifestyleScore, maxScore) {
    const ageDifference = biologicalAge - chronologicalAge;

    // Update result values
    document.getElementById('chrono-age').textContent = chronologicalAge;
    document.getElementById('bio-age').textContent = biologicalAge;

    const ageDiffElement = document.getElementById('age-diff');
    if (ageDifference > 0) {
        ageDiffElement.textContent = `+${ageDifference} years`;
        ageDiffElement.style.color = '#f44336';
    } else if (ageDifference < 0) {
        ageDiffElement.textContent = `${ageDifference} years`;
        ageDiffElement.style.color = '#4CAF50';
    } else {
        ageDiffElement.textContent = 'Same';
        ageDiffElement.style.color = '#2196F3';
    }

    // Display result message
    const resultMessage = document.getElementById('result-message');
    if (ageDifference < -3) {
        resultMessage.className = 'result-message younger';
        resultMessage.textContent = `Great news! Your biological age is ${Math.abs(ageDifference)} years younger than your chronological age. Your healthy lifestyle is paying off!`;
    } else if (ageDifference > 3) {
        resultMessage.className = 'result-message older';
        resultMessage.textContent = `Your biological age is ${ageDifference} years older than your chronological age. There's room for improvement in your lifestyle habits.`;
    } else {
        resultMessage.className = 'result-message same';
        resultMessage.textContent = `Your biological age matches your chronological age. You're maintaining a balanced lifestyle!`;
    }

    // Generate recommendations
    generateRecommendations(lifestyleScore, maxScore);

    // Show results section
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('hidden');

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function generateRecommendations(lifestyleScore, maxScore) {
    const recommendationsDiv = document.getElementById('recommendations');
    const scorePercentage = (lifestyleScore / maxScore) * 100;

    let recommendations = [];

    // Get individual factor scores
    const exercise = parseInt(document.getElementById('exercise').value);
    const diet = parseInt(document.getElementById('diet').value);
    const sleep = parseInt(document.getElementById('sleep').value);
    const stress = parseInt(document.getElementById('stress').value);
    const smoking = parseInt(document.getElementById('smoking').value);
    const alcohol = parseInt(document.getElementById('alcohol').value);
    const bmi = parseInt(document.getElementById('bmi').value);
    const social = parseInt(document.getElementById('social').value);

    // Generate specific recommendations based on weak areas
    if (exercise < 3) {
        recommendations.push('Increase physical activity to at least 150 minutes of moderate exercise per week');
    }

    if (diet < 3) {
        recommendations.push('Improve diet quality by incorporating more whole foods, fruits, and vegetables');
    }

    if (sleep < 3) {
        recommendations.push('Prioritize 7-9 hours of quality sleep each night for optimal health');
    }

    if (stress < 3) {
        recommendations.push('Practice stress management techniques like meditation, yoga, or deep breathing');
    }

    if (smoking < 3) {
        recommendations.push('Consider smoking cessation programs to improve overall health');
    }

    if (alcohol < 3) {
        recommendations.push('Reduce alcohol consumption to moderate levels or consider abstaining');
    }

    if (bmi < 3) {
        recommendations.push('Work towards achieving a healthy body weight through balanced diet and exercise');
    }

    if (social < 3) {
        recommendations.push('Strengthen social connections through regular interaction with friends and family');
    }

    // If lifestyle is already good, provide maintenance tips
    if (scorePercentage >= 75) {
        recommendations = [
            'Maintain your excellent healthy habits',
            'Continue regular health check-ups',
            'Stay informed about new health research',
            'Consider becoming a health mentor for others'
        ];
    }

    // Display recommendations
    let html = '<h3>Recommendations to Improve Your Biological Age</h3><ul>';
    recommendations.forEach(rec => {
        html += `<li>${rec}</li>`;
    });
    html += '</ul>';

    recommendationsDiv.innerHTML = html;
}

function resetCalculator() {
    // Hide results
    document.getElementById('results').classList.add('hidden');

    // Reset form
    document.getElementById('age-calculator-form').reset();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
