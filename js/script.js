document.addEventListener("DOMContentLoaded", function() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    let currentUser = null;

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const user = users.find(user => user.username === username && user.password === password);
            if (user) {
                alert('Login bem-sucedido!');
                currentUser = user.username;
                localStorage.setItem('currentUser', currentUser);
                window.location.href = 'schedule.html';
            } else {
                alert('Usuário ou senha incorretos');
            }
        });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const newUsername = document.getElementById('newUsername').value;
            const academicEmail = document.getElementById('academicEmail').value;
            const registrationNumber = document.getElementById('registrationNumber').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                alert('As senhas não coincidem');
                return;
            }

            if (users.find(user => user.username === newUsername)) {
                alert('Usuário já existe');
            } else {
                users.push({ username: newUsername, email: academicEmail, registrationNumber: registrationNumber, password: newPassword });
                localStorage.setItem('users', JSON.stringify(users));
                alert('Cadastro bem-sucedido!');
                window.location.href = 'login.html';
            }
        });
    }

    // Get current user
    currentUser = localStorage.getItem('currentUser');

    // FullCalendar Initialization
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            locale: 'pt-br', // Set locale to Brazilian Portuguese
            initialView: 'dayGridMonth',
            events: bookings.map((booking, index) => ({
                id: index,
                title: booking.reason,
                start: `${booking.date}T${booking.startTime}`,
                end: `${booking.date}T${booking.endTime}`,
                extendedProps: {
                    reservedBy: booking.reservedBy
                }
            })),
            eventClick: function(info) {
                const booking = bookings[info.event.id];
                document.getElementById('viewDate').textContent = booking.date;
                document.getElementById('viewStartTime').textContent = booking.startTime;
                document.getElementById('viewEndTime').textContent = booking.endTime;
                document.getElementById('viewReason').textContent = booking.reason;
                document.getElementById('viewReservedBy').textContent = booking.reservedBy;
                $('#viewBookingModal').modal('show');
            },
            dateClick: function(info) {
                const dayBookings = bookings.filter(booking => booking.date === info.dateStr);
                const dayBookingsBody = document.getElementById('dayBookingsBody');
                dayBookingsBody.innerHTML = ''; // Clear previous content
                if (dayBookings.length > 0) {
                    dayBookings.forEach(booking => {
                        const bookingInfo = `
                            <p><strong>Data:</strong> ${booking.date}</p>
                            <p><strong>Hora de Início:</strong> ${booking.startTime}</p>
                            <p><strong>Hora Final:</strong> ${booking.endTime}</p>
                            <p><strong>Motivo:</strong> ${booking.reason}</p>
                            <p><strong>Reservado por:</strong> ${booking.reservedBy}</p>
                            <hr>
                        `;
                        dayBookingsBody.innerHTML += bookingInfo;
                    });
                } else {
                    dayBookingsBody.innerHTML = '<p>Nenhuma reserva para este dia.</p>';
                }
                $('#dayBookingsModal').modal('show');
            }
        });
        calendar.render();
    }

    // Booking Form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const date = document.getElementById('date').value;
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;
            const reason = document.getElementById('reason').value;
            const booking = { date, startTime, endTime, reason, reservedBy: currentUser };
            bookings.push(booking);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            alert('Reserva realizada com sucesso!');
            $('#bookingModal').modal('hide');
            calendar.addEvent({
                id: bookings.length - 1,
                title: reason,
                start: `${date}T${startTime}`,
                end: `${date}T${endTime}`,
                extendedProps: {
                    reservedBy: currentUser
                }
            });
        });
    }
});
