// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("SPORTYFY.LIVE script loaded - Mamba Edition 🏆");
    
    // ==============================================
    // USER SELECTIONS TRACKING
    // ==============================================
    const userSelections = {
        sport: null,
        goal: null,
        location: null
    };

    // ==============================================
    // QUIZ NAVIGATION
    // ==============================================
    const steps = document.querySelectorAll(".quiz-step");
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const progressDots = document.querySelectorAll(".quiz-progress span");
    let currentStep = 1;

    // Player types for results
    const playerTypes = [
        {
            type: "RISING STAR",
            description: "You're ready to showcase your skills and build your brand. SPORTYFY.LIVE is perfect for athletes like you who want to be seen and recognized!",
        },
        {
            type: "COMMUNITY CHAMPION",
            description: "You're all about bringing people together through sports. With SPORTYFY.LIVE, you'll create a following that celebrates your game!",
        },
        {
            type: "MONETIZATION MASTER",
            description: "You know your worth! SPORTYFY.LIVE will help you earn from your talent and connect with sponsors who value your skills.",
        },
        {
            type: "SKILLS TRACKER",
            description: "You're focused on improvement and progress. SPORTYFY.LIVE will help you document your journey and analyze your growth.",
        }
    ];

    // Add this to your app.js to show a demo recording capability
