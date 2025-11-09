// script.js (UPDATED: Fetches Real User Email/Phone)

// Global variables to manage state
let propertiesData = [];
let currentUserId = localStorage.getItem("studentstay_user_id");

/**
 * ===================================================
 * MODAL & UI CONTROL FUNCTIONS
 * ===================================================
 */

function openModal(type) {
  const modal = document.getElementById(type + "Modal");
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(type) {
  const modal = document.getElementById(type + "Modal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function switchModal(closeType, openType) {
  closeModal(closeType);
  openModal(openType);
}

// Close modal & dropdown when clicking outside
window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    event.target.classList.remove("active");
  }

  // Close dropdown if user clicks outside the button/menu
  const dropdownMenu = document.getElementById("user-menu");
  const userProfileBtn = document.getElementById("user-profile-btn");

  if (dropdownMenu && userProfileBtn) {
    if (
      !userProfileBtn.contains(event.target) &&
      !dropdownMenu.contains(event.target) &&
      dropdownMenu.style.display === "block"
    ) {
      dropdownMenu.style.display = "none";
    }
  }
};

function toggleDropdown(e) {
  if (e) e.preventDefault();
  const menu = document.getElementById("user-menu");
  if (menu) {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  }
}

function updateAuthUI(userName) {
  const loginRegisterButton = document.getElementById("login-register-btn");
  const userDropdownContainer = document.getElementById(
    "user-dropdown-container"
  );
  // NEW: Get the 'How it Works' link
  const howItWorksLink = document.getElementById("nav-how-it-works");

  if (userName) {
    // Show logged-in view
    document.body.classList.add("logged-in-view");
    if (loginRegisterButton) loginRegisterButton.style.display = "none";
    if (userDropdownContainer) userDropdownContainer.style.display = "block"; // Show the new container

    // NEW: Hide 'How it Works' link for logged-in users
    if (howItWorksLink) howItWorksLink.style.display = "none";

    // FIX: Show only the user's name (first word)
    document.getElementById("user-display-name").textContent =
      userName.split(" ")[0] || "User";
  } else {
    // Show logged-out view
    document.body.classList.remove("logged-in-view");
    if (loginRegisterButton) loginRegisterButton.style.display = "inline-block";
    if (userDropdownContainer) userDropdownContainer.style.display = "none"; // Hide the container

    // NEW: Show 'How it Works' link for logged-out users
    if (howItWorksLink) howItWorksLink.style.display = "inline";
  }
}

// --- NEW FUNCTION TO NAVIGATE TO HOME/DEFAULT VIEW ---
function navigateToHome() {
  // Reset all hidden containers
  const dashboardSection = document.getElementById("user-dashboard");
  const bookingConfirmationSection = document.getElementById(
    "booking-confirmation-page"
  );
  const propertiesSection = document.getElementById("properties");

  if (dashboardSection) dashboardSection.classList.add("hidden");
  if (bookingConfirmationSection)
    bookingConfirmationSection.classList.add("hidden");

  // Ensure the main rooms section is visible
  if (propertiesSection) propertiesSection.classList.remove("hidden");

  // Render the default list of properties (if data is loaded)
  if (propertiesData.length > 0) {
    renderProperties(propertiesData);
  }

  // Scroll to the top of the hero section
  window.location.hash = "#home";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
// ----------------------------------------------------

// --- NEW FUNCTION TO NAVIGATE TO MAIN SECTIONS (Rooms, How it Works) ---
function navigateToMainSection(sectionId) {
  // 1. Reset all non-main content views
  const dashboardSection = document.getElementById("user-dashboard");
  const bookingConfirmationSection = document.getElementById(
    "booking-confirmation-page"
  );
  const propertiesSection = document.getElementById("properties"); // This section must be visible for #properties and #how

  if (dashboardSection) dashboardSection.classList.add("hidden");
  if (bookingConfirmationSection)
    bookingConfirmationSection.classList.add("hidden");

  // 2. Ensure the main properties section (which contains the How It Works section beneath it) is visible
  if (propertiesSection) propertiesSection.classList.remove("hidden");

  // 3. Scroll to the target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    window.location.hash = `#${sectionId}`; // Update URL hash
  }
}
// -----------------------------------------------------------------------

