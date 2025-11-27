   // Navbar scroll effect
        const navbar = document.getElementById('navbar');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe feature cards and pricing cards
        document.querySelectorAll('.feature-card, .pricing-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });

        // Parallax effect for bubbles
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const bubbles = document.querySelectorAll('.bubble');
            
            bubbles.forEach((bubble, index) => {
                const speed = (index + 1) * 0.05;
                bubble.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('#mobileMenuBtn');
        const mobileMenu = document.querySelector('#mobileMenu');
        const mobileMenuClose = document.querySelector('#mobileMenuClose');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

        // Open mobile menu
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing immediately
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close mobile menu
        const closeMobileMenu = () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        };

        mobileMenuClose.addEventListener('click', closeMobileMenu);

        // Close menu when clicking a link
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            // Check if menu is open
            if (mobileMenu.classList.contains('active')) {
                // If click is outside the menu and not on the menu button, close it
                if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    closeMobileMenu();
                }
            }
        });

        // Add cursor glow effect
        const createCursorGlow = () => {
            const glow = document.createElement('div');
            glow.style.cssText = `
                position: fixed;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.2s ease;
                mix-blend-mode: screen;
            `;
            document.body.appendChild(glow);

            document.addEventListener('mousemove', (e) => {
                glow.style.left = (e.clientX - 200) + 'px';
                glow.style.top = (e.clientY - 200) + 'px';
            });
        };

        // Initialize cursor glow on desktop only
        if (window.innerWidth > 768) {
            createCursorGlow();
        }

        // Add magnetic effect to buttons
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-signin, .btn-signup, .pricing-button');
        
        buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.02)`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });

        // Add loading animation
        window.addEventListener('load', () => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });

        // Feature card click effect
        document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
            card.addEventListener('click', function() {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            });
        });

        // Add noise texture overlay
        const addNoiseTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            for (let i = 0; i < canvas.width; i++) {
                for (let j = 0; j < canvas.height; j++) {
                    const value = Math.random() * 255;
                    ctx.fillStyle = `rgba(${value}, ${value}, ${value}, 0.02)`;
                    ctx.fillRect(i, j, 1, 1);
                }
            }
            
            document.body.style.backgroundImage = `url(${canvas.toDataURL()})`;
            document.body.style.backgroundRepeat = 'repeat';
        };

        // Initialize noise texture
        addNoiseTexture();

        // Load Pricing Plans from API (using /api/pricing/plans endpoint)
     // Load Pricing Plans from API (using /api/pricing/plans endpoint)
        async function loadPricingSection() {
            try {
                console.log('📄 Loading pricing plans from /api/pricing/plans...');
                const pricingGrid = document.getElementById('pricingGrid');
                
                if (!pricingGrid) {
                    console.warn('Pricing grid element not found');
                    return;
                }
                
                // Use public API method (no auth required)
                const plans = await API.getPublicPricingPlans();
                
                if (plans.length === 0) {
                    console.error('No pricing plans found');
                    throw new Error('No pricing plans available');
                }
                
                console.log('✅ Pricing plans loaded:', plans.length, 'plans');
                
                // Clear loading state
                pricingGrid.innerHTML = '';
                
                // Sort plans by tier priority (free, pro, premium, ultra)
                const tierOrder = { 'free': 0, 'pro': 1, 'premium': 2, 'ultra': 3 };
                plans.sort((a, b) => {
                    const tierA = (a.tier || a.name || 'free').toLowerCase();
                    const tierB = (b.tier || b.name || 'free').toLowerCase();
                    return (tierOrder[tierA] || 99) - (tierOrder[tierB] || 99);
                });
                
                // Render each plan
                plans.forEach((plan, index) => {
                    const card = document.createElement('div');
                    const tierLower = (plan.tier || plan.name || 'free').toLowerCase();
                    card.className = 'pricing-card' + (tierLower === 'pro' ? ' featured' : '');
                    
                    // Format price based on tier
                    // Format price based on tier (using NGN)
const price = plan.price_ngn || 0;
const priceDisplay = price === 0 ? '₦0' : `₦${price.toLocaleString()}`;

// Badge text
let badge = 'Plan';
if (tierLower === 'pro') badge = 'Most Popular';
else if (tierLower === 'free') badge = 'Free Forever';
else if (tierLower === 'premium' || tierLower === 'ultra') badge = 'Maximum Power';

// Plan name - use explicit name field from backend
const tierName = plan.name || 
                (plan.tier || 'plan').charAt(0).toUpperCase() + 
                (plan.tier || 'plan').slice(1).toLowerCase();
                    
                    // Build features list - handle various data structures
                    // Build features list - backend now returns array directly
let featuresArray = [];
if (Array.isArray(plan.features)) {
    featuresArray = plan.features;
} else if (typeof plan.features === 'string') {
    featuresArray = plan.features.split(',').map(f => f.trim());
} else if (typeof plan.features === 'object' && plan.features !== null) {
    featuresArray = Object.values(plan.features);
}

const featuresHtml = featuresArray.map(feature => 
    `<li><i class="fas fa-check-circle"></i> ${feature}</li>`
).join('');

// Button text based on tier
let buttonText = 'Get Started';
if (tierLower === 'free') buttonText = 'Start Free';
else if (tierLower === 'pro') buttonText = 'Get Pro';
else if (tierLower === 'premium') buttonText = 'Get Premium';

                    
                    card.innerHTML = `
    <span class="pricing-badge">${badge}</span>
    <h3 class="pricing-name">${tierName}</h3>
    <p class="pricing-description">${plan.description || 'Powerful features for your needs'}</p>
    <div class="pricing-price">${priceDisplay}<span>/month</span></div>
    <p class="pricing-period">${tierLower === 'free' ? 'No credit card required' : 'Billed monthly in Naira'}</p>
    <ul class="pricing-features">
        ${featuresHtml}
    </ul>
    <a href="auth.html" class="pricing-button">
        ${buttonText}
    </a>
