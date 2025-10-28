// Get necessary DOM elements
const form = document.getElementById('qr-form');
const qrImage = document.getElementById('qrcode-img');
const message = document.getElementById('message');
const errorMessage = document.getElementById('error-message');

// =================================================================
// === ⚠️ CRITICAL: UPDATE THESE PLACEHOLDERS WITH YOUR API DETAILS ===
// =================================================================
const API_BASE_URL = 'https://qrcode3.p.rapidapi.com/qrcode/text'; 
const API_KEY = '3451ab4391mshb33b42b40718a5fp186af6jsn81fc3033d58a'; // Replace with your actual key
const API_HOST = 'qrcode3.p.rapidapi.com';
// =================================================================

// Function to handle form submission and API call
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Stop the form from submitting normally

    errorMessage.textContent = ''; // Clear previous errors
    qrImage.style.display = 'none';
    message.textContent = 'Generating QR Code...';

    // 1. Get user input values
    const idValue = document.getElementById('ID').value.trim();
    const nameValue = document.getElementById('Name').value.trim();

    if (!idValue || !nameValue) {
        errorMessage.textContent = 'Please enter both ID and Name to generate the QR code.';
        message.textContent = 'Enter data and click "Generate QR Code"';
        return;
    }
    
    // The data string: This is the actual content that will be encoded in the QR code.
    const qrDataToEncode = JSON.stringify({
        "ID": idValue,
        "Name": nameValue,
        "hash": ""
    });

    // 2. Prepare the CORRECT payload object based on all 422 errors
    const payloadObject = {
        // REQUIRED FIELD: Must be called 'data'
        data: qrDataToEncode, 
        
        // REQUIRED FORMAT: Must be an object, but ONLY containing 'width'
        size: {
            width: 300 // Height field removed to fix "Extra inputs are not permitted" error
        }
    };

    // Convert the payload object to a JSON string for the request body
    const jsonBody = JSON.stringify(payloadObject);

    // 3. Setup and execute the XMLHttpRequest (XHR) with POST
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.open('POST', API_BASE_URL); 
    
    // Set headers
    xhr.setRequestHeader('x-rapidapi-key', API_KEY);
    xhr.setRequestHeader('x-rapidapi-host', API_HOST);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.responseType = 'blob'; // Expecting binary image data on success
    
    
    // Handle the response from the API
    xhr.onload = function () {
        if (this.readyState === this.DONE) {
            if (xhr.status === 200) {
                // SUCCESS: Should be an image (blob)
                if (xhr.response.type && xhr.response.type.includes('image')) {
                    const imageUrl = URL.createObjectURL(xhr.response);
                    qrImage.src = imageUrl;
                    qrImage.style.display = 'block';
                    message.textContent = 'QR Code Generated Successfully! ✅';
                } else {
                    errorMessage.textContent = 'Error: API returned a 200 status, but the response was not an image.';
                    message.textContent = 'Error.';
                }
            } else {
                // ERROR: Status is not 200. Read the error text using FileReader.
                const reader = new FileReader();
                reader.onloadend = function() {
                    let statusMessage = '';
                    if (xhr.status === 422) {
                        statusMessage = '422 Unprocessable Entity: Payload structure incorrect.';
                    } else if (xhr.status === 403) {
                        statusMessage = '403 Forbidden: Check your RapidAPI Key and Subscription.';
                    } else {
                        statusMessage = `Status ${xhr.status}.`;
                    }
                    
                    const errorResponseText = reader.result;
                    errorMessage.textContent = `API Request Failed: ${statusMessage}. Server Response: ${errorResponseText.substring(0, 150)}... 🛑`;
                    message.textContent = 'Error.';
                    console.error('API Request Failed:', errorResponseText);
                };
                
                reader.readAsText(xhr.response); 
            }
        }
    };

    xhr.onerror = function () {
        errorMessage.textContent = 'Network Error: Could not reach the API endpoint. Check your internet connection. 🌐';
        message.textContent = 'Error.';
        console.error('XHR Network Error');
    };

    // Send the POST request with the corrected JSON body
    xhr.send(jsonBody);
});
// Add this block to the end of your index.js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