function createPropertyCardHTML(property) {
  const amenities = [
    {
      icon: "🛏️",
      label: `${property.beds} Beds`,
      condition: property.beds > 0,
    },
    { icon: "🍽️", label: "Food", condition: property.food },
    { icon: "📶", label: "WiFi", condition: property.wifi },
    { icon: "🧺", label: "Laundry", condition: property.laundry },
  ];

  const detailsHTML = amenities
    .filter((a) => a.condition)
    .map((a) => `<span class="property-detail">${a.icon} ${a.label}</span>`)
    .join("");

  return `
    <div class="property-card">
      <div class="property-image" style="background-image: url('${
        property.image
      }');">
        <span class="property-badge">${property.sharing}</span>
      </div>
      <div class="property-info">
        <h3>${property.name}</h3>
        
        <div class="rating-details">
            <span class="rating">
                ${"★".repeat(Math.floor(property.rating))} (${property.rating})
            </span>
            <span class="review-count">| ${property.reviews}</span>
            <span class="distance">| ${property.distance}</span>
        </div>
        
        <p class="location">📍 ${property.landmark}</p>
        
        <div class="property-details">${detailsHTML}</div>
        <p class="price">${property.price}<span>/month</span></p>
        <button 
            class="btn btn-primary" 
            style="width: 100%"
            onclick="handleBookNow(event)"
            data-id="${property.id}"
            data-name="${property.name}"
            data-sharing="${property.sharing}"
            data-advance="${property.advance}"
        >
          BOOK NOW
        </button>
      </div>
    </div>
  `;
}

function renderProperties(properties) {
  const propertiesGrid = document.getElementById("properties-grid");
  const propertiesSection = document.getElementById("properties");
  const dashboardSection = document.getElementById("user-dashboard");
  const bookingConfirmationSection = document.getElementById(
    "booking-confirmation-page"
  );

  // Hide non-property sections
  if (dashboardSection) dashboardSection.classList.add("hidden");
  if (bookingConfirmationSection)
    bookingConfirmationSection.classList.add("hidden");
  if (propertiesSection) propertiesSection.classList.remove("hidden");

  // Clear existing content and re-create the inner structure
  if (propertiesSection) {
    propertiesSection.innerHTML = `
          <div class="properties-container">
              <h2>Featured Rooms & PGs</h2>
              <div class="properties-grid" id="properties-grid"></div>
          </div>
      `;
  }

  const updatedPropertiesGrid = document.getElementById("properties-grid");

  if (!updatedPropertiesGrid) return; // Exit if the grid element is missing

  // --- LOGIC TO CONDITIONALLY APPLY CENTERING ---
  const searchInput = document.getElementById("search-input");
  const searchQuery = searchInput ? searchInput.value.trim() : "";
  const isFilteredOrSmallSet =
    properties.length < propertiesData.length || searchQuery !== "";

  if (isFilteredOrSmallSet) {
    updatedPropertiesGrid.classList.add("centered-grid");
  } else {
    updatedPropertiesGrid.classList.remove("centered-grid");
  }
  // --------------------------------------------------

  if (properties.length === 0) {
    // Show the "No Results" message
    propertiesSection.querySelector(".properties-container").innerHTML = `
            <h2>Featured Rooms & PGs</h2>
            <p class="no-results-message">
                Sorry, no rooms matched your search criteria. Rooms available soon in your location!
            </p>
            <div style="text-align: center;">
              <button class="btn btn-outline" onclick="renderProperties(propertiesData)" style="margin-top: 2rem;">
                  Show All Rooms
              </button>
            </div>
    `;
    return;
  }

  // Render the found properties
  updatedPropertiesGrid.innerHTML = properties
    .map(createPropertyCardHTML)
    .join("");
}

