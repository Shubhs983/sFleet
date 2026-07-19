const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

const socket = io();
let myLocation = null;
let currentOrderId = null;

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

function getMyLocation() {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude
                });
            },
            () => {
                resolve({ longitude: 88.3639, latitude: 22.5726 });
            }
        );
    });
}

async function loadNearbyDrivers() {
    myLocation = await getMyLocation();

    const res = await fetch(`/api/driver/nearby?longitude=${myLocation.longitude}&latitude=${myLocation.latitude}`, {
        headers: { 'authorization': token }
    });
    const data = await res.json();

    const listEl = document.getElementById('driversList');

    if (data.success && data.data.length > 0) {
        listEl.innerHTML = '';
        data.data.forEach((driver) => {
            const row = document.createElement('div');
            row.className = 'driver-row';
            row.innerHTML = `<span>${driver.user.name}</span><span class="status-badge">Available</span>`;
            listEl.appendChild(row);
        });
    } else {
        listEl.innerHTML = '<div class="empty">No drivers nearby right now.</div>';
    }
}

async function createOrder() {
    const requestBtn = document.getElementById('requestBtn');
    requestBtn.disabled = true;
    requestBtn.textContent = 'Requesting...';

    const dropLongitude = 88.40;
    const dropLatitude = 22.60;

    const res = await fetch('/api/order/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': token
        },
        body: JSON.stringify({
            pickupLongitude: myLocation.longitude,
            pickupLatitude: myLocation.latitude,
            dropLongitude,
            dropLatitude
        })
    });

    const data = await res.json();

    if (data.success) {
        currentOrderId = data.data._id;
        document.getElementById('orderStatus').textContent = data.data.status;
        socket.emit('ride:join', currentOrderId);
        requestBtn.textContent = 'Ride requested!';
    } else {
        requestBtn.textContent = 'Request ride to test drop point';
        requestBtn.disabled = false;
        alert(data.message);
    }
}

socket.on('order:statusUpdated', (data) => {
    if (data._id === currentOrderId) {
        document.getElementById('orderStatus').textContent = data.status;
    }
});

socket.on('driver:locationUpdated', (data) => {
    if (data.orderId === currentOrderId) {
        const log = document.getElementById('locationLog');
        log.textContent = `Driver location: ${data.latitude}, ${data.longitude}`;
    }
});

loadNearbyDrivers();