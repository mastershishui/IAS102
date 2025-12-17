// -----------------------------------------------------
// FIREBASE CONFIG
// -----------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyCVyUgHFLA4q096CDzOBlbmpgcXeTwB_ts",
    authDomain: "ias2-6f5a6.firebaseapp.com",
    projectId: "ias2-6f5a6",
    storageBucket: "ias2-6f5a6.firebasestorage.app",
    messagingSenderId: "544841313734",
    appId: "1:544841313734:web:8175b12426535abc1fd6c7",
    measurementId: "G-89T49JG1LE"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

async function requirePermission(type) {
    const user = auth.currentUser;
    if (!user) return false;

    const snap = await db.collection("users")
        .doc(user.displayName)
        .get();

    if (!snap.exists) return false;

    const data = snap.data();
    return data.permissions?.[type] === true;
}


// ⭐ EmailJS (RESTORED)
emailjs.init("YSfpEElxewbrRvno7");

async function getCurrentAdminPermissions() {
    const user = auth.currentUser;
    if (!user) return null;

    const username = user.displayName;
    const doc = await db.collection("users").doc(username).get();
    if (!doc.exists) return null;

    const data = doc.data();

    return {
        role: data.role,
        add:  data.permissions?.add === true,
        edit: data.permissions?.edit === true,
        view: data.permissions?.view === true
    };
}

// -----------------------------------------------------
// AUTH GUARD  ⭐ FIXED VERSION (uses displayName)
// -----------------------------------------------------
auth.onAuthStateChanged(async (user) => {
    const path = window.location.pathname;
    const isLoginPage = path.includes("index.html") || path.endsWith("/") || path === "";

    if (!user && !isLoginPage) {
        window.location.href = "index.html";
        return;
    }

    if (user && isLoginPage) {
        // FIXED: use REAL username, not email-derived one
        const username = user.displayName;

        const doc = await db.collection("users").doc(username).get();
        if (!doc.exists) return;

        const role = doc.data().role;

        if (role === "admin") {
            window.location.href = "userm.html";
        } else {
            window.location.href = "emprecord.html";
        }
    }
});

// -----------------------------------------------------
// PASSWORD GENERATOR
// -----------------------------------------------------
function generateStrongPassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const nums = "0123456789";
    const symbols = "!@#$%^&*()_+{}[]<>?";

    function pick(str) {
        return str[Math.floor(Math.random() * str.length)];
    }

    let pass = "";
    pass += pick(upper);
    pass += pick(lower);
    pass += pick(nums);
    pass += pick(symbols);

    const all = upper + lower + nums + symbols;

    while (pass.length < 10) pass += pick(all);

    return pass.split("").sort(() => Math.random() - 0.5).join("");
}

// -----------------------------------------------------
// USERNAME GENERATOR
// -----------------------------------------------------
function generateUsername(first, last) {
    const base = first.toLowerCase() + "." + last.toLowerCase();
    const rnd = Math.floor(100 + Math.random() * 900);
    return base + rnd;
}

// -----------------------------------------------------
// DOM READY
// -----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) loginBtn.addEventListener("click", loginUser);

    const addUserBtn = document.getElementById("addUserBtn");
    if (addUserBtn) addUserBtn.addEventListener("click", showAddUserForm);

    const editEmployeesBtn = document.getElementById("editEmployeesBtn");
    if (editEmployeesBtn) editEmployeesBtn.addEventListener("click", showEditEmployeesForm);

    
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
if (resetPasswordBtn) resetPasswordBtn.addEventListener("click", showResetPasswordForm);


const activateAccountsBtn = document.getElementById("activateAccountsBtn");
if (activateAccountsBtn) activateAccountsBtn.addEventListener("click", showActivateDeactivateForm);

const unlockUsersBtn = document.getElementById("unlockUsersBtn");
if (unlockUsersBtn) {
    unlockUsersBtn.addEventListener("click", showUnlockUsersForm);
}

const viewLockedBtn = document.getElementById("viewLockedBtn");
if (viewLockedBtn) {
    viewLockedBtn.addEventListener("click", showViewLockedForm);
}


auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    if (!window.location.pathname.includes("userm.html")) return;

    const username = user.displayName;
    if (!username) return;

    const snap = await db.collection("users").doc(username).get();
    if (!snap.exists) return;
    
});




    document.getElementById("username")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") loginUser();
    });
    document.getElementById("password")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") loginUser();
    });
});

// -----------------------------------------------------
// SHOW ADD USER FORM
// -----------------------------------------------------
async function showAddUserForm() {

    // 🔐 PERMISSION CHECK FIRST
    if (!(await requirePermission("add"))) {
        alert("You do not have permission to ADD users.");
        return;
    }
    const panel = document.getElementById("um-content");

    panel.innerHTML = `
        <h2 class="um-section-title">Add New User</h2>

        <div class="form-row">
            <label>First Name:</label>
            <input id="firstName" type="text">
        </div>

        <div class="form-row">
            <label>Last Name:</label>
            <input id="lastName" type="text">
        </div>

        <div class="form-row">
            <label>Email:</label>
            <input id="email" type="email">
        </div>

        <div class="form-row">
            <label>Username:</label>
            <input id="username" type="text" readonly style="background:#e9e1d6;">
        </div>

        <div class="form-row">
            <label>Password:</label>
            <input id="password" type="text" readonly style="background:#e9e1d6;">
        </div>

        <div class="form-row">
    <label>Role:</label>
    <select id="role" style="width:260px; height:34px; border-radius:8px;">
        <option value="regular">User</option>
        <option value="admin">Admin</option>
    </select>
</div>

<div class="form-row">
    <label>Permissions:</label>

    <div class="perm-grid">
        <div class="perm-item">
            <input type="checkbox" id="permAdd">
            <span>Add</span>
        </div>

        <div class="perm-item">
            <input type="checkbox" id="permEdit">
            <span>Edit</span>
        </div>

        <div class="perm-item">
            <input type="checkbox" id="permView" checked>
            <span>View</span>
        </div>
    </div>
</div>



        <button id="createUserBtn" class="um-submit-btn">CREATE USER</button>
    `;

    document.getElementById("firstName").addEventListener("input", autoFill);
    document.getElementById("lastName").addEventListener("input", autoFill);

    function autoFill() {
        const f = firstName.value.trim();
        const l = lastName.value.trim();
        if (f && l) {
            username.value = generateUsername(f, l);
            password.value = generateStrongPassword();
        }
    }

    document.getElementById("createUserBtn").addEventListener("click", createUser);
}