async function initializePage() {
  try {
    // Get stored user name and ID
    const userName = localStorage.getItem("studentstay_user_name");
    currentUserId = localStorage.getItem("studentstay_user_id");

    // Fetch data from the Node.js backend endpoint
    const response = await fetch("/api/properties");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Populate the global propertiesData array
    propertiesData = await response.json();

    // Update UI based on login status
    updateAuthUI(userName);

    // Initial render should show default properties and reset view
    navigateToHome(); // Use new function to ensure correct initial state
  } catch (error) {
    console.error("Failed to load property data:", error);
    const propertiesSection = document.getElementById("properties");
    if (propertiesSection) {
      propertiesSection.innerHTML = `
          <div class="properties-container">
              <h2>Error Loading Rooms</h2>
              <p class="no-results-message">
                  Could not connect to the backend server or load data. Please ensure the Node.js server is running via 'node server.js'.
              </p>
          </div>
      `;
    }
  }
}

/**
 * ===================================================
 * SEARCH FUNCTIONALITY
 * ===================================================
 */

function handleSearch(e) {
  if (e) e.preventDefault();

  const query = document
    .getElementById("search-input")
    .value.toLowerCase()
    .trim();

  // Ensure other sections are hidden before showing properties
  document.getElementById("user-dashboard").classList.add("hidden");
  document.getElementById("booking-confirmation-page").classList.add("hidden");

  if (!query) {
    renderProperties(propertiesData);
    window.location.hash = "#properties";
    return;
  }

  const filteredProperties = propertiesData.filter((property) => {
    const searchString =
      `${property.name} ${property.location} ${property.keywords} ${property.landmark}`.toLowerCase();
    return searchString.includes(query);
  });

  // Render the filtered list
  renderProperties(filteredProperties);

  // FIX: Add smooth scroll after search is complete
  const propertiesSection = document.getElementById("properties");
  if (propertiesSection) {
    propertiesSection.scrollIntoView({ behavior: "smooth" });
  }
  window.location.hash = "#properties";
}

// Function to handle popular city tag clicks
function searchByTag(city) {
  document.getElementById("search-input").value = city;
  handleSearch();
}

/**
 * ===================================================
 * AUTHENTICATION
 * ===================================================
 */

async function handleLogin(e) {
  e.preventDefault();

  const emailOrPhone = document.getElementById("login-email-phone").value;
  const password = document.getElementById("login-password").value;

  if (!emailOrPhone || !password) {
    alert("Please enter both email/phone and password.");
    return;
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailOrPhone, password }),
    });

    const result = await response.json();

    if (response.ok) {
      const userName = result.userName;
      const userId = result.userId;

      localStorage.setItem("studentstay_user_name", userName);
      localStorage.setItem("studentstay_user_id", userId);
      currentUserId = userId;

      alert("Login successful! Welcome back!");
      closeModal("login");

      initializePage(); // Re-initialize to update UI and navigation
      window.location.hash = "#home";
    } else {
      alert(`Login Failed: ${result.message}`);
    }
  } catch (error) {
    console.error("Login failed:", error);
    alert("A network error occurred. Please try again.");
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById("register-name").value;
  const roleElement = document.getElementById("register-role");
  // Assuming the role is 'Student' if the element is not found or is 'Select'
  const role =
    roleElement && roleElement.value !== "" ? roleElement.value : "Student";

  const email = document.getElementById("register-email").value;
  const phone = document.getElementById("register-phone").value;
  const password = document.getElementById("register-password").value;

  if (!name || !email || !phone || !password) {
    alert("Please fill out all registration fields.");
    return;
  }

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, role, email, phone, password }),
    });

    const result = await response.json();

    if (response.ok) {
      const userId = result.userId;

      localStorage.setItem("studentstay_user_name", name);
      localStorage.setItem("studentstay_user_id", userId);
      currentUserId = userId;

      alert(`Registration successful! Welcome, ${name.split(" ")[0]}!`);
      closeModal("register");
      initializePage(); // Re-initialize to update UI and navigation
      window.location.hash = "#home";
    } else {
      alert(`Registration Failed: ${result.message}`);
    }
  } catch (error) {
    console.error("Registration failed:", error);
    alert("A network error occurred. Please try again.");
  }
}

