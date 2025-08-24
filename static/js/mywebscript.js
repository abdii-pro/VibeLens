document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the button
    document.getElementById('analyzeBtn').addEventListener('click', RunSentimentAnalysis);
    
    // Add event listener for Enter key in textarea
    document.getElementById('textToAnalyze').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            RunSentimentAnalysis();
        }
    });
});

let RunSentimentAnalysis = () => {
    let textToAnalyze = document.getElementById("textToAnalyze").value;
    
    if (!textToAnalyze.trim()) {
        showError("Please enter some text to analyze.");
        return;
    }
    
    // Show loading indicator
    document.getElementById("loadingIndicator").style.display = "block";
    document.getElementById("resultDetails").style.display = "none";
    
    // Make API call to Flask backend
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            // Hide loading indicator
            document.getElementById("loadingIndicator").style.display = "none";
            
            if (this.status == 200) {
                try {
                    // Parse the response
                    let response = JSON.parse(xhttp.responseText);
                    
                    if (response.error) {
                        showError(response.error);
                    } else {
                        displayResults(response);
                    }
                } catch (e) {
                    showError("Error parsing response: " + e.message);
                }
            } else {
                showError("Unable to analyze sentiment. Status code: " + this.status);
            }
        }
    };
    
    xhttp.open("GET", "/sentimentAnalyzer?textToAnalyze=" + encodeURIComponent(textToAnalyze), true);
    xhttp.send();
};

// Function to display results
function displayResults(response) {
    let sentiment = response.label;
    let score = response.score || 0.9;
    
    // Check if sentiment is defined
    if (!sentiment) {
        showError("No sentiment data received from server");
        return;
    }
    
    // Determine emoji based on sentiment
    let emoji;
    if (sentiment === 'POSITIVE') {
        emoji = '😊';
    } else if (sentiment === 'NEGATIVE') {
        emoji = '😞';
    } else {
        emoji = '😐';
    }
    
    // Set background based on sentiment
    const resultContainer = document.getElementById('system_response');
    resultContainer.className = 'result-container';
    if (sentiment === 'POSITIVE') {
        resultContainer.classList.add('positive-bg');
    } else if (sentiment === 'NEGATIVE') {
        resultContainer.classList.add('negative-bg');
    } else {
        resultContainer.classList.add('neutral-bg');
    }
    
    // Display results - FIXED: toLowerCase() instead of tolowerCase()
    let resultHTML = `
        <div class="text-center">
            <h3 class="sentiment-${sentiment.toLowerCase()}">
                <span class="emoji">${emoji}</span>
                ${sentiment}
            </h3>
            <p class="mb-0">The given text has been identified as <strong>${sentiment}</strong></p>
        </div>
    `;
    
    document.getElementById("system_response").innerHTML = resultHTML;
    
    // Show confidence score and progress bar
    document.getElementById("resultDetails").style.display = "block";
    document.getElementById("confidenceValue").textContent = score.toFixed(2)+"%";
    document.getElementById("scoreBar").style.width = `${score}%`;

    let bar = document.getElementById("scoreBar");
    bar.style.width = response.score.toFixed(2) + "%";
}

// Function to show error messages
function showError(message) {
    document.getElementById("system_response").innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle"></i> ${message}
        </div>
    `;
    document.getElementById("loadingIndicator").style.display = "none";
    document.getElementById("resultDetails").style.display = "none";
}