// -----------------------------------------------------
// CREATE USER ⭐ FULL FIXED VERSION
// -----------------------------------------------------
async function createUser() {
    const firstname = firstName.value.trim();
    const lastname  = lastName.value.trim();
    const email     = document.getElementById("email").value.trim();
    const username  = document.getElementById("username").value.trim().toLowerCase();
    const password  = document.getElementById("password").value.trim();
    const role      = document.getElementById("role").value;
    const canAdd  = document.getElementById("permAdd").checked;
const canEdit = document.getElementById("permEdit").checked;
const canView = document.getElementById("permView").checked;


    if (!firstname || !lastname || !email || !username || !password) {
        alert("Please complete all fields.");
        return;
    }

    try {
        // ⭐ Create Firebase Auth user
        const cred = await auth.createUserWithEmailAndPassword(email, password);

        // ⭐ Set REAL username into Firebase user
        await cred.user.updateProfile({ displayName: username });

        // ⭐ Create Firestore user
        await db.collection("users").doc(username).set({
            username,
            firstname,
            lastname,
            email,
            role,
            permissions: {
    add:  canAdd,
    edit: canEdit,
    view: canView
},


            active: true,
            locked: false,
            failedAttempts: 0,
            firstLogin: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // ⭐ SEND EMAIL (RESTORED)
        const emailData = {
            firstname,
            lastname,
            username,
            password,
            time: new Date().toLocaleString(),
            to_email: email
        };

        await emailjs.send("service_y7zhrnm", "template_y7itpo4", emailData);

        alert("User created successfully! Login details emailed.");

    } catch (error) {
        alert("Error creating user: " + error.message);
    }
}

async function loginUser() {
    const usernameInput = document.getElementById("username").value.trim().toLowerCase();
    const passwordInput = document.getElementById("password").value;

    if (!usernameInput || !passwordInput) {
        alert("Please enter username and password.");
        return;
    }

    const MAX_ATTEMPTS = 3;

    try {
        const userRef = db.collection("users").doc(usernameInput);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            alert("Invalid username or password.");
            return;
        }

        const userData = userDoc.data();
        let failedAttempts = userData.failedAttempts || 0;

        // 🔒 Locked
        if (userData.locked) {
            alert("Your account is locked. Contact admin.");
            return;
        }

        // 🚫 Inactive
        if (!userData.active) {
            alert("Your account is inactive.");
            return;
        }

        // ⛔ Increment attempt FIRST
        failedAttempts++;
        await userRef.update({ failedAttempts });

        try {
            // 🔐 Try Firebase Auth
            const cred = await auth.signInWithEmailAndPassword(
                userData.email,
                passwordInput
            );

            // ✅ SUCCESS → reset attempts
            await userRef.update({
                failedAttempts: 0,
                locked: false,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            await cred.user.updateProfile({
                displayName: usernameInput
            });

            window.location.href =
                userData.role === "admin" ? "userm.html" : "emprecord.html";

        } catch (authError) {
            // 🔒 Lock after max attempts
            if (failedAttempts >= MAX_ATTEMPTS) {
                await userRef.update({
                    locked: true,
                    lockedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("Account locked");
            } else {
                alert(`Invalid password. You have ${MAX_ATTEMPTS - failedAttempts} attempt(s) left.`);
            }
        }

    } catch (err) {
        console.error("LOGIN FLOW ERROR:", err);
        alert("Login system error. Please refresh and try again.");
    }
}




// -----------------------------------------------------
// EMPLOYEE RECORD PAGE ACCESS CONTROL
// -----------------------------------------------------
function initEmployeeRecordPage() {
    if (!window.location.pathname.includes("emprecord.html")) return;

    auth.onAuthStateChanged(async (user) => {
        if (!user) return (window.location.href = "index.html");

        const username = user.displayName;

        const doc = await db.collection("users").doc(username).get();
        if (!doc.exists) {
            await auth.signOut();
            window.location.href = "index.html";
            return;
        }

        const data = doc.data();

        

        const perms = {
  add: data.permissions?.add === true,
  edit: data.permissions?.edit === true,
  view: data.permissions?.view === true
};


        const btnAdd  = document.getElementById("btnAdd");
        const btnEdit = document.getElementById("btnEdit");
        const btnView = document.getElementById("btnView");

        function applyPermission(btn, allowed) {
    if (!btn) return;

    btn.disabled = !allowed;
    btn.classList.remove("perm-allowed", "perm-denied");

    if (allowed) {
        btn.classList.add("perm-allowed");   // 🟢 GREEN
    } else {
        btn.classList.add("perm-denied");    // 🔴 RED
    }
}

applyPermission(btnAdd,  perms.add);
applyPermission(btnEdit, perms.edit);
applyPermission(btnView, perms.view);

    });
}

document.addEventListener("DOMContentLoaded", initEmployeeRecordPage);


// -----------------------------------------------------
// SHOW EMPLOYEE CHANGE USERNAME / PASSWORD FORM
// -----------------------------------------------------
function showChangeUPForm() {
    const panel = document.getElementById("emp-content");

    panel.innerHTML = `
    <h2 class="um-section-title">Change Username / Password</h2>

    <div class="two-col-row-fix">
        <div class="col-pair">
            <label>Current Username:</label>
            <input type="text" id="curUsername">
        </div>

        <div class="col-pair">
            <label>New Username:</label>
            <input type="text" id="newUsername">
        </div>
    </div>

    <div class="two-col-row-fix">
        <div class="col-pair">
            <label>Current Password:</label>
            <input type="password" id="curPassword">
        </div>

        <div class="col-pair">
            <label>New Password:</label>
            <div style="display: flex; flex-direction: column; width: 100%;">
                <input type="password" id="newPassword" style="width: 100%;">
                
                <!-- Password Strength Indicator -->
                <div class="pw-strength-container">
                    <div class="pw-strength-bar" id="pwBar1"></div>
                    <div class="pw-strength-bar" id="pwBar2"></div>
                    <div class="pw-strength-bar" id="pwBar3"></div>
                </div>
                
                <div class="pw-strength-label" id="pwStrengthLabel"></div>
                
            </div>
        </div>
    </div>

    <button id="saveUPBtn" class="um-submit-btn">CONFIRM</button>
`;

    // Add event listeners
    document.getElementById("saveUPBtn").addEventListener("click", saveUPChanges);
    
    // Add input event listener to newPassword field
    const newPasswordInput = document.getElementById("newPassword");
    newPasswordInput.addEventListener("input", function() {
        evaluatePasswordStrength();
    });
    
    // Also add event listener for keyup to catch all changes
    newPasswordInput.addEventListener("keyup", evaluatePasswordStrength);
}

function evaluatePasswordStrength() {
    const pw = document.getElementById("newPassword").value;
    const label = document.getElementById("pwStrengthLabel");
    
    // Get the bars
    const bar1 = document.getElementById("pwBar1");
    const bar2 = document.getElementById("pwBar2");
    const bar3 = document.getElementById("pwBar3");
    
    // Reset all bars
    if (bar1) bar1.className = "pw-strength-bar";
    if (bar2) bar2.className = "pw-strength-bar";
    if (bar3) bar3.className = "pw-strength-bar";
    
    // Clear label if empty
    if (pw.length === 0) {
        if (label) {
            label.textContent = "";
            label.className = "pw-strength-label";
        }
        return;
    }

    // Check password criteria
    const rules = {
        length: pw.length >= 8,
        upper: /[A-Z]/.test(pw),
        lower: /[a-z]/.test(pw),
        number: /[0-9]/.test(pw),
        special: /[^A-Za-z0-9]/.test(pw)
    };

    const passed = Object.values(rules).filter(v => v).length;

    // Determine strength level and update UI
    if (passed <= 2) {
        // Weak - only first bar
        if (bar1) bar1.classList.add("active");
        if (label) {
            label.textContent = "Weak Password";
            label.className = "pw-strength-label pw-label-weak";
        }
    } else if (passed === 3 || passed === 4) {
        // Medium - first two bars
        if (bar1) bar1.classList.add("active");
        if (bar2) bar2.classList.add("active", "medium");
        if (label) {
            label.textContent = "Medium Password";
            label.className = "pw-strength-label pw-label-medium";
        }
    } else if (passed === 5) {
        // Strong - all three bars
        if (bar1) bar1.classList.add("active");
        if (bar2) bar2.classList.add("active", "medium");
        if (bar3) bar3.classList.add("active", "strong");
        if (label) {
            label.textContent = "Strong Password";
            label.className = "pw-strength-label pw-label-strong";
        }
    }




    

    document.getElementById("saveUPBtn").addEventListener("click", saveUPChanges);
     document.getElementById("newPassword").addEventListener("input", evaluatePasswordStrength);

}




// =============================
// CHANGE USERNAME / PASSWORD
// =============================
// =============================
// CHANGE USERNAME / PASSWORD
// =============================

function isPasswordValid(pw) {
    return (
        pw.length >= 8 &&
        /[A-Z]/.test(pw) &&
        /[a-z]/.test(pw) &&
        /[0-9]/.test(pw) &&
        /[^A-Za-z0-9]/.test(pw)
    );
}

async function saveUPChanges() {
    const user = auth.currentUser;
    if (!user) return alert("No user signed in.");

    const typedCurrentUsername = document.getElementById("curUsername").value.trim().toLowerCase();
    const newUsername = document.getElementById("newUsername").value.trim().toLowerCase();
    const currentPassword = document.getElementById("curPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();

    const actualCurrentUsername = user.displayName.toLowerCase();

    const usernameChanged = newUsername !== "";
    const passwordChanged = newPassword !== "";

    // === 1. No change ===
    if (!usernameChanged && !passwordChanged) {
        alert("No changes detected.");
        return;
    }

    // =============================
    // REQUIRE CURRENT USERNAME ONLY IF USERNAME IS BEING CHANGED
    // =============================
    if (usernameChanged && typedCurrentUsername !== actualCurrentUsername) {
        alert("Your typed CURRENT USERNAME is incorrect.");
        return;
    }

    // =============================
    // 2. Username only (NO PASSWORD REQUIRED)
    // =============================
    if (usernameChanged && !passwordChanged) {
        try {
            const oldDocRef = db.collection("users").doc(actualCurrentUsername);
            const oldDoc = await oldDocRef.get();

            if (!oldDoc.exists) return alert("User record not found.");

            const data = oldDoc.data();

            await db.collection("users").doc(newUsername).set({
                ...data,
                username: newUsername
            });

            await oldDocRef.delete();

            await user.updateProfile({ displayName: newUsername });

            alert("Username updated successfully!");
            location.reload();
        } catch (err) {
            alert("Error updating username: " + err.message);
        }
        return;
    }

    // =============================
    // 3. Password change (requires CURRENT PASSWORD ONLY)
    // =============================
    if (passwordChanged) {

    if (!currentPassword) {
        alert("Enter your CURRENT password to change your password.");
        return;
    }

    // 🔒 ENFORCE PASSWORD RULES
    if (!isPasswordValid(newPassword)) {
        alert(
            "Password must meet the following rules:\n\n" +
            "• Minimum 8 characters\n" +
            "• At least one uppercase letter\n" +
            "• At least one lowercase letter\n" +
            "• At least one number\n" +
            "• At least one special character"
        );
        return;
    }

    try {
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        await user.reauthenticateWithCredential(credential);

        await user.updatePassword(newPassword);

        alert("Password updated successfully!");
        location.reload();

    } catch (err) {
        alert("Error updating password: " + err.message);
    }
}

}





document.addEventListener("DOMContentLoaded", () => {
    const changeUPBtn = document.getElementById("changeUPBtn");
    if (changeUPBtn) changeUPBtn.addEventListener("click", showChangeUPForm);
});


// -----------------------------------------------------
// LOGOUT
// -----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await auth.signOut();
            window.location.href = "index.html";
        });
    }
});


// -----------------------------------------------------
// SHOW EDIT EMPLOYEES FORM
// -----------------------------------------------------
async function showEditEmployeesForm() {
    if (!(await requirePermission("edit"))) {
        alert("You do not have permission to EDIT users.");
        return;
    }
    const panel = document.getElementById("um-content");
    
    panel.innerHTML = `
        <h2 class="um-section-title">Edit Employee Information</h2>
        
        <div class="um-search-row">
            <label>Search Employee:</label>
            <input type="text" id="searchEmployee" placeholder="Search by username, name, or email">
            <button id="searchBtn" class="um-search-btn">SEARCH</button>
        </div>
        
        <div id="employeesList">
            <div class="um-count-label" id="countLabel">Loading employees...</div>
            <div class="um-table-container">
                <table class="um-employees-table" id="employeesTable">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="employeesTableBody">
                        <tr><td colspan="5" style="text-align: center; padding: 30px;">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="editFormContainer" class="um-edit-form" style="display: none;">
            <h3 class="um-edit-form-title">Edit Employee Details</h3>
            
            <div class="form-row">
                <label>Username:</label>
                <input type="text" id="editUsername" readonly style="background:#e9e1d6;">
            </div>
            
            <div class="form-row">
                <label>First Name:</label>
                <input type="text" id="editFirstName">
            </div>
            
            <div class="form-row">
                <label>Last Name:</label>
                <input type="text" id="editLastName">
            </div>
            
            <div class="form-row">
                <label>Email:</label>
                <input type="email" id="editEmail">
            </div>
            
            <div class="um-edit-buttons">
                <button id="saveEditBtn" class="um-submit-btn">SAVE CHANGES</button>
                <button id="cancelEditBtn" class="um-submit-btn" style="background-color: #f0c0b0;">CANCEL</button>
            </div>
        </div>
    `;
    
    // Load all employees initially
    loadAllEmployees();
    
    // Add event listeners
    document.getElementById("searchBtn").addEventListener("click", searchEmployees);
    document.getElementById("searchEmployee").addEventListener("keypress", (e) => {
        if (e.key === "Enter") searchEmployees();
    });
}

// -----------------------------------------------------
// LOAD ALL EMPLOYEES
// -----------------------------------------------------
async function loadAllEmployees() {
    try {
        const querySnapshot = await db.collection("users").get();
        displayEmployees(querySnapshot);
    } catch (error) {
        console.error("Error loading employees:", error);
        const tableBody = document.getElementById("employeesTableBody");
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: red;">Error loading employees: ${error.message}</td></tr>`;
        }
    }
}

