class AppointmentScheduler {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableTimeSlots = {
            morning: ['09:00', '10:00', '11:00'],
            afternoon: ['14:00', '15:00', '16:00'],
            evening: ['17:00', '18:00']
        };
        
        this.init();
    }

    init() {
        const calendarWidget = document.querySelector('.calendar-widget');
        if (!calendarWidget) return;

        this.renderCalendar();
        this.setupEventListeners();
        this.renderTimeSlots();
    }

    renderCalendar() {
        const calendarWidget = document.querySelector('.calendar-widget');
        const calendar = this.generateCalendar();
        calendarWidget.innerHTML = calendar;
    }

    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = `
            <div class="calendar-header">
                <button class="prev-month"><i class="fas fa-chevron-left"></i></button>
                <h3>${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}</h3>
                <button class="next-month"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="calendar-days">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
                <div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div class="calendar-grid">
        `;

        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isToday(date);
            const isPast = date < new Date().setHours(0, 0, 0, 0);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} 
                    ${isPast || isWeekend ? 'disabled' : ''}"
                    data-date="${date.toISOString().split('T')[0]}">
                    ${day}
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    renderTimeSlots() {
        const slotsContainer = document.querySelector('.slot-grid');
        if (!slotsContainer) return;

        let html = '';
        Object.values(this.availableTimeSlots).forEach(slots => {
            slots.forEach(time => {
                html += `
                    <button class="time-slot" data-time="${time}">
                        ${time}
                    </button>
                `;
            });
        });

        slotsContainer.innerHTML = html;
    }

    setupEventListeners() {
        const calendar = document.querySelector('.calendar-widget');
        const timeSlots = document.querySelector('.slot-grid');

        calendar.addEventListener('click', (e) => {
            if (e.target.classList.contains('calendar-day') && !e.target.classList.contains('disabled')) {
                const selectedDate = e.target.dataset.date;
                this.selectDate(selectedDate, e.target);
            }

            if (e.target.closest('.prev-month')) {
                this.previousMonth();
            }

            if (e.target.closest('.next-month')) {
                this.nextMonth();
            }
        });

        if (timeSlots) {
            timeSlots.addEventListener('click', (e) => {
                if (e.target.classList.contains('time-slot')) {
                    this.selectTime(e.target);
                }
            });
        }
    }

    selectDate(date, element) {
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        element.classList.add('selected');
        this.selectedDate = date;
        this.enableTimeSlots();
    }

    selectTime(element) {
        if (!this.selectedDate) {
            const notifications = new NotificationSystem();
            notifications.push('Please select a date first', 'error');
            return;
        }

        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('active');
        });
        element.classList.add('active');
        this.selectedTime = element.dataset.time;

        // Show confirmation
        this.showConfirmation();
    }

    showConfirmation() {
        const notifications = new NotificationSystem();
        notifications.push(`Appointment scheduled for ${this.selectedDate} at ${this.selectedTime}`, 'success');
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    enableTimeSlots() {
        const slots = document.querySelectorAll('.time-slot');
        slots.forEach(slot => {
            slot.disabled = false;
        });
    }
}

// Initialize the scheduler
document.addEventListener('DOMContentLoaded', () => {
    new AppointmentScheduler();
}); 