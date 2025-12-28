// Smooth scrolling and interactive functionality
document.addEventListener('DOMContentLoaded', function () {

    // Smooth scrolling for navigation links
    const navigationLinks = document.querySelectorAll('a[href^="#"]');
    navigationLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');

                // Trigger counter animation for statistics
                if (entry.target.classList.contains('counter')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Counter animation function
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            // Format the number based on the target
            if (target >= 100) {
                element.textContent = Math.floor(current) + '+';
            } else if (target >= 10) {
                element.textContent = Math.floor(current) + '+';
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    }

    // Initialize counter animations when page loads
    function initializeCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            // Set initial value to 0
            counter.textContent = '0';

            // Create intersection observer for this counter
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                        entry.target.classList.add('counted');
                        animateCounter(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counterObserver.observe(counter);
        });
    }

    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('nav');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add/remove scrolled class based on scroll position
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
    });

    // Floating Button Visibility
    const floatingBtn = document.querySelector('.floating-contact-btn');
    if (floatingBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                floatingBtn.classList.add('visible');
            } else {
                floatingBtn.classList.remove('visible');
            }
        });
    }

    // Enhanced Form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Clear previous errors
            clearAllErrors();

            // Validate all fields
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                showNotification('Please correct the errors below.', 'error');
                return;
            }

            // Get form data
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                privacy: formData.get('privacy')
            };

            // Show loading state
            setFormLoading(true);

            // AJAX form submission to Formspree
            fetch("https://formspree.io/f/xzdbvdrk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(Object.fromEntries(formData)),
            })
                .then(response => {
                    if (response.ok) {
                        setFormLoading(false);
                        showNotification('Message sent successfully! I\'ll get back to you within 24 hours.', 'success');
                        this.reset();
                        clearAllErrors();
                    } else {
                        return response.json().then(data => {
                            if (Object.hasOwn(data, 'errors')) {
                                throw new Error(data["errors"].map(error => error["message"]).join(", "));
                            } else {
                                throw new Error('Oops! There was a problem submitting your form');
                            }
                        });
                    }
                })
                .catch((error) => {
                    setFormLoading(false);
                    showNotification(error.message || 'Oops! There was an error sending your message. Please try again.', 'error');
                    console.error('Form submission error:', error);
                });
        });
    }

    // Form validation functions
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        const errorElement = document.getElementById(`${fieldName}-error`);

        // Clear previous error
        clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            showFieldError(field, `${getFieldLabel(fieldName)} is required.`);
            return false;
        }

        // Email validation
        if (fieldName === 'email' && value && !isValidEmail(value)) {
            showFieldError(field, 'Please enter a valid email address.');
            return false;
        }

        // Phone validation (if provided)
        if (fieldName === 'phone' && value && !isValidPhone(value)) {
            showFieldError(field, 'Please enter a valid phone number.');
            return false;
        }

        // Message length validation
        if (fieldName === 'message' && value && value.length < 10) {
            showFieldError(field, 'Message must be at least 10 characters long.');
            return false;
        }

        return true;
    }

    function showFieldError(field, message) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
            field.classList.add('border-red-500');
            field.classList.remove('border-gray-300');
        }
    }

    function clearFieldError(field) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.classList.add('hidden');
            field.classList.remove('border-red-500');
            field.classList.add('border-gray-300');
        }
    }

    function clearAllErrors() {
        const errorElements = document.querySelectorAll('[id$="-error"]');
        errorElements.forEach(error => error.classList.add('hidden'));

        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.classList.remove('border-red-500');
            input.classList.add('border-gray-300');
        });
    }

    function getFieldLabel(fieldName) {
        const labels = {
            'name': 'Full Name',
            'email': 'Email Address',
            'phone': 'Phone Number',
            'subject': 'Subject',
            'message': 'Message',
            'privacy': 'Privacy Agreement'
        };
        return labels[fieldName] || fieldName;
    }

    function setFormLoading(loading) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const submitText = submitBtn.querySelector('.submit-text');
        const loadingText = submitBtn.querySelector('.loading-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');

        if (loading) {
            submitText.classList.add('hidden');
            loadingText.classList.remove('hidden');
            loadingSpinner.classList.remove('hidden');
            submitBtn.disabled = true;
        } else {
            submitText.classList.remove('hidden');
            loadingText.classList.add('hidden');
            loadingSpinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone);
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;

        // Set notification style based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-500', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-500', 'text-white');
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Parallax effect for hero section
    const heroSection = document.querySelector('#home');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }

    // Typing animation for hero text (defined once)

    // Mobile menu close on link click
    const mobileMenuLinks = document.querySelectorAll('.md\\:hidden a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Close mobile menu
            const mobileMenu = document.querySelector('[x-data]');
            if (mobileMenu && mobileMenu.__x) {
                mobileMenu.__x.$data.mobileMenuOpen = false;
            }
        });
    });

    // Add loading animation to page
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');

        // Animate elements on page load
        const elementsToAnimate = document.querySelectorAll('.animate-fade-in-up, .animate-fade-in-left, .animate-fade-in-right');
        elementsToAnimate.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    });

    // Add scroll progress indicator
    function createScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'fixed top-0 left-0 w-full h-1 z-50 transform origin-left scale-x-0 transition-transform duration-150';
        progressBar.style.backgroundColor = '#d4af37';
        progressBar.id = 'scroll-progress';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.transform = `scaleX(${scrollPercent / 100})`;
        });
    }

    createScrollProgress();

    // Add smooth reveal animations to sections
    const pageSections = document.querySelectorAll('section');
    pageSections.forEach(section => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });

    // Add typing animation to hero text
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';

        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }

        type();
    }

    // Initialize typing animation for hero title
    const heroTitleElement = document.querySelector('#home h1');
    if (heroTitleElement) {
        const originalText = heroTitleElement.textContent;
        setTimeout(() => {
            typeWriter(heroTitleElement, originalText, 80);
        }, 1000);
    }

    // Parallax scrolling effect simplified for better performance

    // Mouse movement parallax effect removed for better performance

    // Add shimmer effect to buttons on hover
    const shimmerButtons = document.querySelectorAll('.btn-gold, .btn-primary, .btn-secondary');
    shimmerButtons.forEach(button => {
        button.addEventListener('mouseenter', function () {
            this.classList.add('animate-shimmer');
        });

        button.addEventListener('mouseleave', function () {
            this.classList.remove('animate-shimmer');
        });
    });

    // Add glow effect to practice area icons
    const practiceIcons = document.querySelectorAll('#expertise .w-16');
    practiceIcons.forEach((icon, index) => {
        icon.addEventListener('mouseenter', function () {
            this.classList.add('animate-glow');
        });

        icon.addEventListener('mouseleave', function () {
            this.classList.remove('animate-glow');
        });
    });

    // Add hover effects to project cards
    const projectCards = document.querySelectorAll('#projects .bg-white');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click effects to buttons (moved to later in the code)

    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        button, .btn-primary, .btn-secondary {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);

    // Performance optimization: Throttle scroll events
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply throttling to scroll events
    const throttledScrollHandler = throttle(() => {
        // Scroll-based animations and effects
    }, 16); // ~60fps

    window.addEventListener('scroll', throttledScrollHandler);

    // Add loading animation
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');

        // Initialize counter animations
        initializeCounters();

        // Animate elements on page load with stagger
        const elementsToAnimate = document.querySelectorAll('.animate-fade-in-up, .animate-fade-in-left, .animate-fade-in-right');
        elementsToAnimate.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });

        // Add entrance animation to hero section
        const heroSection = document.querySelector('#home');
        if (heroSection) {
            heroSection.style.opacity = '0';
            heroSection.style.transform = 'translateY(50px)';

            setTimeout(() => {
                heroSection.style.transition = 'all 1s ease-out';
                heroSection.style.opacity = '1';
                heroSection.style.transform = 'translateY(0)';
            }, 500);
        }
    });

    console.log('🚀 Website loaded successfully with enhanced animations!');

    // Fallback: Ensure all elements are visible even if animations fail
    setTimeout(() => {
        const hiddenElements = document.querySelectorAll('.animate-on-scroll');
        hiddenElements.forEach(el => {
            if (el.style.opacity === '0' || !el.style.opacity) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    }, 3000);

    // Hero Carousel Functionality
    const heroCarousel = {
        currentSlide: 0,
        slides: document.querySelectorAll('.hero-slide'),
        totalSlides: 0,
        autoPlayInterval: null,

        init() {
            this.totalSlides = this.slides.length;
            this.setupEventListeners();
            this.startAutoPlay();
        },

        setupEventListeners() {
            // Pause autoplay on hover
            const heroSection = document.querySelector('#home');
            if (heroSection) {
                heroSection.addEventListener('mouseenter', () => {
                    this.stopAutoPlay();
                });
                heroSection.addEventListener('mouseleave', () => {
                    this.startAutoPlay();
                });
            }
        },

        goToSlide(index) {
            // Remove active class from current slide
            this.slides[this.currentSlide].classList.remove('active');

            // Update current slide
            this.currentSlide = index;

            // Add active class to new slide
            this.slides[this.currentSlide].classList.add('active');
        },

        nextSlide() {
            const nextIndex = (this.currentSlide + 1) % this.totalSlides;
            this.goToSlide(nextIndex);
        },

        startAutoPlay() {
            this.stopAutoPlay(); // Clear any existing interval
            this.autoPlayInterval = setInterval(() => {
                this.nextSlide();
            }, 4000); // Change slide every 4 seconds
        },

        stopAutoPlay() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }
    };

    // Initialize hero carousel
    if (document.querySelectorAll('.hero-slide').length > 0) {
        heroCarousel.init();
    }

    // Case Study Modal System
    const caseStudyModal = {
        modal: null,
        modalContent: null,
        modalTitle: null,
        modalSubtitle: null,
        modalResult: null,
        caseStudies: {
            'corporate-merger': {
                title: 'International Corporate Merger Case',
                subtitle: 'Cross-Border Merger Success',
                result: 'Merger Completed • Regulatory Compliance • 100% Success Rate',
                content: `
                    <div class="space-y-6">
                        <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-gold">
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Case Overview</h3>
                            <p class="text-gray-700 leading-relaxed">
                                Our client, a major Egyptian manufacturing company, sought to merge with a European technology firm to expand their market presence and technological capabilities. This complex cross-border transaction involved multiple jurisdictions, regulatory approvals, and intricate financial structures totaling over $50 million.
                            </p>
                        </div>

                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">The Challenge</h3>
                            <p class="text-gray-700 leading-relaxed mb-4">
                                The merger presented numerous legal and regulatory challenges that required expert navigation through complex corporate law, international regulations, and multi-jurisdictional compliance requirements. Key challenges included:
                            </p>
                            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>Multi-jurisdictional regulatory compliance across Egypt and EU</li>
                                <li>Complex due diligence involving international assets and certifications</li>
                                <li>Intricate financial structuring with multiple funding sources</li>
                                <li>Employee transition and benefit plan integration</li>
                                <li>Intellectual property and trademark consolidation</li>
                            </ul>
                        </div>

                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Our Legal Strategy</h3>
                            <p class="text-gray-700 leading-relaxed mb-4">
                                We assembled a specialized team of corporate, international, and regulatory attorneys to handle every aspect of this complex transaction. Our comprehensive approach included:
                            </p>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Due Diligence</h4>
                                    <p class="text-gray-600 text-sm">Comprehensive review of all assets, liabilities, and regulatory compliance</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Regulatory Navigation</h4>
                                    <p class="text-gray-600 text-sm">Coordinated approvals across multiple international jurisdictions</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Transaction Structure</h4>
                                    <p class="text-gray-600 text-sm">Optimized deal structure for tax efficiency and risk mitigation</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Integration Planning</h4>
                                    <p class="text-gray-600 text-sm">Developed comprehensive post-merger integration strategy</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">The Outcome</h3>
                            <p class="text-gray-700 leading-relaxed mb-4">
                                Our meticulous legal work resulted in a seamless merger that exceeded all client expectations:
                            </p>
                            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li><strong>Timely Completion:</strong> Transaction closed on schedule despite complex regulatory requirements</li>
                                <li><strong>Zero Legal Issues:</strong> No regulatory violations or compliance problems</li>
                                <li><strong>Cost Efficiency:</strong> Optimized structure saved client over $2M in taxes and fees</li>
                                <li><strong>Seamless Integration:</strong> All regulatory approvals obtained for smooth operational transition</li>
                                <li><strong>Future-Proofed:</strong> Legal structure supports continued growth and expansion</li>
                            </ul>
                        </div>

                        <div class="bg-gold bg-opacity-10 p-6 rounded-lg border border-gold">
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Client Testimonial</h3>
                            <blockquote class="text-gray-700 italic leading-relaxed">
                                "Ahmed's expertise in corporate law and international regulations was instrumental in making this merger a success. His attention to detail and strategic thinking saved us significant time and money while ensuring complete regulatory compliance. We couldn't have achieved this without his guidance."
                            </blockquote>
                            <p class="text-gray-600 text-sm mt-3">- Egyptian Manufacturing Corp. Executive Team</p>
                        </div>
                    </div>
                `
            },
            'commercial-dispute': {
                title: 'Commercial Contract Dispute Resolution',
                subtitle: 'Strategic Negotiation and Legal Expertise',
                result: 'Favorable Settlement • Client Satisfaction • 100% Success Rate',
                content: `
                    <div class="space-y-6">
                        <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-gold">
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Case Overview</h3>
                            <p class="text-gray-700 leading-relaxed">
                                Our client, a major Egyptian technology company, found itself in a complex commercial contract dispute with an international supplier. The dispute involved breach of contract claims, intellectual property issues, and significant financial damages totaling over $10 million.
                            </p>
                        </div>

                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">The Challenge</h3>
                            <p class="text-gray-700 leading-relaxed mb-4">
                                The dispute presented complex legal challenges involving international contract law, intellectual property rights, and cross-border enforcement issues. Key challenges included:
                            </p>
                            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>Multi-jurisdictional contract interpretation and enforcement</li>
                                <li>Complex intellectual property ownership disputes</li>
                                <li>International arbitration vs. court litigation decisions</li>
                                <li>Cross-border asset recovery and enforcement</li>
                                <li>Cultural and language barriers in negotiations</li>
                            </ul>
                        </div>

                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Our Legal Strategy</h3>
                            <p class="text-gray-700 leading-relaxed mb-4">
                                We developed a comprehensive strategy that prioritized client interests while building a strong foundation for successful resolution. Our approach included:
                            </p>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Contract Analysis</h4>
                                    <p class="text-gray-600 text-sm">Thorough review of contract terms, obligations, and breach claims</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Evidence Collection</h4>
                                    <p class="text-gray-600 text-sm">Systematic documentation of all communications and performance records</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Strategic Negotiation</h4>
                                    <p class="text-gray-600 text-sm">Expert negotiation to achieve favorable settlement terms</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Alternative Dispute Resolution</h4>
                                    <p class="text-gray-600 text-sm">Explored mediation and arbitration options to avoid costly litigation</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">The Outcome</h3>
                            <p class="text-gray-700 leading-relaxed mb-4">
                                Through our strategic legal approach and expert negotiation, we achieved an exceptional result for our client:
                            </p>
                            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li><strong>Favorable Settlement:</strong> Achieved 85% of claimed damages without lengthy litigation</li>
                                <li><strong>Cost Efficiency:</strong> Avoided expensive court proceedings through strategic negotiation</li>
                                <li><strong>Intellectual Property Protection:</strong> Secured client's IP rights and future business interests</li>
                                <li><strong>Relationship Preservation:</strong> Maintained business relationship for future opportunities</li>
                                <li><strong>Timely Resolution:</strong> Case resolved within 6 months instead of years of litigation</li>
                            </ul>
                        </div>

                        <div class="bg-gold bg-opacity-10 p-6 rounded-lg border border-gold">
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Client Testimonial</h3>
                            <blockquote class="text-gray-700 italic leading-relaxed">
                                "Ahmed represented us in a complex commercial dispute that seemed impossible to resolve. His expertise in arbitration and his ability to negotiate favorable terms for our company exceeded our expectations. His 18 years of experience truly shows in his approach to legal challenges."
                            </blockquote>
                            <p class="text-gray-600 text-sm mt-3">- Tech Solutions Ltd. Managing Partner</p>
                        </div>
                    </div>
                `
            },
            'international-arbitration': {
                title: 'International Investment Arbitration',
                subtitle: 'Securing Compensation for Investment Treaty Violations',
                result: '$15M Award • Investment Protection • 100% Success Rate',
                content: `
                    <div class="space-y-6">
                        <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-gold">
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Case Overview</h3>
                            <p class="text-gray-700 leading-relaxed">
                                Our client, a foreign investor from Asia, had invested over $20 million in an Egyptian infrastructure project. The Egyptian government's subsequent regulatory changes and expropriation of assets violated international investment treaties, causing significant financial losses. We represented the investor in an international arbitration proceeding under the ICSID Convention.
                            </p>
                        </div>

                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">The Challenge</h3>
                            <p class="text-gray-700 leading-relaxed mb-4">
                                The arbitration presented complex legal challenges involving international investment law, treaty interpretation, and sovereign immunity issues. Key challenges included:
                            </p>
                            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>Proving violation of international investment treaties</li>
                                <li>Establishing jurisdiction under ICSID Convention</li>
                                <li>Calculating fair market value and compensation for expropriation</li>
                                <li>Navigating sovereign immunity and enforcement issues</li>
                                <li>Coordinating with international legal teams and experts</li>
                            </ul>
                        </div>

                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Our Legal Strategy</h3>
                            <p class="text-gray-700 leading-relaxed mb-4">
                                We assembled a specialized international arbitration team with expertise in investment law and treaty interpretation. Our comprehensive approach included:
                            </p>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Treaty Analysis</h4>
                                    <p class="text-gray-600 text-sm">Comprehensive review of applicable investment treaties and protections</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Valuation Expertise</h4>
                                    <p class="text-gray-600 text-sm">Detailed calculation of investment value and compensation</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">Evidence Collection</h4>
                                    <p class="text-gray-600 text-sm">Systematic documentation of government actions and violations</p>
                                </div>
                                <div class="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 class="font-semibold text-black mb-2">International Coordination</h4>
                                    <p class="text-gray-600 text-sm">Strategic coordination with international legal teams and experts</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">The Outcome</h3>
                            <p class="text-gray-700 leading-relaxed mb-4">
                                Through our expert legal representation and strategic approach, we achieved an exceptional result for our client:
                            </p>
                            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li><strong>Arbitral Award:</strong> $15 million compensation for investment treaty violations</li>
                                <li><strong>Legal Precedent:</strong> Established important precedent for foreign investor protection</li>
                                <li><strong>Full Recovery:</strong> Complete compensation for expropriated assets and lost profits</li>
                                <li><strong>Enforcement Success:</strong> Successful enforcement of award against sovereign state</li>
                                <li><strong>Investment Protection:</strong> Strengthened legal framework for future investments</li>
                            </ul>
                        </div>

                        <div class="bg-gold bg-opacity-10 p-6 rounded-lg border border-gold">
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Client Testimonial</h3>
                            <blockquote class="text-gray-700 italic leading-relaxed">
                                "As a foreign investor in Egypt, I was initially concerned about navigating the complex legal landscape. Ahmed's comprehensive understanding of both Egyptian and international law, combined with his expertise in investment arbitration, made the entire process seamless. His strategic approach resulted in a successful outcome that exceeded our expectations."
                            </blockquote>
                            <p class="text-gray-600 text-sm mt-3">- Asian Capital Group Investment Director</p>
                        </div>
                    </div>
                `
            },
            'ip-dispute': {
                title: 'Tech Startup IP Strategy',
                subtitle: 'Intellectual Property Protection & Licensing',
                result: 'Patents Secured • Licensing Optimized • Zero Infringement',
                content: `
                    <div class="space-y-6">
                        <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-gold">
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Case Overview</h3>
                            <p class="text-gray-700 leading-relaxed">
                                A rapidly growing fintech startup in Egypt required a comprehensive intellectual property strategy to protect its proprietary algorithms and user interface designs before seeking international Series A funding. The company faced potential infringement threats from regional competitors.
                            </p>
                        </div>
                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">The Challenge</h3>
                            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>Complex algorithmic patenting requirements in multiple jurisdictions</li>
                                <li>Protection of trade secrets during employee transitions</li>
                                <li>Drafting robust licensing agreements for B2B partners</li>
                                <li>Ensuring 'freedom to operate' in a crowded international market</li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">The Outcome</h3>
                            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li><strong>Global IP Portfolio:</strong> Secured 3 core patents and 12 registered trademarks internationally</li>
                                <li><strong>Asset Valuation:</strong> IP strategy increased company valuation by 25% during funding rounds</li>
                                <li><strong>Licensing Revenue:</strong> Established a secure licensing framework generating recurring revenue</li>
                            </ul>
                        </div>
                    </div>
                `
            },
            'real-estate': {
                title: 'Commercial Real Estate Portfolio Acquisition',
                subtitle: 'Cross-Border Investment & Title Transfer',
                result: '$100M+ Transaction • Seamless Title Transfer • Tax Optimized',
                content: `
                    <div class="space-y-6">
                        <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-gold">
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">Case Overview</h3>
                            <p class="text-gray-700 leading-relaxed">
                                Advised a European Real Estate Investment Trust (REIT) on the acquisition of a large-scale portfolio of commercial properties in Cairo. The transaction involved complex due diligence, heritage site regulations, and intricate local property registration laws.
                            </p>
                        </div>
                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">The Challenge</h3>
                            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>Navigating Egyptian property registration (Shahr El Akary) for multiple high-value assets</li>
                                <li>Ensuring compliance with foreign investment laws in the real estate sector</li>
                                <li>Structuring the acquisition to minimize double taxation</li>
                                <li>Verifying historical titles and resolving minor ownership clouds</li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="text-xl font-playfair font-bold text-black mb-3">The Outcome</h3>
                            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li><strong>Successful Closing:</strong> 100% of the portfolio assets transferred within 8 months</li>
                                <li><strong>Risk Mitigation:</strong> Zero litigation post-acquisition due to thorough due diligence</li>
                                <li><strong>Tax Savings:</strong> Optimized corporate structure saved the client approx. 12% in transaction costs</li>
                            </ul>
                        </div>
                    </div>
                `
            }
        },

        init() {
            this.modal = document.getElementById('case-study-modal');
            this.modalContent = document.getElementById('modal-content');
            this.modalTitle = document.getElementById('modal-title');
            this.modalSubtitle = document.getElementById('modal-subtitle');
            this.modalResult = document.getElementById('modal-result');

            this.setupEventListeners();
        },

        setupEventListeners() {
            // Case study card clicks
            document.querySelectorAll('.case-study-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const caseType = card.getAttribute('data-case');
                    this.openModal(caseType);
                });
            });

            // Close modal buttons
            document.getElementById('close-modal').addEventListener('click', () => {
                this.closeModal();
            });

            document.getElementById('close-modal-btn').addEventListener('click', () => {
                this.closeModal();
            });

            // Close modal on overlay click
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });

            // Close modal on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                    this.closeModal();
                }
            });
        },

        openModal(caseType) {
            const caseData = this.caseStudies[caseType];
            if (!caseData) return;

            // Update modal content
            this.modalTitle.textContent = caseData.title;
            this.modalSubtitle.textContent = caseData.subtitle;

            // Update both result elements (in header badge and footer)
            const resultElements = document.querySelectorAll('#modal-result');
            resultElements.forEach(el => {
                el.textContent = caseData.result;
            });

            this.modalContent.innerHTML = caseData.content;

            // Show modal with animation
            this.modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling

            // Trigger animation
            setTimeout(() => {
                const modalContent = this.modal.querySelector('.modal-content');
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }, 10);
        },

        closeModal() {
            const modalContent = this.modal.querySelector('.modal-content');
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');

            setTimeout(() => {
                this.modal.classList.add('hidden');
                document.body.style.overflow = ''; // Restore scrolling
            }, 300);
        }
    };

    // Initialize case study modal system
    caseStudyModal.init();

    // Enhanced Interactive Features

    // Smooth scroll with offset for fixed navbar
    function smoothScrollTo(targetId) {
        const target = document.querySelector(targetId);
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // Enhanced navigation with active section highlighting
    const allSections = document.querySelectorAll('section[id]');
    const allNavLinks = document.querySelectorAll('.nav-link');

    function updateActiveNavLink() {
        let current = '';
        allSections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        allNavLinks.forEach(link => {
            link.classList.remove('text-gold');
            link.classList.add('text-gray-300');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.remove('text-gray-300');
                link.classList.add('text-gold');
            }
        });
    }

    // Throttled scroll handler for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveNavLink, 10);
    });

    // Enhanced hover effects for practice area cards
    const practiceCards = document.querySelectorAll('#expertise .bg-white');
    practiceCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';

            // Add subtle glow effect
            const icon = this.querySelector('.w-16');
            if (icon) {
                icon.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
            }
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';

            const icon = this.querySelector('.w-16');
            if (icon) {
                icon.style.boxShadow = '';
            }
        });
    });

    // Enhanced testimonial cards with tilt effect
    const testimonialCards = document.querySelectorAll('#testimonials .bg-white');
    testimonialCards.forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Enhanced button interactions with ripple effect
    const buttons = document.querySelectorAll('.btn-gold, .btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Enhanced case study cards with 3D effect
    const caseStudyCards = document.querySelectorAll('.case-study-card');
    caseStudyCards.forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Enhanced statistics counter with more realistic animation
    function animateCounterEnhanced(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 3000; // 3 seconds for more dramatic effect
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * easeOutQuart);

            // Format the number based on the target
            if (target >= 100) {
                element.textContent = current + '+';
            } else if (target >= 10) {
                element.textContent = current + '+';
            } else {
                element.textContent = current + '+';
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    }

    // Enhanced scroll animations with intersection observer
    const enhancedObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');

                // Enhanced counter animation
                if (entry.target.classList.contains('counter')) {
                    animateCounterEnhanced(entry.target);
                }

                // Staggered animation for multiple elements
                const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
                siblings.forEach((sibling, index) => {
                    setTimeout(() => {
                        sibling.classList.add('animate');
                    }, index * 100);
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all elements for enhanced animations
    const allAnimateElements = document.querySelectorAll('.animate-on-scroll, .counter');
    allAnimateElements.forEach(el => {
        enhancedObserver.observe(el);
    });

    // Enhanced mobile menu with better animations
    const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function () {
            const isOpen = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isOpen);
        });
    }

    // Enhanced form field focus effects
    const formInputs = document.querySelectorAll('#contact-form input, #contact-form textarea, #contact-form select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('focused');
        });
    });

    // Enhanced loading states and transitions
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');

        // Animate hero section elements with stagger
        const heroElements = document.querySelectorAll('#home .animate-fade-in-left > *');
        heroElements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    });

    // Back to Top Button Functionality
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', throttle(() => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }, 100));

        // Scroll to top on click
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Cookie Consent Functionality
    const cookieConsent = document.getElementById('cookie-consent');
    const cookieAccept = document.getElementById('cookie-accept');
    const cookieDecline = document.getElementById('cookie-decline');

    // Check if user has already made a choice
    function checkCookieConsent() {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Show cookie banner after a short delay
            setTimeout(() => {
                cookieConsent.classList.add('visible');
            }, 1000);
        }
    }

    // Accept cookies
    if (cookieAccept) {
        cookieAccept.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieConsent.classList.remove('visible');
            showNotification('Thank you! Cookie preferences saved.', 'success');
        });
    }

    // Decline cookies
    if (cookieDecline) {
        cookieDecline.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            cookieConsent.classList.remove('visible');
            showNotification('Cookie preferences saved.', 'info');
        });
    }

    // Initialize cookie consent check
    checkCookieConsent();

    console.log('🚀 Enhanced website loaded with advanced interactions!');
});