// -----------------------------------------------------
// SEARCH EMPLOYEES
// -----------------------------------------------------
async function searchEmployees() {
    const searchTerm = document.getElementById("searchEmployee").value.toLowerCase().trim();
    const countLabel = document.getElementById("countLabel");
    
    try {
        const querySnapshot = await db.collection("users").get();
        const employees = [];
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            employees.push({ id: doc.id, ...data });
        });
        
        if (searchTerm === "") {
            displayEmployees(querySnapshot);
            return;
        }
        
        const filtered = employees.filter(emp => {
    const username  = (emp.username  || "").toLowerCase();
    const firstname = (emp.firstname || "").toLowerCase();
    const lastname  = (emp.lastname  || "").toLowerCase();
    const email     = (emp.email     || "").toLowerCase();

    return (
        username.includes(searchTerm) ||
        firstname.includes(searchTerm) ||
        lastname.includes(searchTerm) ||
        email.includes(searchTerm)
    );
});

        
        displayFilteredEmployees(filtered, searchTerm);
    } catch (error) {
        console.error("Error searching employees:", error);
        const tableBody = document.getElementById("employeesTableBody");
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: red;">Error searching employees: ${error.message}</td></tr>`;
        }
    }
}

// -----------------------------------------------------
// DISPLAY ALL EMPLOYEES
// -----------------------------------------------------
function displayEmployees(querySnapshot) {
    const tableBody = document.getElementById("employeesTableBody");
    const countLabel = document.getElementById("countLabel");
    
    if (!tableBody || !countLabel) return;
    
    if (querySnapshot.empty) {
        countLabel.textContent = "No employees found";
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">No employees in the system.</td></tr>`;
        return;
    }
    
    countLabel.textContent = `All Employees (${querySnapshot.size})`;
    
    let html = "";
    
    querySnapshot.forEach(doc => {
        const data = doc.data();
        
        html += `
            <tr>
                <td>${data.username || doc.id}</td>
                <td>${data.firstname || ""} ${data.lastname || ""}</td>
                <td>${data.email || ""}</td>
                <td>${data.role === "admin" ? "Admin" : "User"}</td>
                <td>
                    <button class="um-edit-btn" data-username="${data.username || doc.id}">
                        Edit
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.um-edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.getAttribute('data-username');
            loadEmployeeForEdit(username);
        });
    });
}

// -----------------------------------------------------
// DISPLAY FILTERED EMPLOYEES
// -----------------------------------------------------
function displayFilteredEmployees(employees, searchTerm = "") {
    const tableBody = document.getElementById("employeesTableBody");
    const countLabel = document.getElementById("countLabel");
    
    if (!tableBody || !countLabel) return;
    
    if (employees.length === 0) {
        countLabel.textContent = `No employees found for "${searchTerm}"`;
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">No matching employees found.</td></tr>`;
        return;
    }
    
    countLabel.textContent = `Search Results (${employees.length})`;
    
    let html = "";
    
    employees.forEach(emp => {
        const statusClass = emp.locked ? "status-locked" : (emp.active ? "status-active" : "status-inactive");
        const statusText = emp.locked ? "Locked" : (emp.active ? "Active" : "Inactive");
        
        html += `
            <tr>
                <td>${emp.username || emp.id}</td>
                <td>${emp.firstname || ""} ${emp.lastname || ""}</td>
                <td>${emp.email || ""}</td>
                <td>${emp.role === "admin" ? "Admin" : "User"}</td>
                <td>
                    <button class="um-edit-btn" data-username="${emp.username || emp.id}">
                        Edit
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.um-edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.getAttribute('data-username');
            loadEmployeeForEdit(username);
        });
    });
}

// -----------------------------------------------------
// LOAD EMPLOYEE FOR EDITING
// -----------------------------------------------------
async function loadEmployeeForEdit(username) {
    try {
        const doc = await db.collection("users").doc(username).get();
        
        if (!doc.exists) {
            alert("Employee not found!");
            return;
        }
        
        const data = doc.data();
        
        // Fill the edit form
        document.getElementById("editUsername").value = data.username || username;
        document.getElementById("editFirstName").value = data.firstname || "";
        document.getElementById("editLastName").value = data.lastname || "";
        document.getElementById("editEmail").value = data.email || "";
        
        
        // Show the edit form
        const editForm = document.getElementById("editFormContainer");
        editForm.style.display = "block";
        
        // Scroll to edit form smoothly
        editForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Add event listeners for save and cancel
        document.getElementById("saveEditBtn").onclick = () => saveEmployeeEdit(username);
        document.getElementById("cancelEditBtn").onclick = () => {
            editForm.style.display = "none";
        };
        
    } catch (error) {
        console.error("Error loading employee:", error);
        alert("Error loading employee: " + error.message);
    }
}

// -----------------------------------------------------
// SAVE EMPLOYEE EDITS
// -----------------------------------------------------
async function saveEmployeeEdit(oldUsername) {
    const username = document.getElementById("editUsername").value.trim();
    const firstname = document.getElementById("editFirstName").value.trim();
    const lastname = document.getElementById("editLastName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    
    
    // Validate
    if (!firstname || !lastname || !email) {
        alert("Please fill in all required fields.");
        return;
    }
    
    if (!email.includes("@")) {
        alert("Please enter a valid email address.");
        return;
    }
    
    try {
        // Update Firestore document
        const updateData = {
            firstname,
            lastname,
            email
        };
        
        // If username changed, we need to move the document
        if (username !== oldUsername) {
            // Get the old document
            const oldDoc = await db.collection("users").doc(oldUsername).get();
            const oldData = oldDoc.data();
            
            // Create new document with new username
            await db.collection("users").doc(username).set({
                ...oldData,
                username,
                ...updateData
            });
            
            // Delete old document
            await db.collection("users").doc(oldUsername).delete();
        } else {
            // Just update the existing document
            await db.collection("users").doc(oldUsername).update(updateData);
        }
        
        alert("Employee information updated successfully!");
        
        // Reload the employee list
        loadAllEmployees();
        
        // Hide the edit form
        document.getElementById("editFormContainer").style.display = "none";
        
    } catch (error) {
        console.error("Error updating employee:", error);
        alert("Error updating employee: " + error.message);
    }
}

// -----------------------------------------------------
// SHOW RESET PASSWORD FORM (ADMIN)
// -----------------------------------------------------
async function showResetPasswordForm() {
    if (!(await requirePermission("edit"))) {
        alert("You do not have permission to EDIT users.");
        return;
    }


    const panel = document.getElementById("um-content");
    
    panel.innerHTML = `
        <h2 class="um-section-title">Reset User Password</h2>
        
        <div class="um-search-container">
            <input type="text" id="searchResetUser" class="um-search-input" 
                   placeholder="Search user by username, name, or email">
            <button id="searchResetBtn" class="um-search-btn">SEARCH</button>
        </div>
        
        <div id="resetUserList">
            <div class="um-count-label" id="resetCountLabel">Search for users...</div>
            <div class="um-table-wrapper">
                <table class="um-employees-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="resetUserTableBody">
                        <tr><td colspan="6" style="text-align: center; padding: 40px;">Search for users to reset their password.</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="resetPasswordForm" class="um-edit-section" style="display: none;">
            <h3 class="um-edit-title">Reset Password for: <span id="resetUserName"></span></h3>
            <div class="form-row">
    <p style="max-width: 400px; font-size: 15px;">
        A secure password reset link will be sent to the user's registered email address.
    </p>
</div>
            <div style="margin-top: 35px; display: flex; gap: 20px;">
                <button id="confirmResetBtn" class="um-submit-btn">RESET PASSWORD</button>
                <button id="cancelResetBtn" class="um-submit-btn" style="background-color: #f0c0b0;">CANCEL</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById("searchResetBtn").addEventListener("click", searchResetUsers);
    document.getElementById("searchResetUser").addEventListener("keypress", (e) => {
        if (e.key === "Enter") searchResetUsers();
    });
    
    document.getElementById("generatePasswordBtn").addEventListener("click", generatePasswordForReset);
}

// -----------------------------------------------------
// SEARCH USERS FOR PASSWORD RESET
// -----------------------------------------------------
async function searchResetUsers() {
    const searchTerm = document.getElementById("searchResetUser").value.toLowerCase().trim();
    const countLabel = document.getElementById("resetCountLabel");
    
    try {
        const querySnapshot = await db.collection("users").get();
        const users = [];
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            users.push({ id: doc.id, ...data });
        });
        
        if (searchTerm === "") {
            displayResetUsers(querySnapshot);
            return;
        }
        
        const filtered = users.filter(user => {
    const username  = (user.username  || "").toLowerCase();
    const firstname = (user.firstname || "").toLowerCase();
    const lastname  = (user.lastname  || "").toLowerCase();
    const email     = (user.email     || "").toLowerCase();

    return (
        username.includes(searchTerm) ||
        firstname.includes(searchTerm) ||
        lastname.includes(searchTerm) ||
        email.includes(searchTerm)
    );
});

        
        displayFilteredResetUsers(filtered, searchTerm);
    } catch (error) {
        console.error("Error searching users:", error);
        const tableBody = document.getElementById("resetUserTableBody");
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #c62828;">Error searching users: ${error.message}</td></tr>`;
        }
    }
}