function handleLogout() {
  localStorage.removeItem("studentstay_user_name");
  localStorage.removeItem("studentstay_user_id");
  currentUserId = null;
  alert("You have been successfully logged out.");

  initializePage();
  window.location.hash = "#home";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * ===================================================
 * PROPERTY LISTING FUNCTIONALITY
 * ===================================================
 */

async function handleListPropertySubmission(e) {
  e.preventDefault();

  const form = e.target;
  const ownerName = document.getElementById("list-owner-name").value;
  const propertyName = document.getElementById("list-property-name").value;
  const email = document.getElementById("list-email").value;
  const phone = document.getElementById("list-phone").value;
  const location = document.getElementById("list-location").value;

  if (ownerName && propertyName && email && phone && location) {
    const listingData = {
      ownerName,
      propertyName,
      email,
      phone,
      location,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listingData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `Thank you, ${
            ownerName.split(" ")[0]
          }! Your property listing request for "${propertyName}" in ${location} has been successfully submitted.`
        );
        closeModal("listProperty");
        form.reset();
      } else {
        alert(
          `Submission failed: ${
            result.message || "Server error. Check the console for details."
          }`
        );
      }
    } catch (error) {
      console.error("Error submitting listing:", error);
      alert(
        "An error occurred. Please ensure the server is running and try again."
      );
    }
  } else {
    alert("Please fill out all the required fields for listing your property.");
  }
}

/**
 * ===================================================
 * BOOKING & DASHBOARD FUNCTIONS
 * ===================================================
 */

function openBookingDetailsModal(property) {
  const modal = document.getElementById("bookingDetailsModal");
  if (!modal) return;

  // Populate modal elements
  document.getElementById(
    "booking-modal-title"
  ).textContent = `Confirm Booking for: ${property.name}`;
  document.getElementById("modal-property-name").value = property.name;
  document.getElementById("modal-sharing-type").value = property.sharing;
  document.getElementById("modal-advance-payment").value = property.advance;
  document.getElementById("modal-display-advance-payment").textContent =
    property.advance;

  // Attempt to pre-fill user name if logged in
  const userName = localStorage.getItem("studentstay_user_name");
  if (userName) {
    document.getElementById("booking-name-input").value = userName;
  } else {
    document.getElementById("booking-name-input").value = "";
  }

  modal.classList.add("active");
}

function handleBookNow(e) {
  if (e) e.preventDefault();

  const userName = localStorage.getItem("studentstay_user_name");

  if (!userName) {
    alert("Please login or register to book a room.");
    openModal("login");
    return;
  }

  const button = e.currentTarget;
  const propertyId = button.getAttribute("data-id");
  const property = propertiesData.find((p) => p.id == propertyId);

  if (property) {
    openBookingDetailsModal(property);
  } else {
    alert("Error: Property details not found.");
  }
}