`;
                    
                    pricingGrid.appendChild(card);
                    
                    // Add animation with slight delay
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                });
                
            } catch (error) {
                console.error('❌ Failed to load pricing:', error);
                const pricingGrid = document.getElementById('pricingGrid');
                if (pricingGrid) {
                    pricingGrid.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
                            <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 16px; display: block;"></i>
                            <p>Unable to load pricing plans. Please try again later.</p>
                            <p style="font-size: 12px; margin-top: 8px; opacity: 0.5;">${error.message}</p>
                        </div>
                    `;
                }
            }
        }

        // Load pricing when page is ready
        document.addEventListener('DOMContentLoaded', () => {
            console.log('✨ Initializing landing page...');
            loadPricingSection();
            generateTestimonials();
            autoScrollTestimonials();
        });

        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');
        const body = document.body;

        // Check for saved theme preference or default to dark
        const currentTheme = localStorage.getItem('theme') || 'dark';
        if (currentTheme === 'light') {
            body.setAttribute('data-theme', 'light');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }

        themeToggle.addEventListener('click', () => {
            const theme = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            // Toggle icons
            if (theme === 'light') {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        });

        // Rotating Text Animation
        function initRotatingText() {
            const textItems = document.querySelectorAll('.text-item');
            if (textItems.length === 0) return;
            
            let currentIndex = 0;
            
            setInterval(() => {
                // Remove active class from current item
                textItems[currentIndex].classList.remove('active');
                
                // Move to next item (loop back to 0 if at end)
                currentIndex = (currentIndex + 1) % textItems.length;
                
                // Add active class to new item
                textItems[currentIndex].classList.add('active');
            }, 3000); // Change text every 3 seconds
        }

        // Initialize rotating text after DOM loads
        document.addEventListener('DOMContentLoaded', () => {
            initRotatingText();
        });

        // Testimonials Data - Real reviews reflecting actual bot features
        const testimonials = [
            {
                name: "Chinedu Okonkwo",
                niche: "Solidity Developer",
                location: "Lagos, Nigeria",
                rating: 5,
                tier: "Pro",
                platform: "Telegram",
                review: "Huntr's multi-platform scraping found me 15+ opportunities in my first week. The WhatsApp notifications are a lifesaver—I landed a $5k Solidity contract by responding in under 10 minutes. Made ₦850k in my first month!"
            },
            {
                name: "Sarah Mitchell",
                niche: "Frontend Developer",
                location: "London, UK",
                rating: 4.5,
                tier: "Pro",
                platform: "Twitter",
                review: "The semantic search AI is insane. It caught an indirect hiring post on Twitter that looked like regular discussion. Got a React contract worth $8k that I would've totally missed scrolling manually."
            },
            {
                name: "Adebayo Adeleke",
                niche: "Community Manager",
                location: "Ibadan, Nigeria",
                rating: 5,
                tier: "Free",
                platform: "Telegram & Twitter",
                review: "Even the free plan is powerful. Huntr scraped 7 platforms simultaneously and found my first paid community role for a DeFi project. Now I'm earning ₦150k/month while in school!"
            },
            {
                name: "Maria Santos",
                niche: "No-code Developer",
                location: "São Paulo, Brazil",
                rating: 4,
                tier: "Pro",
                platform: "LinkedIn & Discord",
                review: "The confidence scoring feature helped me skip low-quality spam. I focused on high-confidence opportunities and landed a no-code automation project that paid $6k. WhatsApp notifications mean I never miss fresh drops."
            },
            {
                name: "Emeka Nwankwo",
                niche: "WordPress Developer",
                location: "Enugu, Nigeria",
                rating: 5,
                tier: "Pro",
                platform: "Reddit & Telegram",
                review: "Huntr scrapes Reddit job postings I'd never find manually. The bot filtered WordPress gigs specifically for me. Got 3 projects worth ₦400k each in 2 months. This is pure ROI."
            },
            {
                name: "David Chen",
                niche: "UI/UX Designer",
                location: "Singapore",
                rating: 4.5,
                tier: "Ultra",
                platform: "All 7 Platforms",
                review: "Ultra plan's full-scale scraping across all 7 platforms (Telegram, Twitter, LinkedIn, Reddit, DexScreener, Discord, Web3.career) means I see design opportunities before competitors. Landed 3 high-paying contracts worth $22k total this month."
            },
            {
                name: "Fatima Abdullahi",
                niche: "Content Writer",
                location: "Kano, Nigeria",
                rating: 4,
                tier: "Free",
                platform: "Twitter & Telegram",
                review: "Huntr's role categorization found crypto writing gigs specifically for me. Got my first ₦100k writing contract within 48 hours. The free plan is genuinely valuable—not just a trial."
            },
            {
                name: "James Rodriguez",
                niche: "Blockchain Developer",
                location: "Buenos Aires, Argentina",
                rating: 5,
                tier: "Pro",
                platform: "DexScreener",
                review: "The bot detects fresh token launches on DexScreener—new projects always need devs and community staff. Used this feature to secure a lead dev position with a promising startup for $12k/month. Game-changing."
            },
            {
                name: "Aisha Mohammed",
                niche: "Social Media Manager",
                location: "Abuja, Nigeria",
                rating: 4.5,
                tier: "Pro",
                platform: "LinkedIn & Telegram",
                review: "Found my dream remote job managing socials for a Web3 startup through Huntr's LinkedIn scraping. The bot caught it in a private channel before it was posted elsewhere. Now earning ₦300k/month."
            },
            {
                name: "Alex Turner",
                niche: "Fullstack Engineer",
                location: "Melbourne, Australia",
                rating: 5,
                tier: "Ultra",
                platform: "All Platforms",
                review: "Ultra tier's custom keyword lists and unlimited scraping let me track specific tech stacks. I find Rust and Solana opportunities instantly. The semantic AI filters spam perfectly—only real, verified gigs. ₦2.5M earned in 4 months."
            },
            {
                name: "Zainab Hassan",
                niche: "Graphic Designer",
                location: "Nairobi, Kenya",
                rating: 5,
                tier: "Pro",
                platform: "Twitter & Discord",
                review: "The urgency detection feature shows me which projects need designers ASAP. I respond within minutes of Huntr's WhatsApp alert and close deals. Three design contracts worth $15k total in 6 weeks."
            },
            {
                name: "Carlos Mendez",
                niche: "Copywriter",
                location: "Mexico City, Mexico",
                rating: 4,
                tier: "Free",
                platform: "Reddit & Telegram",
                review: "Huntr's smart filtering removes 90% of spam bots and fake gigs. I only see real, paid opportunities. Got 5 copywriting contracts in my first month earning $8k. Free plan is legit."
            },
            {
                name: "Priya Patel",
                niche: "Data Scientist",
                location: "Bangalore, India",
                rating: 4.5,
                tier: "Pro",
                platform: "LinkedIn & Web3.career",
                review: "The bot's role categorization found data science opportunities I didn't know existed. Pro plan's WhatsApp instant notifications mean I apply first. Landed a $10k/month remote role within 2 weeks."
            },
            {
                name: "Tunde Adeyemi",
                niche: "Marketing Manager",
                location: "Lagos, Nigeria",
                rating: 5,
                tier: "Pro",
                platform: "Twitter & Telegram",
                review: "Huntr found crypto marketing roles across 7 platforms simultaneously. The semantic AI understood indirect hiring hints ('looking for marketing expertise'). Got ₦500k project and now earning ₦200k/month retainer."
            },
            {
                name: "Sophie Laurent",
                niche: "Product Manager",
                location: "Paris, France",
                rating: 4,
                tier: "Ultra",
                platform: "All Platforms",
                review: "As a product manager, I use Huntr's advanced filtering to find startups looking for PM expertise. The confidence scoring tells me which are legit. Landed my dream role: remote PM at a Series A startup for $15k/month."
            }
        ];

        // Generate Testimonial Cards
        function generateTestimonials() {
            const container = document.getElementById('testimonialsScroll');
            if (!container) return;
            
            testimonials.forEach(testimonial => {
                const card = document.createElement('div');
                card.className = 'testimonial-card';
                
                // Generate stars
                const fullStars = Math.floor(testimonial.rating);
                const hasHalfStar = testimonial.rating % 1 !== 0;
                let starsHtml = '';
                
                for (let i = 0; i < fullStars; i++) {
                    starsHtml += '<i class="fas fa-star"></i>';
                }
                if (hasHalfStar) {
                    starsHtml += '<i class="fas fa-star-half-alt half"></i>';
                }
                const emptyStars = 5 - Math.ceil(testimonial.rating);
                for (let i = 0; i < emptyStars; i++) {
                    starsHtml += '<i class="far fa-star"></i>';
                }
                
                card.innerHTML = `
                    <div class="testimonial-header">
                        <div class="testimonial-info">
                            <div class="testimonial-name">${testimonial.name}</div>
                            <div class="testimonial-niche">${testimonial.niche}</div>
                            <div class="testimonial-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${testimonial.location}
                            </div>
                        </div>
                        <div class="testimonial-rating">
                            ${starsHtml}
                        </div>
                    </div>
                    <div class="testimonial-body">
                        "${testimonial.review}"
                    </div>
                    <div class="testimonial-footer">
                        <div class="testimonial-tier">
                            <i class="fas fa-crown"></i>
                            ${testimonial.tier} Plan
                        </div>
                        <div class="testimonial-platform">via ${testimonial.platform}</div>
                    </div>
                `;
                
                container.appendChild(card);
            });
            
            // Duplicate testimonials for seamless loop
            testimonials.forEach(testimonial => {
                const card = document.createElement('div');
                card.className = 'testimonial-card';
                
                const fullStars = Math.floor(testimonial.rating);
                const hasHalfStar = testimonial.rating % 1 !== 0;
                let starsHtml = '';
                
                for (let i = 0; i < fullStars; i++) {
                    starsHtml += '<i class="fas fa-star"></i>';
                }
                if (hasHalfStar) {
                    starsHtml += '<i class="fas fa-star-half-alt half"></i>';
                }
                const emptyStars = 5 - Math.ceil(testimonial.rating);
                for (let i = 0; i < emptyStars; i++) {
                    starsHtml += '<i class="far fa-star"></i>';
                }
                
                card.innerHTML = `
                    <div class="testimonial-header">
                        <div class="testimonial-info">
                            <div class="testimonial-name">${testimonial.name}</div>
                            <div class="testimonial-niche">${testimonial.niche}</div>
                            <div class="testimonial-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${testimonial.location}
                            </div>
                        </div>
                        <div class="testimonial-rating">
                            ${starsHtml}
                        </div>
                    </div>
                    <div class="testimonial-body">
                        "${testimonial.review}"
                    </div>
                    <div class="testimonial-footer">
                        <div class="testimonial-tier">
                            <i class="fas fa-crown"></i>
                            ${testimonial.tier} Plan
                        </div>
                        <div class="testimonial-platform">via ${testimonial.platform}</div>
                    </div>
                `;
                
                container.appendChild(card);
            });
        }

        // Auto-scroll testimonials with smooth continuous scrolling
        let scrollPosition = 0;
        let isAutoScrolling = true;
        let isManualScrolling = false;
        let animationFrameId = null;
        let resumeScrollTimeout = null;
        const testimonialsScroll = document.getElementById('testimonialsScroll');

        function autoScrollTestimonials() {
            if (!isAutoScrolling || !testimonialsScroll || isManualScrolling) {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                return;
            }
            
            // Smooth continuous scroll - 1 pixel per frame (60fps = 60px/sec)
            scrollPosition += 1;
            testimonialsScroll.scrollLeft = scrollPosition;
            
            // Reset scroll position when reaching end (seamless loop with duplicated content)
            if (scrollPosition >= testimonialsScroll.scrollWidth / 2) {
                scrollPosition = 0;
                testimonialsScroll.scrollLeft = 0;
            }
            
            animationFrameId = requestAnimationFrame(autoScrollTestimonials);
        }

        // Pause auto-scroll on hover or manual scroll with improved timing
        if (testimonialsScroll) {
            // Mouse hover
            testimonialsScroll.addEventListener('mouseenter', () => {
                isManualScrolling = true;
                isAutoScrolling = false;
            });

            testimonialsScroll.addEventListener('mouseleave', () => {
                isManualScrolling = false;
                // Resume after 1.5-2 seconds of inactivity
                clearTimeout(resumeScrollTimeout);
                resumeScrollTimeout = setTimeout(() => {
                    scrollPosition = testimonialsScroll.scrollLeft;
                    isAutoScrolling = true;
                    autoScrollTestimonials();
                }, 1500);
            });

            // Track manual scroll
            let scrollTimeout;
            testimonialsScroll.addEventListener('scroll', () => {
                isAutoScrolling = false;
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    scrollPosition = testimonialsScroll.scrollLeft;
                    isAutoScrolling = true;
                    autoScrollTestimonials();
                }, 1800);
            });

            // Manual drag scrolling with mouse
            let isDown = false;
            let startX;
            let scrollLeft;

            testimonialsScroll.addEventListener('mousedown', (e) => {
                isDown = true;
                isManualScrolling = true;
                isAutoScrolling = false;
                testimonialsScroll.style.cursor = 'grabbing';
                startX = e.pageX - testimonialsScroll.offsetLeft;
                scrollLeft = testimonialsScroll.scrollLeft;
            });

            testimonialsScroll.addEventListener('mouseleave', () => {
                isDown = false;
                testimonialsScroll.style.cursor = 'grab';
                if (isManualScrolling) {
                    clearTimeout(resumeScrollTimeout);
                    resumeScrollTimeout = setTimeout(() => {
                        isManualScrolling = false;
                        scrollPosition = testimonialsScroll.scrollLeft;
                        isAutoScrolling = true;
                        autoScrollTestimonials();
                    }, 2000);
                }
            });

            testimonialsScroll.addEventListener('mouseup', () => {
                isDown = false;
                testimonialsScroll.style.cursor = 'grab';
                if (isManualScrolling) {
                    clearTimeout(resumeScrollTimeout);
                    resumeScrollTimeout = setTimeout(() => {
                        isManualScrolling = false;
                        scrollPosition = testimonialsScroll.scrollLeft;
                        isAutoScrolling = true;
                        autoScrollTestimonials();
                    }, 2000);
                }
            });

            testimonialsScroll.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - testimonialsScroll.offsetLeft;
                const walk = (x - startX) * 2;
                testimonialsScroll.scrollLeft = scrollLeft - walk;
            });

            // Touch support for mobile devices
            let touchStartX = 0;
            let touchStartScrollLeft = 0;

            testimonialsScroll.addEventListener('touchstart', (e) => {
                isManualScrolling = true;
                isAutoScrolling = false;
                touchStartX = e.touches[0].pageX;
                touchStartScrollLeft = testimonialsScroll.scrollLeft;
            }, false);

            testimonialsScroll.addEventListener('touchmove', (e) => {
                if (!isManualScrolling) return;
                e.preventDefault();
                const x = e.touches[0].pageX;
                const walk = (touchStartX - x) * 1.5;
                testimonialsScroll.scrollLeft = touchStartScrollLeft + walk;
            }, false);

            testimonialsScroll.addEventListener('touchend', (e) => {
                isManualScrolling = false;
                // Resume after 1.5-2 seconds
                clearTimeout(resumeScrollTimeout);
                resumeScrollTimeout = setTimeout(() => {
                    scrollPosition = testimonialsScroll.scrollLeft;
                    isAutoScrolling = true;
                    autoScrollTestimonials();
                }, 1500);
            }, false);
        }

        // Animated counter for stats
        function animateCounter(element, target, duration = 2000) {
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 16);
        }

        // Animate stats when they come into view
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const gigsElement = document.getElementById('gigsMatched');
                    if (gigsElement && !gigsElement.classList.contains('animated')) {
                        animateCounter(gigsElement, 47);
                        gigsElement.classList.add('animated');
                    }
                }
            });
        }, { threshold: 0.5 });

        const statsBar = document.querySelector('.stats-bar');
        if (statsBar) {
            statsObserver.observe(statsBar);
        }

        // First Visit Modal Logic
        function initFirstVisitModal() {
            const modal = document.getElementById('firstVisitModal');
            const cancelBtn = document.getElementById('modalCancel');
            const swearBtn = document.getElementById('modalSwear');
            
            // Check if user has visited before
            const hasVisited = localStorage.getItem('hasVisitedBefore');
            
            if (!hasVisited) {
                // Show modal after a brief delay for better UX
                setTimeout(() => {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }, 1000);
            }
            
            // Function to close modal
            function closeModal() {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                localStorage.setItem('hasVisitedBefore', 'true');
            }
            
            // Event listeners for both buttons
            cancelBtn.addEventListener('click', closeModal);
            swearBtn.addEventListener('click', closeModal);
            
            // Close on overlay click (optional - remove if you don't want this)
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // Close on ESC key (optional - remove if you don't want this)
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeModal();
                }
            });
        }

        // Initialize modal on page load
        document.addEventListener('DOMContentLoaded', () => {
            console.log('✨ Initializing landing page...');
            loadPricingSection();
            generateTestimonials();
            autoScrollTestimonials();
            initFirstVisitModal(); // Initialize the first visit modal
        });