// -----------------------------------------------------
// DISPLAY USERS FOR PASSWORD RESET
// -----------------------------------------------------
function displayResetUsers(querySnapshot) {
    const tableBody = document.getElementById("resetUserTableBody");
    const countLabel = document.getElementById("resetCountLabel");
    
    if (!tableBody || !countLabel) return;
    
    if (querySnapshot.empty) {
        countLabel.textContent = "No users found";
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">No users in the system.</td></tr>`;
        return;
    }
    
    countLabel.textContent = `All Users (${querySnapshot.size})`;
    
    let html = "";
    
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const status = data.locked ? "Locked" : (data.active ? "Active" : "Inactive");
        const statusClass = data.locked ? "status-locked" : (data.active ? "status-active" : "status-inactive");
        
        html += `
            <tr>
                <td><strong>${data.username || doc.id}</strong></td>
                <td>${data.firstname || ""} ${data.lastname || ""}</td>
                <td>${data.email || ""}</td>
                <td>${data.role === "admin" ? "Admin" : "User"}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="um-action-btn reset-password-btn" data-username="${data.username || doc.id}" data-email="${data.email}">
                        Reset Password
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Add event listeners to reset password buttons
    document.querySelectorAll('.reset-password-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.getAttribute('data-username');
            const email = e.target.getAttribute('data-email');
            showUserResetForm(username, email);
        });
    });
}

// -----------------------------------------------------
// DISPLAY FILTERED USERS FOR PASSWORD RESET
// -----------------------------------------------------
function displayFilteredResetUsers(users, searchTerm = "") {
    const tableBody = document.getElementById("resetUserTableBody");
    const countLabel = document.getElementById("resetCountLabel");
    
    if (!tableBody || !countLabel) return;
    
    if (users.length === 0) {
        countLabel.textContent = `No users found for "${searchTerm}"`;
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">No matching users found.</td></tr>`;
        return;
    }
    
    countLabel.textContent = `Search Results (${users.length})`;
    
    let html = "";
    
    users.forEach(user => {
        const status = user.locked ? "Locked" : (user.active ? "Active" : "Inactive");
        const statusClass = user.locked ? "status-locked" : (user.active ? "status-active" : "status-inactive");
        
        html += `
            <tr>
                <td><strong>${user.username || user.id}</strong></td>
                <td>${user.firstname || ""} ${user.lastname || ""}</td>
                <td>${user.email || ""}</td>
                <td>${user.role === "admin" ? "Admin" : "User"}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="um-action-btn reset-password-btn" data-username="${user.username || user.id}" data-email="${user.email}">
                        Reset Password
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Add event listeners to reset password buttons
    document.querySelectorAll('.reset-password-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.getAttribute('data-username');
            const email = e.target.getAttribute('data-email');
            showUserResetForm(username, email);
        });
    });
}

// -----------------------------------------------------
// SHOW USER RESET FORM
// -----------------------------------------------------
function showUserResetForm(username, email) {
    const resetForm = document.getElementById("resetPasswordForm");
    resetForm.style.display = "block";

    document.getElementById("resetUserName").textContent = username;

    // Store data safely
    resetForm.dataset.username = username;
    resetForm.dataset.email = email;

    // Scroll into view
    resetForm.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Buttons
    document.getElementById("confirmResetBtn").onclick = () =>
        confirmPasswordReset(username, email);

    document.getElementById("cancelResetBtn").onclick = () => {
        resetForm.style.display = "none";
    };
}




// -----------------------------------------------------
// ADMIN RESET PASSWORD (FIREBASE EMAIL LINK)
// -----------------------------------------------------
async function confirmPasswordReset(username, email) {
    if (!email) {
        alert("User has no email.");
        return;
    }

    if (!confirm(`Send password reset link to ${email}?`)) return;

    try {
        await auth.sendPasswordResetEmail(email);
        alert("Password reset link sent successfully.");
        document.getElementById("resetPasswordForm").style.display = "none";
    } catch (err) {
        alert("Error sending reset email: " + err.message);
    }
}

// -----------------------------------------------------
// SHOW ACTIVATE/DE-ACTIVATE ACCOUNTS FORM
// -----------------------------------------------------
async function showActivateDeactivateForm() { 
    if (!(await requirePermission("edit"))) {
        alert("You do not have permission to EDIT users.");
        return;
    }
    const panel = document.getElementById("um-content");
    
    panel.innerHTML = `
        <h2 class="um-section-title">Activate / De-activate Accounts</h2>
        
        <div class="um-search-container">
            <input type="text" id="searchActivateUser" class="um-search-input" 
                   placeholder="Search user by username, name, or email">
            <button id="searchActivateBtn" class="um-search-btn">SEARCH</button>
        </div>
        
        <div style="margin: 20px 0; display: flex; gap: 15px; align-items: center;">
            <label style="font-size: 16px; font-weight: bold;">Filter by Status:</label>
            <select id="statusFilter" class="um-search-input" style="width: 180px; height: 38px;">
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
            </select>
            <button id="applyFilterBtn" class="um-search-btn">APPLY FILTER</button>
        </div>
        
        <div id="activateUserList">
            <div class="um-count-label" id="activateCountLabel">Search for users...</div>
            <div class="um-table-wrapper">
                <table class="um-employees-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Current Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="activateUserTableBody">
                        <tr><td colspan="6" style="text-align: center; padding: 40px;">Search for users to manage their account status.</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="activateDeactivateForm" class="um-edit-section" style="display: none;">
            <h3 class="um-edit-title">Manage Account Status for: <span id="targetUserName"></span></h3>
            
            <div class="form-row">
                <label>Current Status:</label>
                <span id="currentStatusDisplay" style="font-weight: bold; font-size: 18px; padding: 8px 16px; border-radius: 6px;"></span>
            </div>
            
            <div class="form-row">
                <label>New Status:</label>
                <div style="display: flex; flex-direction: column; gap: 15px; width: 280px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="radio" id="statusActive" name="accountStatus" value="active">
                        <label for="statusActive" style="font-size: 18px; cursor: pointer;">
                            <span style="color: #2e7d32; font-weight: bold;">● ACTIVE</span> - User can log in normally
                        </label>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="radio" id="statusInactive" name="accountStatus" value="inactive">
                        <label for="statusInactive" style="font-size: 18px; cursor: pointer;">
                            <span style="color: #c62828; font-weight: bold;">● INACTIVE</span> - User cannot log in
                        </label>
                    </div>
                </div>
            </div>           
            
            <div style="margin-top: 35px; display: flex; gap: 20px;">
                <button id="confirmStatusBtn" class="um-submit-btn">UPDATE STATUS</button>
                <button id="cancelStatusBtn" class="um-submit-btn" style="background-color: #f0c0b0;">CANCEL</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById("searchActivateBtn").addEventListener("click", searchActivateUsers);
    document.getElementById("searchActivateUser").addEventListener("keypress", (e) => {
        if (e.key === "Enter") searchActivateUsers();
    });
    
    document.getElementById("applyFilterBtn").addEventListener("click", applyStatusFilter);
    document.getElementById("statusFilter").addEventListener("change", applyStatusFilter);
    document.getElementById("confirmStatusBtn").addEventListener("click", updateAccountStatus);
document.getElementById("cancelStatusBtn").addEventListener("click", () => {
    document.getElementById("activateDeactivateForm").style.display = "none";
});

    // Load all users initially
    loadAllActivateUsers();
}



// -----------------------------------------------------
// LOAD ALL USERS FOR ACTIVATE/DEACTIVATE
// -----------------------------------------------------
async function loadAllActivateUsers() {
    try {
        const querySnapshot = await db.collection("users").get();
        displayActivateUsers(querySnapshot);
    } catch (error) {
        console.error("Error loading users:", error);
        const tableBody = document.getElementById("activateUserTableBody");
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #c62828;">Error loading users: ${error.message}</td></tr>`;
        }
    }
}