async function confirmBooking(e) {
  e.preventDefault();

  if (!currentUserId) {
    alert("Error: You must be logged in to confirm a booking.");
    return;
  }

  // Get data from modal form
  const propertyName = document.getElementById("modal-property-name").value;
  const sharingType = document.getElementById("modal-sharing-type").value;
  const advancePayment = document.getElementById("modal-advance-payment").value;
  const bookedName = document.getElementById("booking-name-input").value;
  const numPersons = parseInt(
    document.getElementById("booking-persons-select").value
  );

  // 1. Prepare data for the backend
  const bookingData = {
    userId: currentUserId,
    userName: bookedName,
    propertyName,
    sharingType,
    numPersons,
    advancePayment,
  };

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Booking failed on server.");
    }

    // 2. Close the detail modal and navigate to confirmation
    closeModal("bookingDetails");
    document.getElementById("booking-property-name").textContent = propertyName;
    document.getElementById(
      "booking-sharing-type"
    ).textContent = `${sharingType} (${numPersons} Persons)`;
    document.getElementById("booking-advance-payment").textContent =
      advancePayment;
    document.getElementById("booking-user-name").textContent = bookedName;

    document.getElementById("properties").classList.add("hidden");
    document
      .getElementById("booking-confirmation-page")
      .classList.remove("hidden");
    document.getElementById("user-dashboard").classList.add("hidden");

    window.location.hash = "#booking-confirmation-page";
    alert(
      `Booking confirmed! Reference: ${result.bookingId}. Your booking is awaiting confirmation.`
    );
  } catch (error) {
    console.error("Booking Submission Error:", error);
    alert(`Could not complete booking: ${error.message}`);
  }
}

/**
 * UPDATED FUNCTION: Fetches real user data from the server's new endpoint.
 */
async function fetchUserDetail() {
  try {
    // Rely on the newly implemented server endpoint
    const response = await fetch(`/api/users/${currentUserId}`);
    if (!response.ok) {
      // Handle server errors (e.g., 404 User not found)
      const errorDetail = await response.json();
      throw new Error(errorDetail.message || "Failed to fetch user details.");
    }
    // Returns the real user data: { name, email, phone, role }
    return await response.json();
  } catch (error) {
    // If the server fails, show an error message instead of mock data
    console.error("User Detail Error:", error.message);
    return {
      name: localStorage.getItem("studentstay_user_name") || "User",
      // Use error placeholders instead of hardcoded mock data
      email: "Error: Could not load data",
      phone: "Error: Could not load data",
      role: "User",
    };
  }
}

/**
 * UPDATED FUNCTION: Renders the dashboard structure and populates it with fetched data.
 */