function initializeStreamDemo() {
    const demoBtn = document.getElementById('stream-demo-btn');
    if (!demoBtn) return;
    
    demoBtn.addEventListener('click', function() {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support camera access!');
        return;
      }
      
      // Create video preview element
      const videoContainer = document.createElement('div');
      videoContainer.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
      videoContainer.innerHTML = `
        <div class="relative bg-sporty-black p-6 rounded-lg max-w-2xl w-full">
          <button class="absolute top-2 right-2 text-white text-xl" id="close-stream">&times;</button>
          <h3 class="text-2xl font-bold text-center mb-4">SPORTYFY.LIVE STREAM DEMO</h3>
          <video id="stream-preview" class="w-full aspect-video bg-black mb-4" autoplay muted></video>
          <div class="flex justify-center space-x-4">
            <button id="start-recording" class="bg-sporty-red text-white px-6 py-2 rounded">START RECORDING</button>
            <button id="stop-recording" class="bg-gray-700 text-white px-6 py-2 rounded" disabled>STOP RECORDING</button>
          </div>
          <p class="text-gray-400 text-sm mt-4 text-center">This is a demo. Recordings are not saved yet.</p>
        </div>
      `;
      
      document.body.appendChild(videoContainer);
      
      // Get video element
      const videoElement = document.getElementById('stream-preview');
      const startRecordBtn = document.getElementById('start-recording');
      const stopRecordBtn = document.getElementById('stop-recording');
      const closeBtn = document.getElementById('close-stream');
      
      // Set up media stream
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          videoElement.srcObject = stream;
          
          // Handle recording
          let mediaRecorder;
          let recordedChunks = [];
          
          startRecordBtn.addEventListener('click', function() {
            recordedChunks = [];
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = function(e) {
              if (e.data.size > 0) {
                recordedChunks.push(e.data);
              }
            };
            
            mediaRecorder.onstop = function() {
              // For demo, just show alert (this is where Cloudflare Stream API would be called)
              alert('Recording complete! In the full version, this would be uploaded to SPORTYFY.LIVE.');
              
              // Reset buttons
              startRecordBtn.disabled = false;
              stopRecordBtn.disabled = true;
            };
            
            mediaRecorder.start();
            startRecordBtn.disabled = true;
            stopRecordBtn.disabled = false;
          });
          
          stopRecordBtn.addEventListener('click', function() {
            mediaRecorder.stop();
          });
          
          closeBtn.addEventListener('click', function() {
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            videoContainer.remove();
          });
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          alert('Could not access camera. Please check permissions.');
          videoContainer.remove();
        });
    });
  }

    function updateStep() {
        steps.forEach((step) => step.classList.add("hidden"));
        steps[currentStep - 1].classList.remove("hidden");

        // Update progress dots
        progressDots.forEach((dot, index) => {
            if (index < currentStep) {
                dot.classList.remove("bg-gray-600");
                dot.classList.add("bg-sporty-red");
            } else {
                dot.classList.remove("bg-sporty-red");
                dot.classList.add("bg-gray-600");
            }
        });

        // Show/hide prev button
        if (currentStep > 1) {
            prevBtn.classList.remove("hidden");
        } else {
            prevBtn.classList.add("hidden");
        }

        // Update next button text for final step
        if (currentStep === steps.length - 1) {
            nextBtn.innerHTML = 'See Results <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>';
        } else if (currentStep === steps.length) {
            nextBtn.classList.add("hidden");
        } else {
            nextBtn.innerHTML = 'Next <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>';
            nextBtn.classList.remove("hidden");
        }
    }

    // Validate current step
    function validateCurrentStep() {
        // Get active step
        const activeStep = document.querySelector('.quiz-step:not(.hidden)');
        const stepNumber = parseInt(activeStep.dataset.step);
        
        console.log(`Validating step ${stepNumber}...`);
        console.log(`Current selections:`, userSelections);
        
        // Check if a selection was made
        let isValid = false;
        
        switch(stepNumber) {
            case 1:
                isValid = userSelections.sport !== null;
                break;
            case 2:
                isValid = userSelections.goal !== null;
                break;
            case 3:
                isValid = userSelections.location !== null;
                break;
            case 4:
                isValid = true; // Form validation handled separately
                break;
        }
        
        console.log(`Step ${stepNumber} validation result: ${isValid}`);
        
        if (!isValid) {
            showValidationError(stepNumber);
        }
        
        return isValid;
    }
    
    // Show validation error
    function showValidationError(step) {
        // Find current step
        const stepElement = document.querySelector(`.quiz-step[data-step="${step}"]`);
        
        // Check if error message already exists
        if (!stepElement.querySelector('.validation-error')) {
            // Create motivational error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'validation-error text-sporty-red text-sm mt-4 animate-pulse';
            
            switch(step) {
                case 1:
                    errorMsg.innerHTML = '⚠️ CHAMPIONS MAKE CHOICES! Select your sport to continue.';
                    break;
                case 2:
                    errorMsg.innerHTML = '⚠️ GREATNESS HAS A PURPOSE! Choose your goal to proceed.';
                    break;
                case 3:
                    errorMsg.innerHTML = "⚠️ LEGENDS START SOMEWHERE! Tell us where you're based.";
                    break;
            }
            
            // Add error message to step
            const navElement = document.querySelector('.quiz-nav');
            navElement.parentNode.insertBefore(errorMsg, navElement);
            
            // Flash options to draw attention
            stepElement.querySelectorAll('.quiz-option').forEach(option => {
                option.classList.add('border-gray-700', 'animate-pulse');
                
                setTimeout(() => {
                    option.classList.remove('border-gray-700', 'animate-pulse');
                }, 1000);
            });
            
            // Remove error after 3 seconds
            setTimeout(() => {
                if (errorMsg.parentNode) {
                    errorMsg.parentNode.removeChild(errorMsg);
                }
            }, 3000);
        }
    }

    // Event listeners for quiz options
    document.querySelectorAll(".quiz-option").forEach((option) => {
        option.addEventListener("click", function() {
            // Remove selection from siblings
            const parent = this.parentElement;
            parent.querySelectorAll(".quiz-option").forEach((opt) => {
                opt.classList.remove("border-sporty-red");
                opt.classList.add("border-transparent");
            });

            // Add selection to clicked option
            this.classList.remove("border-transparent");
            this.classList.add("border-sporty-red");
            
            // Store selection based on step
            const stepElement = this.closest('.quiz-step');
            const stepNumber = parseInt(stepElement.dataset.step);
            
            // Get option value (data attribute or "selected" if none)
            const value = this.dataset.value || 'selected';
            
            switch(stepNumber) {
                case 1:
                    userSelections.sport = value;
                    console.log("Sport selected:", value);
                    break;
                case 2:
                    userSelections.goal = value;
                    console.log("Goal selected:", value);
                    break;
                case 3:
                    userSelections.location = value;
                    console.log("Location selected:", value);
                    break;
            }
            
            // Handle "Other" options with input fields
            const otherInput = this.querySelector('input[data-other-input]');
            if (otherInput) {
                const field = otherInput.dataset.otherInput;
                if (otherInput.value.trim()) {
                    // Already has value, update userSelections
                    if (field === 'sport') userSelections.sport = otherInput.value.trim();
                    if (field === 'goal') userSelections.goal = otherInput.value.trim();
                    if (field === 'location') userSelections.location = otherInput.value.trim();
                } else {
                    // Focus the input if empty
                    otherInput.focus();
                    
                    // Watch for input changes
                    otherInput.addEventListener('input', function() {
                        if (this.value.trim()) {
                            // Update the right selection when user types
                            if (field === 'sport') {
                                userSelections.sport = this.value.trim();
                                console.log("Sport text entered:", this.value.trim());
                            }
                            if (field === 'goal') {
                                userSelections.goal = this.value.trim();
                                console.log("Goal text entered:", this.value.trim());
                            }
                            if (field === 'location') {
                                userSelections.location = this.value.trim();
                                console.log("Location text entered:", this.value.trim());
                            }
                        } else {
                            // Clear if empty
                            if (field === 'sport') userSelections.sport = null;
                            if (field === 'goal') userSelections.goal = null;
                            if (field === 'location') userSelections.location = null;
                        }
                    });
                }
            }
        });
    });

    // Handle "Other" input direct clicks
    document.querySelectorAll('input[data-other-input]').forEach(input => {
        input.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent bubbling to parent
        });
        
        input.addEventListener('input', function() {
            const field = this.dataset.otherInput;
            const stepElement = this.closest('.quiz-step');
            
            if (this.value.trim()) {
                // Store the input value in the right selection
                if (field === 'sport') {
                    userSelections.sport = this.value.trim();
                    console.log("Sport text entered:", this.value.trim());
                }
                if (field === 'goal') {
                    userSelections.goal = this.value.trim();
                    console.log("Goal text entered:", this.value.trim());
                }
                if (field === 'location') {
                    userSelections.location = this.value.trim();
                    console.log("Location text entered:", this.value.trim());
                }
                
                // Also select the parent option visually
                stepElement.querySelectorAll('.quiz-option').forEach(opt => {
                    opt.classList.remove('border-sporty-red');
                    opt.classList.add('border-transparent');
                });
                
                this.closest('.quiz-option').classList.remove('border-transparent');
                this.closest('.quiz-option').classList.add('border-sporty-red');
            }
        });
    });

    // CRITICAL FIX: Completely replace the Next button event handler
    // Remove any existing event listeners by cloning and replacing the button
    const oldNextBtn = document.getElementById("next-btn");
    const newNextBtn = oldNextBtn.cloneNode(true);
    oldNextBtn.parentNode.replaceChild(newNextBtn, oldNextBtn);
    
    // Add the new event listener with proper validation
    newNextBtn.addEventListener("click", function(e) {
        console.log("Next button clicked");
        
        // Only proceed if current step is valid
        if (!validateCurrentStep()) {
            console.log("Validation failed! Stopping navigation.");
            return false;
        }
        
        console.log("Validation passed! Proceeding to next step.");
        
        if (currentStep < steps.length) {
            currentStep++;
            updateStep();
            
            // If final step, set player type result
            if (currentStep === steps.length) {
                // Set player type based on selections (simplified for demo)
                let playerType = "RISING STAR";
                
                if (userSelections.goal === 'money') {
                    playerType = "MONETIZATION MASTER";
                } else if (userSelections.goal === 'community') {
                    playerType = "COMMUNITY CHAMPION";
                } else if (userSelections.goal === 'discover') {
                    playerType = "RISING STAR";
                }
                
                console.log("Setting player type:", playerType);
                
                // Update player description
                const playerDescription = document.getElementById('player-description');
                if (playerDescription) {
                    // Keep default text or customize based on selections
                }
            }
        }
    });

    // Previous button
    prevBtn.addEventListener("click", function() {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });

    // Form validation
    const waitlistForm = document.getElementById('waitlist-form');
    if (waitlistForm) {
        // Replace your form submission handler with this
        // Replace your form submission handler with this CHAMPIONSHIP-LEVEL CODE
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Define isValid and validate form fields
            let isValid = true;
            
            // Get form values
            const name = this.querySelector('input[name="name"]').value.trim();
            const email = this.querySelector('input[name="email"]').value.trim();
            const phone = this.querySelector('input[name="phone"]').value.trim();
            
            // Basic validation - like defense, NEVER SKIP THIS
            if (!name || !email || !phone) {
                isValid = false;
                
                // Show an error message with MAMBA INTENSITY
                const errorMsg = document.createElement('div');
                errorMsg.className = 'text-sporty-red text-sm mt-2 mb-4 font-bold';
                errorMsg.innerHTML = '⚠️ SOFT! FILL OUT ALL FIELDS TO JOIN THE REVOLUTION!';
                
                this.querySelector('button[type="submit"]').parentNode.before(errorMsg);
                
                setTimeout(() => {
                    if (errorMsg.parentNode) {
                        errorMsg.parentNode.removeChild(errorMsg);
                    }
                }, 3000);
            }
            
            // HERE'S THE FIX - Only proceed if validation passes
            if (!isValid) return;
            
            // Continue with loading state and form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...';
            submitBtn.disabled = true;
            
            // Format data for the API
            const formData = {
            user: {
                name: name,
                email: email,
                phone: phone,
                sport: userSelections.sport,
                goal: userSelections.goal,
                location: userSelections.location
            }
            };
            
            // Send to API
            // API Endpoint: POST /api/v1/waitlist/create
            // Backend: app/controllers/api/v1/waitlist_controller.rb
            // Documentation: See API-DOCUMENTATION.md
            fetch('https://api.sportyfy.live/api/v1/waitlist/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
            // Display success message
            this.innerHTML = `
                <div class="form-success md:col-span-2">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="success-icon">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3 class="success-title">ACCESS REQUEST SUBMITTED</h3>
                    <p class="success-message">Thank you, ${formData.user.name}. You're in the SPORTYFY revolution! We'll send updates to ${formData.user.email}.</p>
                </div>
            `;
            })
            .catch(error => {
            // Handle error
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'text-sporty-red text-sm mt-2 mb-4';
            errorMsg.innerHTML = '⚠️ Something went wrong! Please try again.';
            
            this.querySelector('button[type="submit"]').parentNode.before(errorMsg);
            
            setTimeout(() => {
                if (errorMsg.parentNode) {
                errorMsg.parentNode.removeChild(errorMsg);
                }
            }, 3000);
            
            console.error('Error:', error);
            });
        });
    }

    // ==============================================
    // LIVE COUNTER ANIMATIONS
    // ==============================================
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min(
                (timestamp - startTimestamp) / duration,
                1
            );
            const value = Math.floor(progress * (end - start) + start);
            obj.innerHTML = value.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Animate viewers
    const viewersCounter = document.getElementById("viewersCounter");
    if (viewersCounter) {
        animateValue(viewersCounter, 1550, 1730, 2000);
    }

    // Animate earnings with currency symbol
    const earningsCounter = document.getElementById("earningsCounter");
    if (earningsCounter) {
        let startTimestamp = null;
        const startValue = 5000;
        const endValue = 7941;
        const duration = 2500;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min(
                (timestamp - startTimestamp) / duration,
                1
            );
            const value = Math.floor(
                progress * (endValue - startValue) + startValue
            );
            earningsCounter.innerHTML = "₹" + value.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // ==============================================
    // SCROLL ANIMATIONS
    // ==============================================
    const scrollElements = document.querySelectorAll(".scroll-reveal");

    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <=
            (window.innerHeight || document.documentElement.clientHeight) /
                dividend
        );
    };

    const displayScrollElement = (element) => {
        element.classList.add("scrolled");
    };

    const hideScrollElement = (element) => {
        element.classList.remove("scrolled");
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.25)) {
                displayScrollElement(el);
            } else {
                hideScrollElement(el);
            }
        });
    };

    window.addEventListener("scroll", handleScrollAnimation);

    // Initial check on page load
    handleScrollAnimation();

    // ==============================================
    // PARALLAX EFFECTS
    // ==============================================
    window.addEventListener("mousemove", function (e) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

        const parallaxElements = document.querySelectorAll(".blob");
        parallaxElements.forEach((element) => {
            element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    // ==============================================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ==============================================
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();

            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for navbar height
                    behavior: "smooth",
                });
            }
        });
    });

    // ==============================================
    // NAVBAR SCROLL BEHAVIOR
    // ==============================================
    let lastScrollTop = 0;
    const navbar = document.querySelector("nav");

    window.addEventListener("scroll", function () {
        const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down & past the hero
            navbar.style.transform = "translateY(-100%)";
        } else {
            // Scrolling up or at the top
            navbar.style.transform = "translateY(0)";
        }

        lastScrollTop = scrollTop;
    });

    // ==============================================
    // LIVE COUNTER UPDATES SIMULATION
    // ==============================================
    setInterval(() => {
        const viewersCounter = document.getElementById("viewersCounter");
        const earningsCounter = document.getElementById("earningsCounter");

        if (viewersCounter && earningsCounter) {
            // Get current values
            let currentViewers = parseInt(
                viewersCounter.textContent.replace(/,/g, "")
            );
            let currentEarnings = parseInt(
                earningsCounter.textContent.replace(/₹|,/g, "")
            );

            // Random change
            const viewersChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const earningsChange = Math.floor(Math.random() * 30); // 0 to 29

            // Apply changes
            currentViewers = Math.max(1500, currentViewers + viewersChange);
            currentEarnings = currentEarnings + earningsChange;

            // Update display
            viewersCounter.textContent = currentViewers.toLocaleString();
            earningsCounter.textContent = "₹" + currentEarnings.toLocaleString();
        }
    }, 5000); // Update every 5 seconds

    // Initialize - show first step of quiz
    updateStep();
    
    console.log("SPORTYFY.LIVE initialization complete - Mamba Mode Activated! 🐍");
});