// -----------------------------------------------------
// SEARCH USERS FOR ACTIVATE/DEACTIVATE
// -----------------------------------------------------
async function searchActivateUsers() {
    const searchTerm = document.getElementById("searchActivateUser").value.toLowerCase().trim();
    const filterValue = document.getElementById("statusFilter").value;
    
    try {
        const querySnapshot = await db.collection("users").get();
        const users = [];
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            users.push({ id: doc.id, ...data });
        });
        
        let filteredUsers = users;
        
        // Apply search filter
        filteredUsers = filteredUsers.filter(user => {
    const username  = (user.username  || "").toLowerCase();
    const firstname = (user.firstname || "").toLowerCase();
    const lastname  = (user.lastname  || "").toLowerCase();
    const email     = (user.email     || "").toLowerCase();

    return (
        username.includes(searchTerm) ||
        firstname.includes(searchTerm) ||
        lastname.includes(searchTerm) ||
        email.includes(searchTerm)
    );
});

        
        // Apply status filter (exclude locked from this feature)
        if (filterValue !== "all") {
            filteredUsers = filteredUsers.filter(user => {
                if (filterValue === "active") return user.active === true && user.locked !== true;
                if (filterValue === "inactive") return user.active === false && user.locked !== true;
                return true;
            });
        }
        
        displayFilteredActivateUsers(filteredUsers, searchTerm, filterValue);
    } catch (error) {
        console.error("Error searching users:", error);
        const tableBody = document.getElementById("activateUserTableBody");
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #c62828;">Error searching users: ${error.message}</td></tr>`;
        }
    }
}

