const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

const socket = io();
let myLocation = null;
let isAvailable = false;

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

function getMyLocation() {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({ longitude: position.coords.longitude, latitude: position.coords.latitude }),
            () => resolve({ longitude: 88.3639, latitude: 22.5726 })
        );
    });
}

async function toggleAvailability() {
    isAvailable = !isAvailable;
    myLocation = await getMyLocation();

    const res = await fetch('/api/driver/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authorization': token },
        body: JSON.stringify({ longitude: myLocation.longitude, latitude: myLocation.latitude, isAvailable })
    });
    const data = await res.json();

    if (data.success) {
        document.getElementById('availabilityBadge').textContent = isAvailable ? 'Available' : 'Offline';
        document.getElementById('toggleAvailBtn').textContent = isAvailable ? 'Go offline' : 'Go available';
    }
}

async function loadMyOrders() {
    const res = await fetch('/api/order/my-orders', { headers: { 'authorization': token } });
    const data = await res.json();
    const listEl = document.getElementById('ordersList');

    if (data.success && data.data.length > 0) {
        listEl.innerHTML = '';
        data.data.forEach((order) => {
            const div = document.createElement('div');
            div.className = 'order-card';
            div.innerHTML = `
                <p><strong style="color: var(--text)">Order #${order._id.slice(-6)}</strong></p>
                <p>Status: <span class="status-badge">${order.status}</span></p>
                ${getNextStatusButton(order)}
            `;
            listEl.appendChild(div);
        });
    } else {
        listEl.innerHTML = '<div class="empty">No orders yet.</div>';
    }
}

function getNextStatusButton(order) {
    const flow = { requested: 'accepted', accepted: 'picked_up', picked_up: 'in_transit', in_transit: 'completed' };
    const next = flow[order.status];
    if (!next) return '';
    return `<button class="btn btn-outline" onclick="updateStatus('${order._id}', '${next}', this)">Mark as ${next}</button>`;
}

async function updateStatus(orderId, status, btn) {
    btn.disabled = true;
    btn.textContent = 'Updating...';

    const res = await fetch(`/api/order/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'authorization': token },
        body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
        socket.emit('ride:join', orderId);
        loadMyOrders();
    } else {
        alert(data.message);
        btn.disabled = false;
        btn.textContent = `Mark as ${status}`;
    }
}

loadMyOrders();
document.getElementById('availabilityBadge').textContent = 'Offline';