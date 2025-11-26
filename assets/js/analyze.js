 // Theme Toggle - Handled by theme.js
        // Just expose any analyze-specific theme functions here if needed

        // Input handling
        const nicheInput = document.getElementById('nicheInput');
        const startBtn = document.getElementById('startBtn');

        nicheInput.addEventListener('input', (e) => {
            startBtn.disabled = e.target.value.trim().length === 0;
        });

        nicheInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !startBtn.disabled) {
                startAnalysis();
            }
        });

        function fillExample(text) {
            nicheInput.value = text;
            startBtn.disabled = false;
            nicheInput.focus();
        }

        // Start Analysis
        startBtn.addEventListener('click', startAnalysis);

        function startAnalysis() {
            const niche = nicheInput.value.trim();
            if (!niche) return;

            // Hide input section
            document.getElementById('inputSection').classList.add('hidden');
            
            // Show progress section
            const progressSection = document.getElementById('analysisProgress');
            progressSection.classList.add('active');

            // Simulate analysis progress
            simulateAnalysis(niche);
        }

        function simulateAnalysis(niche) {
            const progressBar = document.getElementById('progressBar');
            const step1 = document.getElementById('step1');
            const step2 = document.getElementById('step2');
            const step3 = document.getElementById('step3');

            let progress = 0;

            // Step 1: Searching
            step1.classList.add('active');
            const interval1 = setInterval(() => {
                progress += 2;
                progressBar.style.width = progress + '%';
                
                if (progress >= 30) {
                    clearInterval(interval1);
                    step1.classList.remove('active');
                    step1.classList.add('completed');
                    
                    // Step 2: Filtering
                    step2.classList.add('active');
                    const interval2 = setInterval(() => {
                        progress += 2;
                        progressBar.style.width = progress + '%';
                        
                        if (progress >= 70) {
                            clearInterval(interval2);
                            step2.classList.remove('active');
                            step2.classList.add('completed');
                            
                            // Step 3: Preparing
                            step3.classList.add('active');
                            const interval3 = setInterval(() => {
                                progress += 3;
                                progressBar.style.width = progress + '%';
                                
                                if (progress >= 100) {
                                    clearInterval(interval3);
                                    step3.classList.remove('active');
                                    step3.classList.add('completed');
                                    
                                    // Show results
                                    setTimeout(() => {
                                        showResults(niche);
                                    }, 500);
                                }
                            }, 50);
                        }
                    }, 50);
                }
            }, 50);
        }

        function showResults(niche) {
            // Hide progress
            document.getElementById('analysisProgress').classList.remove('active');
            
            // Update results with niche-specific data
            updateOpportunities(niche);
            
            // Show results
            document.getElementById('resultsSection').classList.add('active');
            document.getElementById('resultsNiche').textContent = `For "${niche}"`;
            
            // Scroll to results
            setTimeout(() => {
                document.getElementById('resultsSection').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }

        async function updateOpportunities(niche) {
            try {
                // Try to fetch real opportunities from API
                const data = await API.getOpportunities(1, 3);
                
                if (data && data.opportunities && data.opportunities.length > 0) {
                    // Use real API data
                    const opps = data.opportunities.slice(0, 3);
                    opps.forEach((opp, index) => {
                        const numStr = index + 1;
                        document.getElementById(`opp${numStr}Title`).textContent = opp.title || 'Opportunity';
                        
                        const tags = [
                            document.getElementById(`tag${numStr}-1`),
                            document.getElementById(`tag${numStr}-2`),
                            document.getElementById(`tag${numStr}-3`)
                        ];
                        
                        if (opp.requirements && Array.isArray(opp.requirements)) {
                            opp.requirements.slice(0, 3).forEach((req, i) => {
                                if (tags[i]) tags[i].textContent = req;
                            });
                        }
                    });
                    return;
                }
            } catch (error) {
                console.warn('Failed to fetch real opportunities, using fallback data:', error);
            }
            
            // FALLBACK: Use mock data if API fails
            useFailbackOpportunities(niche);
        }

        function useFailbackOpportunities(niche) {
            // Simple logic to customize opportunities based on niche
            const lowercaseNiche = niche.toLowerCase();
            
            // Default titles and tags
            let opp1Title = "Senior Position";
            let opp2Title = "Mid-Level Role";
            let opp3Title = "Full-Time Position";
            let tag1 = "Skill 1", tag2 = "Skill 2", tag3 = "Skill 3";
            let description = "An exciting opportunity to join our team and make an impact.";
            let requirements = [
                "5+ years of relevant experience",
                "Strong problem-solving skills",
                "Excellent communication abilities",
                "Team player with leadership potential",
                "Passion for continuous learning"
            ];

            // Customize based on keywords (FALLBACK ONLY)
            if (lowercaseNiche.includes('react') || lowercaseNiche.includes('frontend') || lowercaseNiche.includes('developer')) {
                opp1Title = "Senior React Developer";
                opp2Title = "Frontend Engineer";
                opp3Title = "Full Stack Developer";
                tag1 = "React";
                tag2 = "TypeScript";
                tag3 = "Node.js";
                description = "We're looking for an experienced React developer to join our growing team. You'll work on cutting-edge web applications that serve millions of users worldwide. This is a unique opportunity to make a significant impact on our product and help shape the future of our engineering culture.";
                requirements = [
                    "5+ years of experience with React and modern JavaScript",
                    "Strong understanding of TypeScript and its best practices",
                    "Experience with Node.js and RESTful API development",
                    "Excellent problem-solving and communication skills",
                    "Experience with state management libraries (Redux, MobX, etc.)"
                ];
            } else if (lowercaseNiche.includes('design') || lowercaseNiche.includes('ui') || lowercaseNiche.includes('ux')) {
                opp1Title = "Senior UI/UX Designer";
                opp2Title = "Product Designer";
                opp3Title = "Visual Designer";
                tag1 = "Figma";
                tag2 = "UI/UX";
                tag3 = "Prototyping";
                description = "Join our design team to create beautiful and intuitive user experiences. You'll work closely with product managers and engineers to design products that users love. This role offers the opportunity to shape the visual identity and user experience of our platform.";
                requirements = [
                    "5+ years of UI/UX design experience",
                    "Expert proficiency in Figma and design systems",
                    "Strong portfolio demonstrating user-centered design",
                    "Experience with prototyping and user testing",
                    "Understanding of accessibility and responsive design"
                ];
            } else if (lowercaseNiche.includes('writer') || lowercaseNiche.includes('content')) {
                opp1Title = "Senior Content Writer";
                opp2Title = "Technical Writer";
                opp3Title = "Content Strategist";
                tag1 = "Writing";
                tag2 = "SEO";
                tag3 = "Content";
                description = "We're seeking a talented content writer to create engaging content for our audience. You'll write blog posts, documentation, marketing materials, and more. This role requires excellent writing skills and the ability to explain complex topics clearly.";
                requirements = [
                    "5+ years of professional writing experience",
                    "Strong portfolio of published work",
                    "Understanding of SEO best practices",
                    "Ability to write for different audiences and formats",
                    "Experience with content management systems"
                ];
            } else if (lowercaseNiche.includes('product') || lowercaseNiche.includes('manager')) {
                opp1Title = "Senior Product Manager";
                opp2Title = "Product Lead";
                opp3Title = "Product Owner";
                tag1 = "Product";
                tag2 = "Strategy";
                tag3 = "Agile";
                description = "Lead product strategy and execution for our core products. You'll work with cross-functional teams to define the product roadmap, prioritize features, and ensure successful product launches. This is a strategic role with high impact.";
                requirements = [
                    "5+ years of product management experience",
                    "Strong analytical and strategic thinking skills",
                    "Experience with Agile methodologies",
                    "Excellent stakeholder management abilities",
                    "Track record of successful product launches"
                ];
            } else if (lowercaseNiche.includes('market')) {
                opp1Title = "Marketing Manager";
                opp2Title = "Growth Marketer";
                opp3Title = "Digital Marketing Lead";
                tag1 = "Marketing";
                tag2 = "Growth";
                tag3 = "Analytics";
                description = "Drive marketing initiatives and growth strategies for our products. You'll own marketing campaigns from conception to execution, analyze performance metrics, and optimize for results. This role requires creativity and data-driven thinking.";
                requirements = [
                    "5+ years of marketing experience",
                    "Strong understanding of digital marketing channels",
                    "Experience with analytics tools and A/B testing",
                    "Excellent project management skills",
                    "Creative mindset with analytical abilities"
                ];
            } else {
                // Use the niche as-is
                opp1Title = `Senior ${niche}`;
                opp2Title = `${niche} Specialist`;
                opp3Title = `Lead ${niche}`;
                description = `Join our team as a ${niche}. This is an exciting opportunity to leverage your expertise and make a significant impact on our organization. You'll work with talented colleagues and have the chance to grow your career.`;
            }

            // Update the DOM with fallback data
            document.getElementById('opp1Title').textContent = opp1Title;
            document.getElementById('opp2Title').textContent = opp2Title;
            document.getElementById('opp3Title').textContent = opp3Title;
            document.getElementById('tag1-1').textContent = tag1;
            document.getElementById('tag1-2').textContent = tag2;
            document.getElementById('tag1-3').textContent = tag3;

            // Store data for modal (FALLBACK)
            window.currentJobData = {
                title: opp1Title,
                description: description,
                requirements: requirements,
                tags: [tag1, tag2, tag3]
            };
        }

        // Job Modal Functions
        function openJobModal() {
            const modal = document.getElementById('jobModal');
            
            // Update modal content with current job data
            if (window.currentJobData) {
                document.getElementById('modalTitle').textContent = window.currentJobData.title;
                document.getElementById('modalDescription').textContent = window.currentJobData.description;
                document.getElementById('modalTag1').textContent = window.currentJobData.tags[0];
                document.getElementById('modalTag2').textContent = window.currentJobData.tags[1];
                document.getElementById('modalTag3').textContent = window.currentJobData.tags[2];
                
                // Update requirements
                const reqList = document.getElementById('modalRequirements');
                reqList.innerHTML = window.currentJobData.requirements.map(req => `<li>${req}</li>`).join('');
            }
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeJobModal() {
            const modal = document.getElementById('jobModal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        function applyForJob() {
            // Redirect to signup/application page
            alert('To apply for this job, please create a free account!');
            redirectToSignup();
        }

        function saveJob() {
            // Redirect to signup to save
            alert('Create a free account to save jobs and get notifications!');
            redirectToSignup();
        }

        // Close modal when clicking outside
        document.getElementById('jobModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeJobModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeJobModal();
            }
        });

        function redirectToSignup() {
            // Store the niche for use after signup
            const niche = nicheInput.value.trim();
            if (niche) {
                localStorage.setItem('userNiche', niche);
            }
            // Redirect to onboarding/signup page
            window.location.href = 'onboarding.html';
        }

        function redirectToLogin() {
            // Redirect to login page (create this page or use your existing one)
            window.location.href = 'login.html';
        }