// -----------------------------------------------------
// APPLY STATUS FILTER
// -----------------------------------------------------
function applyStatusFilter() {
    searchActivateUsers();
}

// -----------------------------------------------------
// DISPLAY USERS FOR ACTIVATE/DEACTIVATE
// -----------------------------------------------------
function displayActivateUsers(querySnapshot) {
    const tableBody = document.getElementById("activateUserTableBody");
    const countLabel = document.getElementById("activateCountLabel");
    
    if (!tableBody || !countLabel) return;
    
    if (querySnapshot.empty) {
        countLabel.textContent = "No users found";
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">No users in the system.</td></tr>`;
        return;
    }
    
    // Filter out locked accounts
    const nonLockedUsers = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.locked) {
            nonLockedUsers.push({ id: doc.id, ...data });
        }
    });
    
    if (nonLockedUsers.length === 0) {
        countLabel.textContent = "No non-locked users found";
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">All accounts are currently locked. Use UNLOCK LOCKED USERS feature first.</td></tr>`;
        return;
    }
    
    countLabel.textContent = `Non-Locked Users (${nonLockedUsers.length})`;
    
    let html = "";
    
    nonLockedUsers.forEach(data => {
        const statusClass = data.active ? "status-active" : "status-inactive";
        const statusText = data.active ? "Active" : "Inactive";
        
        html += `
            <tr>
                <td><strong>${data.username || data.id}</strong></td>
                <td>${data.firstname || ""} ${data.lastname || ""}</td>
                <td>${data.email || ""}</td>
                <td>${data.role === "admin" ? "Admin" : "User"}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="um-action-btn manage-status-btn" 
                            data-username="${data.username || data.id}" 
                            data-email="${data.email}"
                            data-current-active="${data.active || false}"
                            data-current-locked="${false}">
                        Manage Status
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Add event listeners to manage status buttons
    document.querySelectorAll('.manage-status-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.getAttribute('data-username');
            const email = e.target.getAttribute('data-email');
            const currentActive = e.target.getAttribute('data-current-active') === 'true';
            const currentLocked = e.target.getAttribute('data-current-locked') === 'true';
            showUserStatusForm(username, email, currentActive, currentLocked);
        });
    });
}

// -----------------------------------------------------
// DISPLAY FILTERED USERS FOR ACTIVATE/DEACTIVATE
// -----------------------------------------------------
function displayFilteredActivateUsers(users, searchTerm = "", filterValue = "all") {
    const tableBody = document.getElementById("activateUserTableBody");
    const countLabel = document.getElementById("activateCountLabel");
    
    if (!tableBody || !countLabel) return;
    
    // Filter out locked accounts
    const nonLockedUsers = users.filter(user => !user.locked);
    
    if (nonLockedUsers.length === 0) {
        let message = "No non-locked users found";
        if (searchTerm) message += ` for "${searchTerm}"`;
        if (filterValue !== "all") message += ` with status: ${filterValue}`;
        countLabel.textContent = message;
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">${message}. Use UNLOCK LOCKED USERS feature for locked accounts.</td></tr>`;
        return;
    }
    
    let filterText = "";
    if (searchTerm) filterText += `Search: "${searchTerm}"`;
    if (filterValue !== "all") {
        if (filterText) filterText += " • ";
        filterText += `Status: ${filterValue}`;
    }
    
    countLabel.textContent = `Non-Locked Users (${nonLockedUsers.length})${filterText ? ` • ${filterText}` : ''}`;
    
    let html = "";
    
    nonLockedUsers.forEach(user => {
        const statusClass = user.active ? "status-active" : "status-inactive";
        const statusText = user.active ? "Active" : "Inactive";
        
        html += `
            <tr>
                <td><strong>${user.username || user.id}</strong></td>
                <td>${user.firstname || ""} ${user.lastname || ""}</td>
                <td>${user.email || ""}</td>
                <td>${user.role === "admin" ? "Admin" : "User"}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="um-action-btn manage-status-btn" 
                            data-username="${user.username || user.id}" 
                            data-email="${user.email}"
                            data-current-active="${user.active || false}"
                            data-current-locked="${false}">
                        Manage Status
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Add event listeners to manage status buttons
    document.querySelectorAll('.manage-status-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.getAttribute('data-username');
            const email = e.target.getAttribute('data-email');
            const currentActive = e.target.getAttribute('data-current-active') === 'true';
            const currentLocked = e.target.getAttribute('data-current-locked') === 'true';
            showUserStatusForm(username, email, currentActive, currentLocked);
        });
    });
}

// -----------------------------------------------------
// HELPER FUNCTIONS FOR ACCOUNT STATUS
// -----------------------------------------------------
function getAccountStatus(user) {
    if (user.locked) return "locked";
    return user.active ? "active" : "inactive";
}

function getStatusClass(user) {
    if (user.locked) return "status-locked";
    return user.active ? "status-active" : "status-inactive";
}

function getStatusText(user) {
    if (user.locked) return "Locked";
    return user.active ? "Active" : "Inactive";
}

// -----------------------------------------------------
// SHOW USER STATUS FORM
// -----------------------------------------------------
function showUserStatusForm(username, email, currentActive, currentLocked) {
    // Skip if user is locked (handle in UNLOCK feature)
    if (currentLocked) {
        alert("This account is currently LOCKED. Please use the UNLOCK LOCKED USERS feature to unlock it first.");
        return;
    }
    
    // Show the status form
    const statusForm = document.getElementById("activateDeactivateForm");
    statusForm.style.display = "block";
    
    // Set the username in the title
    document.getElementById("targetUserName").textContent = username;
    
    // Determine current status
    let currentStatus = currentActive ? "active" : "inactive";
    let currentStatusText = currentActive ? "Active" : "Inactive";
    let currentStatusClass = currentActive ? "status-active" : "status-inactive";
    
    // Display current status
    const statusDisplay = document.getElementById("currentStatusDisplay");
    statusDisplay.textContent = currentStatusText;
    statusDisplay.className = "";
    statusDisplay.classList.add("status-badge", currentStatusClass);
    
    // Set the appropriate radio button based on current status
    document.getElementById("statusActive").checked = currentActive;
    document.getElementById("statusInactive").checked = !currentActive;

    document.getElementById("confirmStatusBtn").onclick = () => {
        confirmStatusChange(username, email, currentActive ? "active" : "inactive");
    };

    document.getElementById("cancelStatusBtn").onclick = () => {
        statusForm.style.display = "none";
    };

    
    // Clear reason field
    document.getElementById("statusChangeReason").value = "";
    
    // Set default notification setting
    document.getElementById("notifyUser").value = "yes";
    
    // Store username and email as data attributes on the form
    statusForm.setAttribute("data-username", username);
    statusForm.setAttribute("data-email", email);
    statusForm.setAttribute("data-current-status", currentStatus);
    
    // Scroll to status form
    statusForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Add event listeners
    document.getElementById("confirmStatusBtn").onclick = () => confirmStatusChange(username, email, currentStatus);
    document.getElementById("cancelStatusBtn").onclick = () => {
        statusForm.style.display = "none";
    };
}

// -----------------------------------------------------
// CONFIRM STATUS CHANGE
// -----------------------------------------------------
async function confirmStatusChange(username, email, oldStatus) {
    // Get selected new status
    let newStatus;
    if (document.getElementById("statusActive").checked) newStatus = "active";
    else if (document.getElementById("statusInactive").checked) newStatus = "inactive";
    else {
        alert("Please select a new status for the account.");
        return;
    }
    
    // Check if status is actually changing
    if (newStatus === oldStatus) {
        alert("The account already has this status. No changes were made.");
        return;
    }
    
    const reason = document.getElementById("statusChangeReason").value.trim();
    const notifyUser = document.getElementById("notifyUser").value === "yes";
    
    // Prepare confirmation message
    const statusMap = {
        "active": "ACTIVE",
        "inactive": "INACTIVE"
    };
    
    const oldStatusText = statusMap[oldStatus];
    const newStatusText = statusMap[newStatus];
    
    const confirmMessage = `Are you sure you want to change the account status for ${username}?\n\n` +
                          `FROM: ${oldStatusText}\n` +
                          `TO: ${newStatusText}\n\n` +
                          `${reason ? `Reason: ${reason}\n\n` : ''}` +
                          `${notifyUser ? 'User will be notified via email.' : 'No notification will be sent.'}`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        // Prepare update data based on new status
        const updateData = {
            statusUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            statusUpdatedBy: auth.currentUser.displayName
        };
        
        // Set active flag based on new status
        updateData.active = (newStatus === "active");
        
        // Add reason if provided
        if (reason) {
            updateData.statusChangeReason = reason;
        }
        
        // Add status history
        const statusHistory = {
            oldStatus: oldStatus,
            newStatus: newStatus,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            changedBy: auth.currentUser.displayName,
            reason: reason || "No reason provided"
        };
        
        // Get current user data to update history array
        const userDoc = await db.collection("users").doc(username).get();
        const userData = userDoc.data();
        
        // Create or update status history array
        const currentHistory = userData.statusHistory || [];
        currentHistory.push(statusHistory);
        updateData.statusHistory = currentHistory;
        
        // Update the user document
        await db.collection("users").doc(username).update(updateData);
        
        // Send notification email if requested
        if (notifyUser && email) {
            try {
                const emailData = {
                    firstname: userData.firstname || "",
                    lastname: userData.lastname || "",
                    username: username,
                    old_status: oldStatusText,
                    new_status: newStatusText,
                    reason: reason || "Account status updated by administrator",
                    time: new Date().toLocaleString(),
                    to_email: email,
                    changed_by: auth.currentUser.displayName
                };
                
                // Use existing email template
                await emailjs.send("service_y7zhrnm", "template_y7itpo4", {
                    ...emailData,
                    password: "Your account status has been changed. Please contact administrator for details.",
                    subject: `Account Status Changed to ${newStatusText}`
                });
            } catch (emailError) {
                console.error("Error sending status change email:", emailError);
                // Don't alert here, just log it
            }
        }
        
        // Show success message
        alert(`Account status for ${username} has been successfully updated from ${oldStatusText} to ${newStatusText}.`);
        
        // Hide the status form
        document.getElementById("activateDeactivateForm").style.display = "none";
        
        // Refresh the user list
        searchActivateUsers();
        
    } catch (error) {
        console.error("Error updating account status:", error);
        alert("Error updating account status: " + error.message);
    }
}

// -----------------------------------------------------
// SHOW UNLOCK LOCKED USERS FORM
// -----------------------------------------------------
async function showUnlockUsersForm() {
    if (!(await requirePermission("edit"))) {
        alert("You do not have permission to UNLOCK users.");
        return;
    }
    const panel = document.getElementById("um-content");
    
    panel.innerHTML = `
        <h2 class="um-section-title">Unlock Locked Accounts</h2>
        
        <div class="um-search-container">
            <input type="text" id="searchLockedUser" class="um-search-input" 
                   placeholder="Search locked users by username, name, or email">
            <button id="searchLockedBtn" class="um-search-btn">SEARCH</button>
        </div>
        
        <div id="lockedUserList">
            <div class="um-count-label" id="lockedCountLabel">Loading locked accounts...</div>
            <div class="um-table-wrapper">
                <table class="um-employees-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Locked Since</th>
                            <th>Failed Attempts</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="lockedUserTableBody">
                        <tr><td colspan="6" style="text-align: center; padding: 40px;">Loading locked accounts...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="unlockForm" class="um-edit-section" style="display: none;">
            <h3 class="um-edit-title">Unlock Account: <span id="unlockUserName"></span></h3>
            
            <div class="form-row">
                <label>Username:</label>
                <input type="text" id="unlockUserField" readonly style="background:#e9e1d6;">
            </div>
            
            <div class="form-row">
                <label>Lock Reason:</label>
                <textarea id="lockReasonField" rows="2" readonly style="background:#e9e1d6; width: 280px;"></textarea>
            </div>
            
            <div class="form-row">
                <label>Reset Failed Attempts:</label>
                <select id="resetAttempts" style="width: 280px; height: 38px; border-radius: 8px; border: 2px solid #8b6f61; padding: 0 10px;">
                    <option value="yes">Yes - Reset to 0</option>
                    <option value="no">No - Keep current count</option>
                </select>
            </div>
            
            <div style="margin-top: 35px; display: flex; gap: 20px;">
                <button id="confirmUnlockBtn" class="um-submit-btn">UNLOCK ACCOUNT</button>
                <button id="cancelUnlockBtn" class="um-submit-btn" style="background-color: #f0c0b0;">CANCEL</button>
            </div>
        </div>
    `;
    
    // Load locked users
    loadLockedUsers();
    
    // Add event listeners
    document.getElementById("searchLockedBtn").addEventListener("click", searchLockedUsers);
    document.getElementById("searchLockedUser").addEventListener("keypress", (e) => {
        if (e.key === "Enter") searchLockedUsers();
    });
}

// -----------------------------------------------------
// LOAD LOCKED USERS
// -----------------------------------------------------
async function loadLockedUsers() {
    try {
        const querySnapshot = await db.collection("users").where("locked", "==", true).get();
        displayLockedUsers(querySnapshot);
    } catch (error) {
        console.error("Error loading locked users:", error);
        const tableBody = document.getElementById("lockedUserTableBody");
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #c62828;">Error loading locked users: ${error.message}</td></tr>`;
        }
    }
}

