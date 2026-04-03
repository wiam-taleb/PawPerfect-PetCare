/* ============================================================
   PawPerfect Pet Care - Main JavaScript
   Features:
     1. Mobile Navigation Toggle
     2. Smart Booking System (step-by-step with validation)
     3. Mini Shop Cart (localStorage)
     4. Feedback Form Validation
     5. Cart Count in Navbar
   ============================================================ */

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initBookingSystem();
    initShopCart();
    initFeedbackForm();
    updateCartCount();
});

// ==================== 1. MOBILE NAVIGATION ====================
function initNavigation() {
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link (mobile)
        var links = navLinks.querySelectorAll('a');
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
            });
        });
    }
}

// ==================== 2. SMART BOOKING SYSTEM ====================
var bookingData = {
    service: '',
    petType: '',
    date: '',
    time: '',
    payment: ''
};

var currentStep = 1;

function initBookingSystem() {
    var bookingContainer = document.getElementById('bookingContainer');
    if (!bookingContainer) return;

    // Step 1: Service Selection
    setupOptionSelection('serviceOptions', function (value) {
        bookingData.service = value;
    });

    // Step 2: Pet Type Selection
    setupOptionSelection('petOptions', function (value) {
        bookingData.petType = value;
    });

    // Step 3: Date Selection
    var dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var dd = String(today.getDate()).padStart(2, '0');
        dateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);

        dateInput.addEventListener('change', function () {
            bookingData.date = this.value;
            bookingData.time = '';
            generateTimeSlots(this.value);
        });
    }

    // Step 4: Payment Selection
    setupOptionSelection('paymentOptions', function (value) {
        bookingData.payment = value;
    });

    // Navigation Buttons
    var toStep2 = document.getElementById('toStep2');
    var toStep3 = document.getElementById('toStep3');
    var toStep4 = document.getElementById('toStep4');
    var backToStep1 = document.getElementById('backToStep1');
    var backToStep2 = document.getElementById('backToStep2');
    var backToStep3 = document.getElementById('backToStep3');
    var confirmBooking = document.getElementById('confirmBooking');
    var newBooking = document.getElementById('newBooking');

    if (toStep2) {
        toStep2.addEventListener('click', function () {
            if (!bookingData.service) {
                showError('step1Error', 'Please select a service to continue.');
                return;
            }
            clearError('step1Error');
            goToStep(2);
        });
    }

    if (toStep3) {
        toStep3.addEventListener('click', function () {
            if (!bookingData.petType) {
                showError('step2Error', 'Please select your pet type to continue.');
                return;
            }
            clearError('step2Error');
            goToStep(3);
        });
    }

    if (toStep4) {
        toStep4.addEventListener('click', function () {
            if (!bookingData.date) {
                showError('step3Error', 'Please select a date to continue.');
                return;
            }
            if (!bookingData.time) {
                showError('step3Error', 'Please select a time slot to continue.');
                return;
            }
            clearError('step3Error');
            goToStep(4);
        });
    }

    if (backToStep1) backToStep1.addEventListener('click', function () { goToStep(1); });
    if (backToStep2) backToStep2.addEventListener('click', function () { goToStep(2); });
    if (backToStep3) backToStep3.addEventListener('click', function () { goToStep(3); });

    if (confirmBooking) {
        confirmBooking.addEventListener('click', function () {
            if (!bookingData.payment) {
                showError('step4Error', 'Please select a payment method to continue.');
                return;
            }
            clearError('step4Error');
            showBookingSummary();
            goToStep(5);
            saveBookingToStorage();
        });
    }

    if (newBooking) {
        newBooking.addEventListener('click', function () {
            resetBooking();
        });
    }
}

function setupOptionSelection(containerId, callback) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var options = container.querySelectorAll('.booking-option');
    options.forEach(function (option) {
        option.addEventListener('click', function () {
            options.forEach(function (opt) { opt.classList.remove('selected'); });
            this.classList.add('selected');
            callback(this.getAttribute('data-value'));
        });
    });
}

function goToStep(step) {
    var steps = document.querySelectorAll('.booking-step');
    steps.forEach(function (s) { s.classList.remove('active'); });

    var targetStep = document.getElementById('step' + step);
    if (targetStep) targetStep.classList.add('active');

    var progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach(function (ps) {
        var stepNum = parseInt(ps.getAttribute('data-step'));
        ps.classList.remove('active', 'completed');
        if (stepNum === step) {
            ps.classList.add('active');
        } else if (stepNum < step) {
            ps.classList.add('completed');
        }
    });

    currentStep = step;
}