async function showUserAccount(activeView = "profile") {
  const dashboardSection = document.getElementById("user-dashboard");
  const propertiesSection = document.getElementById("properties");
  const bookingConfirmationSection = document.getElementById(
    "booking-confirmation-page"
  );

  if (!currentUserId) {
    alert("Please log in to view your account.");
    return;
  }

  // 1. Toggle views
  if (propertiesSection) propertiesSection.classList.add("hidden");
  if (bookingConfirmationSection)
    bookingConfirmationSection.classList.add("hidden");
  if (dashboardSection) dashboardSection.classList.remove("hidden");

  window.location.hash = "#user-dashboard";

  // 2. Render Static Layout
  dashboardSection.innerHTML = `
        <div style="max-width: 1400px; margin: 0 auto; padding: 0 5%;">
            <h1 style="color: #1e3a8a; font-size: 2rem; margin-bottom: 30px;">Your Account Dashboard</h1>
            
            <div id="dashboard-content-main" class="dashboard-content-main-layout">
                <div id="profile-details-container">
                    <div class="profile-avatar-placeholder"></div>
                    <h3 id="profile-name-placeholder">Loading Name...</h3>
                    <p id="profile-role-placeholder" style="color: #4a69bd; font-weight: 600;">Loading Role...</p>
                    
                    <div class="profile-info-item">
                        <strong>Email:</strong> <span id="profile-email-placeholder">Loading...</span>
                    </div>
                    <div class="profile-info-item">
                        <strong>Phone:</strong> <span id="profile-phone-placeholder">Loading...</span>
                    </div>
                    <div class="profile-info-item user-id-info">
                        <p>User ID: ${currentUserId}</p>
                    </div>
                </div>

                <div id="bookings-list-container">
                    <h2>My Bookings (<span id="booking-count-placeholder">0</span>)</h2>
                    <div id="bookings-list" class="booking-list">
                        <p style="text-align: center; padding: 20px;">Fetching booking history...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

  // 3. Scroll to the dashboard immediately after the structure is loaded
  dashboardSection.scrollIntoView({ behavior: "smooth" });

  try {
    // 4. Fetch Data Concurrently
    const [userDetails, bookingsResponse] = await Promise.all([
      fetchUserDetail(),
      fetch(`/api/users/${currentUserId}/bookings`),
    ]);

    if (!bookingsResponse.ok) {
      throw new Error("Failed to fetch dashboard data.");
    }
    const bookings = await bookingsResponse.json();

    // 5. Populate Profile Details (Now uses REAL data from fetchUserDetail)
    document.getElementById("profile-name-placeholder").textContent =
      userDetails.name;
    document.getElementById("profile-role-placeholder").textContent =
      userDetails.role;
    document.getElementById("profile-email-placeholder").textContent =
      userDetails.email;
    document.getElementById("profile-phone-placeholder").textContent =
      userDetails.phone;

    // 6. Populate Bookings List
    document.getElementById("booking-count-placeholder").textContent =
      bookings.length;

    const bookingsListElement = document.getElementById("bookings-list");
    if (bookings.length === 0) {
      bookingsListElement.innerHTML =
        '<p class="no-results-message" style="background: #f8f8ff; color: #4a69bd; padding: 15px; border-radius: 6px; border: 1px solid #e0e7ff; text-align: center;">You have no active or historical bookings yet.</p>';
    } else {
      bookingsListElement.innerHTML = bookings
        .map(createBookingCardHTML)
        .join("");
    }

    // Scroll to the bookings list if needed
    if (activeView === "dashboard" && bookings.length > 0) {
      const target = document.getElementById("bookings-list-container");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  } catch (error) {
    console.error("Dashboard Error:", error);
    // Update placeholders with error message on failure
    document.getElementById("profile-name-placeholder").textContent = "Error";
    document.getElementById("profile-role-placeholder").textContent = "";
    document.getElementById("profile-email-placeholder").textContent = "N/A";
    document.getElementById("profile-phone-placeholder").textContent = "N/A";

    document.getElementById(
      "bookings-list"
    ).innerHTML = `<p class="no-results-message">Error loading booking details: ${error.message}</p>`;
  }
}

// --- UPDATED HELPER FUNCTION: Neat Box for Booking Card ---
function createBookingCardHTML(booking) {
  const statusClass = booking.status.toLowerCase();
  const date = new Date(
    booking.booking_date || booking.bookingDate
  ).toLocaleDateString();

  // Determine status style for inline styling (as seen in original files)
  let statusStyle = "";
  if (statusClass === "confirmed") {
    statusStyle =
      "background-color: #d1fae5; color: #065f46; border: 1px solid #6ee7b7;";
  } else if (statusClass === "pending") {
    statusStyle =
      "background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d;";
  } else if (statusClass === "cancelled") {
    statusStyle =
      "background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;";
  }

  return `
        <div class="booking-card" style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div class="booking-header" style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; overflow: hidden;">
                <h3 style="color: #1e3a8a; font-size: 1.2rem; display: inline-block; margin: 0;">${
                  booking.property_name
                }</h3>
                <span class="booking-status status-${statusClass}" style="float: right; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 0.8rem; ${statusStyle}">${
    booking.status
  }</span>
            </div>
            <p><strong>Booking ID:</strong> ${booking._id || booking.id}</p>
            <p><strong>Date Booked:</strong> ${date}</p>
            <p><strong>Sharing Type:</strong> ${booking.sharing_type} (${
    booking.num_persons
  } Persons)</p>
            <p style="margin-top: 10px; color: #d9534f;"><strong>Advance Paid:</strong> ₹${
              booking.advance_payment
            }</p>
        </div>
    `;
}

// Ensure the page initializes when the script loads
document.addEventListener("DOMContentLoaded", initializePage);