// Helper function to display locked users
function displayLockedUsers(querySnapshot) {
    const tableBody = document.getElementById("lockedUserTableBody");
    const countLabel = document.getElementById("lockedCountLabel");
    
    if (!tableBody || !countLabel) return;
    
    if (querySnapshot.empty) {
        countLabel.textContent = "No locked accounts found";
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">No locked accounts in the system.</td></tr>`;
        return;
    }
    
    countLabel.textContent = `Locked Accounts (${querySnapshot.size})`;
    
    let html = "";
    
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const lockedAt = data.lockedAt ? new Date(data.lockedAt.toDate()).toLocaleString() : "Unknown";
        
        html += `
            <tr>
                <td><strong>${data.username || doc.id}</strong></td>
                <td>${data.firstname || ""} ${data.lastname || ""}</td>
                <td>${data.email || ""}</td>
                <td>${lockedAt}</td>
                <td style="color: #c62828; font-weight: bold;">${data.failedAttempts || 0}</td>
                <td>
                    <button class="um-action-btn reset-password-btn" 
                            data-username="${data.username || doc.id}" 
                            data-email="${data.email}"
                            data-lock-reason="${data.lockReason || 'Too many failed attempts'}"
                            data-failed-attempts="${data.failedAttempts || 0}">
                        Unlock Account
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Add event listeners to unlock buttons
    document.querySelectorAll('.reset-password-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const username = e.target.getAttribute('data-username');
            const email = e.target.getAttribute('data-email');
            const lockReason = e.target.getAttribute('data-lock-reason');
            const failedAttempts = e.target.getAttribute('data-failed-attempts');
            
            // Show unlock form
            const unlockForm = document.getElementById("unlockForm");
            unlockForm.style.display = "block";
            document.getElementById("unlockUserName").textContent = username;
            document.getElementById("unlockUserField").value = username;
            document.getElementById("lockReasonField").value = lockReason;
            
            // Add event listeners for unlock form
            document.getElementById("confirmUnlockBtn").onclick = async () => {
                if (!confirm(`Unlock account for ${username}?`)) return;
                
                try {
                    await db.collection("users").doc(username).update({
                        locked: false,
                        failedAttempts: 0,
                        unlockedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    alert(`Account ${username} unlocked successfully!`);
                    unlockForm.style.display = "none";
                    loadLockedUsers();
                } catch (error) {
                    alert("Error unlocking account: " + error.message);
                }
            };
            
            document.getElementById("cancelUnlockBtn").onclick = () => {
                unlockForm.style.display = "none";
            };
        });
    });
}

function showViewLockedForm() {
    const panel = document.getElementById("um-content");

    panel.innerHTML = `
        <h2 class="um-section-title">View Locked Accounts</h2>

        <div id="lockedUserList">
            <div class="um-count-label" id="lockedCountLabel">Loading locked accounts...</div>

            <div class="um-table-wrapper">
                <table class="um-employees-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="lockedUserTableBody">
                        <tr>
                            <td colspan="5" style="text-align:center; padding:40px;">
                                Loading...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    loadLockedUsers(); // load ALL locked users automatically
}