function generateTimeSlots(dateStr) {
    var timeSlotsContainer = document.getElementById('timeSlotsContainer');
    var timeSlotsDiv = document.getElementById('timeSlots');
    if (!timeSlotsContainer || !timeSlotsDiv) return;

    timeSlotsContainer.style.display = 'block';
    timeSlotsDiv.innerHTML = '';

    var allSlots = [
        '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
        '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
        '08:00 PM'
    ];

    var date = new Date(dateStr);
    var dayOfWeek = date.getDay();

    allSlots.forEach(function (slot, index) {
        var slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.className = 'time-slot';
        slotBtn.textContent = slot;

        // Friday: only afternoon/evening available
        if (dayOfWeek === 5 && index < 6) {
            slotBtn.classList.add('unavailable');
            slotBtn.textContent = slot + ' (Closed)';
        }
        // Simulate some booked slots
        else if ((index + dayOfWeek) % 5 === 0) {
            slotBtn.classList.add('unavailable');
            slotBtn.textContent = slot + ' (Booked)';
        }
        else {
            slotBtn.addEventListener('click', function () {
                var allSlotBtns = timeSlotsDiv.querySelectorAll('.time-slot');
                allSlotBtns.forEach(function (b) { b.classList.remove('selected'); });
                this.classList.add('selected');
                bookingData.time = slot;
            });
        }

        timeSlotsDiv.appendChild(slotBtn);
    });
}

function showBookingSummary() {
    var summaryDiv = document.getElementById('bookingSummary');
    if (!summaryDiv) return;

    var dateObj = new Date(bookingData.date + 'T00:00:00');
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var formattedDate = dateObj.toLocaleDateString('en-US', options);

    var bookingId = 'PW-' + Date.now().toString().slice(-6);

    summaryDiv.innerHTML =
        '<h5>Booking Summary</h5>' +
        '<div class="summary-item"><span class="summary-label">Booking ID:</span><span class="summary-value">' + bookingId + '</span></div>' +
        '<div class="summary-item"><span class="summary-label">Service:</span><span class="summary-value">' + bookingData.service + '</span></div>' +
        '<div class="summary-item"><span class="summary-label">Pet Type:</span><span class="summary-value">' + bookingData.petType + '</span></div>' +
        '<div class="summary-item"><span class="summary-label">Date:</span><span class="summary-value">' + formattedDate + '</span></div>' +
        '<div class="summary-item"><span class="summary-label">Time:</span><span class="summary-value">' + bookingData.time + '</span></div>' +
        '<div class="summary-item"><span class="summary-label">Payment:</span><span class="summary-value">' + bookingData.payment + '</span></div>' +
        '<p style="margin-top:1rem;text-align:center;color:#2e7d32;font-weight:600;">Your booking has been confirmed successfully!</p>';
}

function saveBookingToStorage() {
    var bookings = JSON.parse(localStorage.getItem('pawperfect_bookings') || '[]');
    var newBookingEntry = {
        id: 'PW-' + Date.now().toString().slice(-6),
        service: bookingData.service,
        petType: bookingData.petType,
        date: bookingData.date,
        time: bookingData.time,
        payment: bookingData.payment,
        createdAt: new Date().toISOString()
    };
    bookings.push(newBookingEntry);
    localStorage.setItem('pawperfect_bookings', JSON.stringify(bookings));
}

function resetBooking() {
    bookingData = { service: '', petType: '', date: '', time: '', payment: '' };

    // Reset all selections
    var allOptions = document.querySelectorAll('.booking-option');
    allOptions.forEach(function (opt) { opt.classList.remove('selected'); });

    var dateInput = document.getElementById('bookingDate');
    if (dateInput) dateInput.value = '';

    var timeSlotsContainer = document.getElementById('timeSlotsContainer');
    if (timeSlotsContainer) timeSlotsContainer.style.display = 'none';

    var timeSlots = document.getElementById('timeSlots');
    if (timeSlots) timeSlots.innerHTML = '';

    goToStep(1);
}

// ==================== 3. MINI SHOP CART ====================
function initShopCart() {
    var addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons.length === 0) return;

    addToCartButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var card = this.closest('.product-card');
            var productId = card.getAttribute('data-id');
            var productName = card.getAttribute('data-name');
            var productPrice = parseFloat(card.getAttribute('data-price'));

            addToCart(productId, productName, productPrice);

            // Visual feedback
            var originalText = this.textContent;
            this.textContent = 'Added!';
            this.style.backgroundColor = '#4caf50';
            var self = this;
            setTimeout(function () {
                self.textContent = originalText;
                self.style.backgroundColor = '';
            }, 1000);
        });
    });

    // Checkout button
    var checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            simulateCheckout();
        });
    }

    renderCart();
}

function getCart() {
    return JSON.parse(localStorage.getItem('pawperfect_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('pawperfect_cart', JSON.stringify(cart));
}

function addToCart(id, name, price) {
    var cart = getCart();
    var existingItem = null;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
            existingItem = cart[i];
            break;
        }
    }

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: id, name: name, price: price, quantity: 1 });
    }

    saveCart(cart);
    updateCartCount();
    renderCart();
}

function removeFromCart(id) {
    var cart = getCart();
    cart = cart.filter(function (item) { return item.id !== id; });
    saveCart(cart);
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    var cart = getCart();
    var totalItems = 0;
    cart.forEach(function (item) { totalItems += item.quantity; });

    var countElements = document.querySelectorAll('#cartCount');
    countElements.forEach(function (el) {
        el.textContent = totalItems;
    });
}

