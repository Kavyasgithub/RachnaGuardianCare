// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
});

// Navbar Background on Scroll
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Active Navigation Link on Scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function activateNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', activateNavLink);

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe all service cards
document.querySelectorAll('.service-card').forEach(card => {
    observer.observe(card);
});

// Observe gallery items
document.querySelectorAll('.gallery-item').forEach(item => {
    observer.observe(item);
});

// Observe info cards
document.querySelectorAll('.info-card').forEach(card => {
    observer.observe(card);
});

// Add animation class to elements
const style = document.createElement('style');
style.textContent = `
    .service-card,
    .gallery-item,
    .info-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .service-card.animate,
    .gallery-item.animate,
    .info-card.animate {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Back to Top Button
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Contact Form Submission
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value;
    
    // Get submit button
    const submitButton = contactForm.querySelector('.submit-button');
    const originalButtonText = submitButton.textContent;
    
    // Show loading state
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    submitButton.style.opacity = '0.7';
    
    try {
        // Send data to backend API
        const response = await fetch('https://rgcforyou.onrender.com/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                service,
                message
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Create success message
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success';
            successMessage.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #2d8659, #5fb88d);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    margin-top: 20px;
                    animation: slideIn 0.5s ease;
                ">
                    <h3 style="margin-bottom: 10px;">✓ Thank You, ${name}!</h3>
                    <p style="margin: 0;">We've received your message and will get back to you within 24 hours.</p>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">Our team will contact you at ${phone}</p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.9;">✉️ Email notification sent successfully</p>
                </div>
            `;
            
            // Add animation
            const animationStyle = document.createElement('style');
            animationStyle.textContent = `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(animationStyle);
            
            // Replace form with success message
            contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);
            contactForm.style.display = 'none';
            
            // Reset form after delay
            setTimeout(() => {
                contactForm.reset();
                contactForm.style.display = 'flex';
                successMessage.remove();
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
            }, 5000);
            
            console.log('✅ Form submitted successfully:', data);
        } else {
            throw new Error(data.message || 'Submission failed');
        }
        
    } catch (error) {
        console.error('❌ Error submitting form:', error);
        
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #d32f2f, #e57373);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin-top: 20px;
            ">
                <h3 style="margin-bottom: 10px;">❌ Submission Error</h3>
                <p style="margin: 0;">There was an error submitting your form. Please try again or contact us directly.</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">📞 +91-9355335159</p>
            </div>
        `;
        
        contactForm.parentNode.insertBefore(errorMessage, contactForm.nextSibling);
        
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
        
        // Remove error message after delay
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }
});

// Add hover effect to service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Parallax Effect on Scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.home-image img');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Counter Animation for Statistics (if needed in future)
function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Lazy Loading Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });
}

// Typing Effect for Home Section (Optional Enhancement)
function typeEffect(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Prevent form auto-completion issues
document.addEventListener('DOMContentLoaded', () => {
    // Add focus styles
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});

// Add dynamic year to footer
const currentYear = new Date().getFullYear();
const footerText = document.querySelector('.footer-bottom p');
if (footerText) {
    footerText.innerHTML = footerText.innerHTML.replace('2025', currentYear);
}

// Smooth reveal on page load
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add loaded class style
const loadedStyle = document.createElement('style');
loadedStyle.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(loadedStyle);

console.log('Rachna Guardian Care - Website Loaded Successfully ✓');

// ==================== AUTHENTICATION LOGIC ====================

const API_URL = 'https://rgcforyou.onrender.com/api';

// Get DOM elements
const signinModal = document.getElementById('signin-modal');
const signupModal = document.getElementById('signup-modal');
const btnSignin = document.getElementById('btn-signin');
const btnSignup = document.getElementById('btn-signup');
const btnLogout = document.getElementById('btn-logout');
const signinClose = document.getElementById('signin-close');
const signupClose = document.getElementById('signup-close');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToSignin = document.getElementById('switch-to-signin');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const signinMessage = document.getElementById('signin-message');
const signupMessage = document.getElementById('signup-message');
const authToggle = document.getElementById('auth-toggle');
const authDropdownMenu = document.getElementById('auth-dropdown-menu');

// Dropdown toggle functionality
authToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    authToggle.classList.toggle('active');
    authDropdownMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!authToggle.contains(e.target) && !authDropdownMenu.contains(e.target)) {
        authToggle.classList.remove('active');
        authDropdownMenu.classList.remove('show');
    }
});

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        const userData = JSON.parse(user);
        showUserInfo(userData);
        
        // If admin, redirect to admin panel if on home page
        if (userData.role === 'admin') {
            // Don't auto-redirect, just show user is logged in
            console.log('Admin logged in:', userData.email);
        }
    }
}

// Show user info in navbar
function showUserInfo(user) {
    authToggle.style.display = 'none';
    authDropdownMenu.classList.remove('show');
    userInfo.style.display = 'flex';
    userEmail.textContent = user.email;
}

// Hide user info in navbar
function hideUserInfo() {
    authToggle.style.display = 'flex';
    userInfo.style.display = 'none';
    userEmail.textContent = '';
}

// Show modal
function showModal(modal) {
    modal.classList.add('show');
}

// Hide modal
function hideModal(modal) {
    modal.classList.remove('show');
}

// Show message
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `auth-message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Modal open/close events
btnSignin.addEventListener('click', () => {
    authDropdownMenu.classList.remove('show');
    authToggle.classList.remove('active');
    // Close mobile menu if open
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
    showModal(signinModal);
});
btnSignup.addEventListener('click', () => {
    authDropdownMenu.classList.remove('show');
    authToggle.classList.remove('active');
    // Close mobile menu if open
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
    showModal(signupModal);
});
signinClose.addEventListener('click', () => hideModal(signinModal));
signupClose.addEventListener('click', () => hideModal(signupModal));

// Switch between modals
switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    hideModal(signinModal);
    showModal(signupModal);
});

switchToSignin.addEventListener('click', (e) => {
    e.preventDefault();
    hideModal(signupModal);
    showModal(signinModal);
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === signinModal) hideModal(signinModal);
    if (e.target === signupModal) hideModal(signupModal);
});

// Sign In Form Submit
signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store token and user info
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            showMessage(signinMessage, 'Login successful!', 'success');
            
            // Update UI
            showUserInfo(data.data.user);
            
            // Close modal after 1 second
            setTimeout(() => {
                hideModal(signinModal);
                signinForm.reset();
                
                // If admin, redirect to admin panel
                if (data.data.user.role === 'admin') {
                    window.location.href = 'admin.html';
                }
            }, 1000);
        } else {
            showMessage(signinMessage, data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(signinMessage, 'An error occurred. Please try again.', 'error');
    }
});

// Sign Up Form Submit
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage(signupMessage, 'Passwords do not match!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store token and user info
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            showMessage(signupMessage, 'Account created successfully!', 'success');
            
            // Update UI
            showUserInfo(data.data.user);
            
            // Close modal after 1 second
            setTimeout(() => {
                hideModal(signupModal);
                signupForm.reset();
            }, 1000);
        } else {
            showMessage(signupMessage, data.message, 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage(signupMessage, 'An error occurred. Please try again.', 'error');
    }
});

// Logout
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    hideUserInfo();
    
    // If on admin page, redirect to home
    if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    }
});

// Check auth on page load
checkAuth();