// Helper function for view locked users
async function loadViewLockedUsers() {
    try {
        const querySnapshot = await db.collection("users").where("locked", "==", true).get();
        const users = [];
        querySnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
        displayViewLockedUsersList(users);
    } catch (error) {
        console.error("Error loading locked users:", error);
    }
}

function displayViewLockedUsersList(users) {
    const tableBody = document.getElementById("viewLockedTableBody");
    const countLabel = document.getElementById("viewLockedCountLabel");
    
    if (!tableBody || !countLabel) return;
    
    if (users.length === 0) {
        countLabel.textContent = "No locked accounts found";
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px;">No locked accounts in the system.</td></tr>`;
        return;
    }
    
    countLabel.textContent = `Locked Accounts (${users.length})`;
    
    let html = "";
    
    users.forEach(user => {
        const lockedAt = user.lockedAt ? new Date(user.lockedAt.toDate()).toLocaleString() : "Unknown";
        const lockReason = user.lockReason || "Too many failed login attempts";
        
        html += `
            <tr>
                <td><strong>${user.username || user.id}</strong></td>
                <td>${user.firstname || ""} ${user.lastname || ""}</td>
                <td>${user.email || ""}</td>
                <td>${user.role === "admin" ? "Admin" : "User"}</td>
                <td>${lockedAt}</td>
                <td style="color: #c62828; font-weight: bold;">${user.failedAttempts || 0}</td>
                <td>${lockReason}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

async function updateAccountStatus() {
    const username = document.getElementById("targetUserName").textContent;
    const isActive = document.getElementById("statusActive").checked;
    const isInactive = document.getElementById("statusInactive").checked;

    if (!isActive && !isInactive) {
        alert("Please select a new status.");
        return;
    }

    try {
        await db.collection("users").doc(username).update({
            active: isActive
        });

        alert("Account status updated successfully!");

        document.getElementById("activateDeactivateForm").style.display = "none";
        loadAllActivateUsers(); // refresh table

    } catch (err) {
        alert("Error updating status: " + err.message);
    }
}
function applyFooterPermissions(permissions) {
    const btnAdd  = document.getElementById("btnAdd");
    const btnEdit = document.getElementById("btnEdit");
    const btnView = document.getElementById("btnView");

    if (!btnAdd || !btnEdit || !btnView) return;

    const map = [
        { btn: btnAdd,  allowed: permissions.add },
        { btn: btnEdit, allowed: permissions.edit },
        { btn: btnView, allowed: permissions.view }
    ];

    map.forEach(item => {
        item.btn.classList.remove("allowed", "denied");

        if (item.allowed) {
            item.btn.classList.add("allowed");
            item.btn.disabled = false;
        } else {
            item.btn.classList.add("denied");
            item.btn.disabled = true;
        }
    });
}
firebase.auth().onAuthStateChanged(user => {
    if (!user) return;

    db.collection("users").doc(user.uid).get().then(doc => {
        if (!doc.exists) return;

        const data = doc.data();

        console.log("Permissions loaded:", data.permissions); // DEBUG

        if (data.permissions) {
            applyFooterPermissions(data.permissions);
        }
    });
});
function initFooterPermissions() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) return;

        const username = user.displayName;
        const doc = await db.collection("users").doc(username).get();
        if (!doc.exists) return;

        const perms = doc.data().permissions;

        const btnAdd  = document.getElementById("btnAdd");
        const btnEdit = document.getElementById("btnEdit");
        const btnView = document.getElementById("btnView");

        function apply(btn, allowed) {
            if (!btn) return;
            btn.disabled = !allowed;
            btn.classList.remove("perm-allowed", "perm-denied");
            btn.classList.add(allowed ? "perm-allowed" : "perm-denied");
        }

        apply(btnAdd, perms.add);
        apply(btnEdit, perms.edit);
        apply(btnView, perms.view);
    });
}

document.addEventListener("DOMContentLoaded", initFooterPermissions);


