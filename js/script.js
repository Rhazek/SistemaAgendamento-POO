class User {
    constructor(username, email, registrationNumber, password) {
        this.username = username;
        this.email = email;
        this.registrationNumber = registrationNumber;
        this.password = password;
    }
}

class Booking {
    constructor(date, startTime, endTime, reason, reservedBy) {
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.reason = reason;
        this.reservedBy = reservedBy;
    }
}

class BookingSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        this.currentUser = localStorage.getItem('currentUser');
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.initLoginForm();
            this.initRegisterForm();
            this.initCalendar();
            this.initBookingForm();
        });
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    saveBookings() {
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
    }

    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const user = this.users.find(user => user.username === username 
                    && user.password === password);
                if (user) {
                    alert('Login bem-sucedido!');
                    this.currentUser = user.username;
                    localStorage.setItem('currentUser', this.currentUser);
                    window.location.href = 'schedule.html';
                } else {
                    alert('Usuário ou senha incorretos');
                }
            });
        }
    }

    initRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (event) => {
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

                if (this.users.find(user => user.username === newUsername)) {
                    alert('Usuário já existe');
                } else {
                    const newUser = new User(newUsername, academicEmail, registrationNumber, 
                        newPassword);
                    this.users.push(newUser);
                    this.saveUsers();
                    alert('Cadastro bem-sucedido!');
                    window.location.href = 'login.html';
                }
            });
        }
    }

    initCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (calendarEl) {
            const calendar = new FullCalendar.Calendar(calendarEl, {
                locale: 'pt-br',
                initialView: 'dayGridMonth',
                events: this.bookings.map((booking, index) => ({
                    id: index,
                    title: booking.reason,
                    start: `${booking.date}T${booking.startTime}`,
                    end: `${booking.date}T${booking.endTime}`,
                    extendedProps: {
                        reservedBy: booking.reservedBy
                    }
                })),
                eventClick: (info) => this.onEventClick(info),
                dateClick: (info) => this.onDateClick(info)
            });
            calendar.render();
            this.calendar = calendar;
        }
    }

    onEventClick(info) {
        const booking = this.bookings[info.event.id];
        document.getElementById('viewDate').textContent = booking.date;
        document.getElementById('viewStartTime').textContent = booking.startTime;
        document.getElementById('viewEndTime').textContent = booking.endTime;
        document.getElementById('viewReason').textContent = booking.reason;
        document.getElementById('viewReservedBy').textContent = booking.reservedBy;

        const editButton = document.getElementById('editBookingButton');
        const deleteButton = document.getElementById('deleteBookingButton');

        if (this.currentUser === booking.reservedBy) {
            editButton.style.display = 'block';
            deleteButton.style.display = 'block';

            editButton.onclick = () => {
                document.getElementById('editDate').value = booking.date;
                document.getElementById('editStartTime').value = booking.startTime;
                document.getElementById('editEndTime').value = booking.endTime;
                document.getElementById('editReason').value = booking.reason;

                $('#viewBookingModal').modal('hide');
                $('#editBookingModal').modal('show');

                document.getElementById('editBookingForm').onsubmit = (event) => {
                    event.preventDefault();
                    booking.date = document.getElementById('editDate').value;
                    booking.startTime = document.getElementById('editStartTime').value;
                    booking.endTime = document.getElementById('editEndTime').value;
                    booking.reason = document.getElementById('editReason').value;

                    if (this.isTimeValid(booking.startTime, booking.endTime)) {
                        this.bookings[info.event.id] = booking;
                        this.saveBookings();

                        info.event.setProp('title', booking.reason);
                        info.event.setStart(`${booking.date}T${booking.startTime}`);
                        info.event.setEnd(`${booking.date}T${booking.endTime}`);
                        info.event.setExtendedProp('reservedBy', booking.reservedBy);

                        $('#editBookingModal').modal('hide');
                        this.calendar.render();
                    } else {
                        alert('As reservas só podem ser feitas entre 08:00 e 18:00.');
                    }
                };
            };

            deleteButton.onclick = () => {
                $('#viewBookingModal').modal('hide');
                $('#deleteBookingModal').modal('show');

                document.getElementById('confirmDeleteButton').onclick = () => {
                    this.bookings.splice(info.event.id, 1);
                    this.saveBookings();
                    info.event.remove();
                    $('#deleteBookingModal').modal('hide');
                };
            };
        } else {
            editButton.style.display = 'none';
            deleteButton.style.display = 'none';
        }

        $('#viewBookingModal').modal('show');
    }

    onDateClick(info) {
        const dayBookings = this.bookings.filter(booking => booking.date === info.dateStr);
        const dayBookingsBody = document.getElementById('dayBookingsBody');
        dayBookingsBody.innerHTML = ''; // Clear previous content
        if (dayBookings.length > 0) {
            dayBookings.forEach((booking) => {
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

    initBookingForm() {
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const date = document.getElementById('date').value;
                const startTime = document.getElementById('startTime').value;
                const endTime = document.getElementById('endTime').value;
                const reason = document.getElementById('reason').value;
                const booking = new Booking(date, startTime, endTime, reason, this.currentUser);

                if (this.isTimeValid(startTime, endTime)) {
                    this.bookings.push(booking);
                    this.saveBookings();
                    alert('Reserva realizada com sucesso!');
                    $('#bookingModal').modal('hide');
                    this.calendar.addEvent({
                        id: this.bookings.length - 1,
                        title: reason,
                        start: `${date}T${startTime}`,
                        end: `${date}T${endTime}`,
                        extendedProps: {
                            reservedBy: this.currentUser
                        }
                    });
                    this.calendar.render();
                } else {
                    alert('As reservas só podem ser feitas entre 08:00 e 18:00.');
                }
            });
        }
    }

    isTimeValid(startTime, endTime) {
        const start = parseInt(startTime.replace(':', ''), 10);
        const end = parseInt(endTime.replace(':', ''), 10);
        const openingTime = 800;
        const closingTime = 1800;
        return start >= openingTime && end <= closingTime;
    };
}

const bookingSystem = new BookingSystem();