function renderCart() {
    var cartItemsDiv = document.getElementById('cartItems');
    var cartTotalDiv = document.getElementById('cartTotal');
    var cartSubtotal = document.getElementById('cartSubtotal');

    if (!cartItemsDiv) return;

    var cart = getCart();

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="cart-empty">Your cart is empty. Add some products above!</p>';
        if (cartTotalDiv) cartTotalDiv.style.display = 'none';
        return;
    }

    var html = '';
    var subtotal = 0;

    cart.forEach(function (item) {
        var itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        html +=
            '<div class="cart-item">' +
                '<div class="cart-item-info">' +
                    '<span class="cart-item-name">' + item.name + '</span>' +
                    ' <span class="cart-item-price">SAR ' + item.price.toFixed(2) + ' x ' + item.quantity + '</span>' +
                '</div>' +
                '<button class="cart-item-remove" data-id="' + item.id + '" title="Remove item">&times;</button>' +
            '</div>';
    });

    cartItemsDiv.innerHTML = html;

    if (cartTotalDiv) {
        cartTotalDiv.style.display = 'block';
    }
    if (cartSubtotal) {
        cartSubtotal.textContent = subtotal.toFixed(2);
    }

    // Attach remove event listeners
    var removeButtons = cartItemsDiv.querySelectorAll('.cart-item-remove');
    removeButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            removeFromCart(this.getAttribute('data-id'));
        });
    });
}

function simulateCheckout() {
    var cart = getCart();
    if (cart.length === 0) return;

    var subtotal = 0;
    cart.forEach(function (item) { subtotal += item.price * item.quantity; });

    alert(
        'Checkout Simulation\n\n' +
        'Items: ' + cart.length + '\n' +
        'Total: SAR ' + subtotal.toFixed(2) + '\n\n' +
        'This is a simulated checkout. No real payment has been processed.\n' +
        'Thank you for shopping at PawPerfect!'
    );

    // Clear cart after checkout
    localStorage.removeItem('pawperfect_cart');
    updateCartCount();
    renderCart();
}

// ==================== 4. FEEDBACK FORM VALIDATION ====================
function initFeedbackForm() {
    var feedbackForm = document.getElementById('feedbackForm');
    if (!feedbackForm) return;

    feedbackForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var isValid = true;

        // Validate Name
        var nameInput = document.getElementById('feedbackName');
        var nameError = document.getElementById('nameError');
        if (!nameInput.value.trim()) {
            showError('nameError', 'Please enter your full name.');
            nameInput.classList.add('error');
            isValid = false;
        } else if (nameInput.value.trim().length < 2) {
            showError('nameError', 'Name must be at least 2 characters long.');
            nameInput.classList.add('error');
            isValid = false;
        } else {
            clearError('nameError');
            nameInput.classList.remove('error');
        }

        // Validate Email
        var emailInput = document.getElementById('feedbackEmail');
        var emailError = document.getElementById('emailError');
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            showError('emailError', 'Please enter your email address.');
            emailInput.classList.add('error');
            isValid = false;
        } else if (!emailRegex.test(emailInput.value.trim())) {
            showError('emailError', 'Please enter a valid email address (e.g., user@example.com).');
            emailInput.classList.add('error');
            isValid = false;
        } else {
            clearError('emailError');
            emailInput.classList.remove('error');
        }

        // Validate Rating
        var ratingInputs = document.querySelectorAll('input[name="rating"]');
        var ratingSelected = false;
        ratingInputs.forEach(function (input) {
            if (input.checked) ratingSelected = true;
        });
        if (!ratingSelected) {
            showError('ratingError', 'Please select an overall rating.');
            isValid = false;
        } else {
            clearError('ratingError');
        }

        // If all valid, show success
        if (isValid) {
            feedbackForm.style.display = 'none';
            var successDiv = document.getElementById('feedbackSuccess');
            if (successDiv) successDiv.style.display = 'block';

            // New feedback button
            var newFeedbackBtn = document.getElementById('newFeedback');
            if (newFeedbackBtn) {
                newFeedbackBtn.addEventListener('click', function () {
                    feedbackForm.reset();
                    feedbackForm.style.display = 'block';
                    successDiv.style.display = 'none';
                    // Clear all error classes
                    var errorInputs = feedbackForm.querySelectorAll('.error');
                    errorInputs.forEach(function (el) { el.classList.remove('error'); });
                });
            }
        }
    });

    // Real-time validation on blur
    var nameInput = document.getElementById('feedbackName');
    if (nameInput) {
        nameInput.addEventListener('blur', function () {
            if (this.value.trim() && this.value.trim().length >= 2) {
                clearError('nameError');
                this.classList.remove('error');
            }
        });
    }

    var emailInput = document.getElementById('feedbackEmail');
    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value.trim() && emailRegex.test(this.value.trim())) {
                clearError('emailError');
                this.classList.remove('error');
            }
        });
    }
}

// ==================== UTILITY FUNCTIONS ====================
function showError(elementId, message) {
    var el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

function clearError(elementId) {
    var el = document.getElementById(elementId);
    if (el) {
        el.textContent = '';
        el.style.display = 'none';
    }
}
