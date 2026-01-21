const API_URL = '/whatsapp';
let currentSessionId = null;
let qrRefreshInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    refreshSessions();
    // Auto-refresh sessions every 5 seconds
    setInterval(refreshSessions, 5000);
});

/**
 * Create a new WhatsApp session
 */
async function createSession() {
    const sessionId = document.getElementById('sessionId').value.trim();
    const statusDiv = document.getElementById('createStatus');

    if (!sessionId) {
        showStatus(statusDiv, 'Please enter a session name', 'error');
        return;
    }

    try {
        showStatus(statusDiv, 'Creating session...', 'info');
        
        const response = await fetch(`${API_URL}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });

        const data = await response.json();

        if (response.ok) {
            showStatus(statusDiv, `✅ Session created! Scan the QR code to authenticate.`, 'success');
            document.getElementById('sessionId').value = '';
            currentSessionId = sessionId;
            
            // Show QR code
            setTimeout(() => {
                displayQRCode(sessionId);
            }, 1000);
            
            // Refresh sessions list
            setTimeout(refreshSessions, 2000);
        } else {
            showStatus(statusDiv, `❌ Error: ${data.message || 'Failed to create session'}`, 'error');
        }
    } catch (error) {
        showStatus(statusDiv, `❌ Error: ${error.message}`, 'error');
        console.error('Error creating session:', error);
    }
}

/**
 * Display QR code for session authentication
 */
async function displayQRCode(sessionId) {
    const qrCard = document.getElementById('qrCard');
    const qrContainer = document.getElementById('qrContainer');
    const qrImage = document.getElementById('qrImage');
    const qrLoading = document.getElementById('qrLoading');
    const qrSessionName = document.getElementById('qrSessionName');

    qrCard.style.display = 'block';
    qrLoading.style.display = 'flex';
    qrImage.style.display = 'none';
    qrSessionName.textContent = `Session: ${sessionId}`;

    try {
        const response = await fetch(`${API_URL}/sessions/${sessionId}/qr`);
        
        if (response.ok) {
            const data = await response.json();
            qrImage.src = data.qrCode;
            qrImage.style.display = 'block';
            qrLoading.style.display = 'none';

            // Poll for connection status
            pollConnectionStatus(sessionId);
        } else {
            qrLoading.innerHTML = '<p>Failed to load QR code. Please try again.</p>';
        }
    } catch (error) {
        qrLoading.innerHTML = `<p>Error loading QR code: ${error.message}</p>`;
        console.error('Error fetching QR code:', error);
    }
}

/**
 * Poll for connection status
 */
function pollConnectionStatus(sessionId) {
    if (qrRefreshInterval) {
        clearInterval(qrRefreshInterval);
    }

    qrRefreshInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_URL}/sessions/${sessionId}/status`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.status === 'authenticated') {
                    clearInterval(qrRefreshInterval);
                    const qrLoading = document.getElementById('qrLoading');
                    qrLoading.innerHTML = `
                        <div style="color: #28a745; text-align: center;">
                            <h3>✅ Connected Successfully!</h3>
                            <p>Your WhatsApp session is now active.</p>
                        </div>
                    `;
                    
                    setTimeout(() => {
                        closeQRDisplay();
                        refreshSessions();
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Error checking connection status:', error);
        }
    }, 2000);
}

/**
 * Refresh sessions list
 */
async function refreshSessions() {
    const sessionsList = document.getElementById('sessionsList');

    try {
        const response = await fetch(`${API_URL}/sessions`);
        
        if (response.ok) {
            const data = await response.json();
            const sessions = data.sessions || [];

            if (sessions.length === 0) {
                sessionsList.innerHTML = '<p class="empty-state">No active sessions. Create one to get started!</p>';
                return;
            }

            sessionsList.innerHTML = sessions.map(session => `
                <div class="session-item">
                    <div class="session-info">
                        <h3>📱 ${session.sessionId}</h3>
                        <p>Status: <span class="session-status ${getStatusClass(session.status)}">${formatStatus(session.status)}</span></p>
                    </div>
                    <div class="session-actions">
                        <button class="btn btn-secondary" onclick="viewSessionDetails('${session.sessionId}')" style="padding: 8px 12px; font-size: 0.85em; margin: 0;">View</button>
                        <button class="btn btn-danger" onclick="deleteSession('${session.sessionId}')" style="padding: 8px 12px; font-size: 0.85em; margin: 0;">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            sessionsList.innerHTML = '<p class="empty-state">Failed to load sessions</p>';
        }
    } catch (error) {
        sessionsList.innerHTML = '<p class="empty-state">Error loading sessions</p>';
        console.error('Error fetching sessions:', error);
    }
}

/**
 * View session details
 */
async function viewSessionDetails(sessionId) {
    const detailsCard = document.getElementById('sessionDetailsCard');
    const detailsContent = document.getElementById('sessionDetails');

    try {
        const response = await fetch(`${API_URL}/sessions/${sessionId}/status`);
        
        if (response.ok) {
            const data = await response.json();
            
            detailsContent.innerHTML = `
                <div class="detail-row">
                    <label>Session ID:</label>
                    <span>${data.sessionId || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <label>Status:</label>
                    <span class="session-status ${getStatusClass(data.status)}">${formatStatus(data.status)}</span>
                </div>
                <div class="detail-row">
                    <label>Phone Number:</label>
                    <span>${data.phoneNumber || 'Not connected yet'}</span>
                </div>
                <div class="detail-row">
                    <label>Chat Count:</label>
                    <span>${data.chatCount || '0'}</span>
                </div>
                <div class="detail-row">
                    <label>Connected At:</label>
                    <span>${data.connectedAt ? new Date(data.connectedAt).toLocaleString() : 'N/A'}</span>
                </div>
            `;
            
            detailsCard.style.display = 'block';
        } else {
            alert('Failed to load session details');
        }
    } catch (error) {
        alert('Error loading session details: ' + error.message);
        console.error('Error fetching session details:', error);
    }
}

/**
 * Delete a session
 */
async function deleteSession(sessionId) {
    if (!confirm(`Are you sure you want to delete the session "${sessionId}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showStatus(document.getElementById('createStatus'), '✅ Session deleted successfully', 'success');
            refreshSessions();
        } else {
            showStatus(document.getElementById('createStatus'), '❌ Failed to delete session', 'error');
        }
    } catch (error) {
        showStatus(document.getElementById('createStatus'), `❌ Error: ${error.message}`, 'error');
        console.error('Error deleting session:', error);
    }
}

/**
 * Close QR code display
 */
function closeQRDisplay() {
    if (qrRefreshInterval) {
        clearInterval(qrRefreshInterval);
    }
    document.getElementById('qrCard').style.display = 'none';
}

/**
 * Close session details
 */
function closeSessionDetails() {
    document.getElementById('sessionDetailsCard').style.display = 'none';
}

/**
 * Show status message
 */
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `status-message show ${type}`;
    
    if (type !== 'info') {
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }
}

/**
 * Get status class for styling
 */
function getStatusClass(status) {
    switch (status) {
        case 'authenticated':
        case 'connected':
            return 'connected';
        case 'disconnected':
        case 'loading':
        case 'initializing':
            return 'disconnected';
        case 'pending':
        case 'waiting':
            return 'pending';
        default:
            return 'disconnected';
    }
}

/**
 * Format status text
 */
function formatStatus(status) {
    const statusMap = {
        'authenticated': '✅ Connected',
        'connected': '✅ Connected',
        'disconnected': '❌ Disconnected',
        'loading': '⏳ Loading',
        'initializing': '⏳ Initializing',
        'pending': '⏳ Pending',
        'waiting': '⏳ Waiting for scan'
    };
    
    return statusMap[status] || status;
}
