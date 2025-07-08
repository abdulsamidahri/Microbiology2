// Authentication check
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// Data storage
let students = [];
let teachers = [];
let teacherAssignments = [];
let classes = [];
let attendance = [];

// List of all subjects in the curriculum
const ALL_SUBJECTS = [
    'Functional English',
    'Ideology and Constitution of Pakistan',
    'Dynamics of Natural Sciences',
    'Application of Information and Communication Technologies (ICT)',
    'Zoology-I (Protozoology)',
    'Fundamentals of Microbiology-I',
    'Expository Writing',
    'Islamic Studies/Ethics',
    'Quantitative Reasoning-I',
    'Biochemistry',
    'Biosafety And Risk Management',
    'Quantitative Reasoning-II',
    'Civics and community engagement',
    'Zoology-II (Epidemiology of Parasitic disease)',
    'Introduction to Medical Microbiology',
    'General Immunology',
    'Environmental Microbiology & Public Health',
    'Perspectives in Social sciences',
    'Entrepreneurship',
    'Creative Arts and Communication',
    'Pakistan Studies',
    'Zoology-III (Histology)',
    'Microbial Taxonomy',
    'Soil Microbiology',
    'Research Methodology',
    'Microbial Anatomy and Physiology',
    'Cell Biology-I',
    'General Virology',
    'Mycology',
    'Diagnostic Chemistry for Microbial Diseases',
    'Cell Biology-II',
    'Bacterial Genetics',
    'Epidemiology, Public health and bioethics',
    'Applied Microbial Technology',
    'Clinical Parasitology',
    'Food and Dairy Microbiology',
    'Pharmaceutical Microbiology',
    'Field Experience / Internship',
    'Cell & Tissue Culture Technology',
    'Nano-Biotechnology',
    'Molecular Mechanism of Anti-Microbial Agents',
    'Microbial Enzyme Technology',
    'Industrial Microbiology',
    'Artificial Intelligence in Microbiology',
    'Capstone Project'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    try {
        // Load existing data
        loadData();
        
        // Validate loaded data
        if (!validateData()) {
            console.warn('Data validation failed, attempting to repair data structures...');
            repairData();
        }

        // Only set default data if no data exists
        if (needsDefaultData()) {
            setDefaultData();
        }

        // Save data to ensure consistency
        saveData();
        showDashboard();
    } catch (error) {
        console.error('Error during app initialization:', error);
        showToast('There was an error loading the application data. Please contact support.', 'error');
    }
}

function validateData() {
    // Check if all required data structures are arrays
    if (!Array.isArray(students) || !Array.isArray(teachers) || 
        !Array.isArray(teacherAssignments) || !Array.isArray(classes) || 
        !Array.isArray(attendance)) {
        return false;
    }

    // For empty data, consider it valid (new installation)
    if (students.length === 0 && teachers.length === 0 && classes.length === 0) {
        return true;
    }

    // Validate teacher assignments reference valid teachers
    const validTeacherIds = new Set(teachers.map(t => t.id));
    const validAssignments = teacherAssignments.every(ta => validTeacherIds.has(ta.teacherId));
    if (!validAssignments) {
        return false;
    }

    // Validate student class references
    const validClassNames = new Set(classes.map(c => c.name));
    const validStudents = students.every(s => validClassNames.has(s.class));
    if (!validStudents) {
        return false;
    }

    return true;
}

function repairData() {
    // Ensure all arrays are initialized
    students = Array.isArray(students) ? students : [];
    teachers = Array.isArray(teachers) ? teachers : [];
    teacherAssignments = Array.isArray(teacherAssignments) ? teacherAssignments : [];
    classes = Array.isArray(classes) ? classes : [];
    attendance = Array.isArray(attendance) ? attendance : [];

    // Remove invalid teacher assignments
    const validTeacherIds = new Set(teachers.map(t => t.id));
    teacherAssignments = teacherAssignments.filter(ta => validTeacherIds.has(ta.teacherId));

    // Remove invalid student class references
    const validClassNames = new Set(classes.map(c => c.name));
    students = students.filter(s => validClassNames.has(s.class));

    // Save repaired data
    saveData();
}

function needsDefaultData() {
    return teachers.length === 0 || teacherAssignments.length === 0 || classes.length === 0;
}

function setDefaultData() {
    // Only set teachers and assignments if they don't exist
    if (teachers.length === 0) {
        teachers = [
            { id: '1', name: 'Dr. Abdul Sami' },
            { id: '2', name: 'Dr. Asim Patrick' }
        ];
    }

    if (teacherAssignments.length === 0) {
        teacherAssignments = [
            { teacherId: '1', class: 'BS-I', subject: 'Biosafety And Risk Management' },
            { teacherId: '1', class: 'BS-II', subject: 'Soil Microbiology' },
            { teacherId: '2', class: 'BS-I', subject: 'Fundamentals of Microbiology-I' },
            { teacherId: '2', class: 'BS-II', subject: 'Microbial Taxonomy' }
        ];
    }

    if (classes.length === 0) {
        classes = [
            { name: 'BS-I' },
            { name: 'BS-II' }
        ];
    }
}

// Data management functions
function loadData() {
    try {
        // Load each data type separately with error handling
        const loadFromStorage = (key, defaultValue = []) => {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch (error) {
                console.error(`Error loading ${key}:`, error);
                return defaultValue;
            }
        };

        students = loadFromStorage('students');
        teachers = loadFromStorage('teachers');
        teacherAssignments = loadFromStorage('teacherAssignments');
        classes = loadFromStorage('classes');
        attendance = loadFromStorage('attendance');

        // Only show warning if there's actual data corruption
        if (!validateData() && (students.length > 0 || teachers.length > 0 || classes.length > 0)) {
            showToast('Error loading data. Some data may be missing.', 'error');
        }

    } catch (error) {
        console.error('Error in loadData:', error);
        // Reset to default state if there's a critical error
        students = [];
        teachers = [];
        teacherAssignments = [];
        classes = [];
        attendance = [];
        setDefaultData();
    }
}

function saveData() {
    try {
        // Validate data before saving
        if (!validateData()) {
            repairData();
        }

        // Save each data type separately with error handling
        const saveToStorage = (key, data) => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error(`Error saving ${key}:`, error);
                showToast(`Error saving ${key}. Please try again.`, 'error');
                return false;
            }
        };

        // Save all data
        const savedSuccessfully = 
            saveToStorage('students', students) &&
            saveToStorage('teachers', teachers) &&
            saveToStorage('teacherAssignments', teacherAssignments) &&
            saveToStorage('classes', classes) &&
            saveToStorage('attendance', attendance);

        if (savedSuccessfully) {
            updateDashboardStats();
        }

        // Add backup to sessionStorage as fallback
        try {
            sessionStorage.setItem('dataBackup', JSON.stringify({
                students, teachers, teacherAssignments, classes, attendance,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.warn('Failed to create backup in sessionStorage:', error);
        }

    } catch (error) {
        console.error('Error in saveData:', error);
        showToast('Error saving data. Please try again.', 'error');
    }
}

function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.csv')) {
        showToast('Please upload a CSV file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const rows = text.split('\n');
            
            // Skip header row and process data
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row) continue; // Skip empty rows
                
                const columns = row.split(',').map(col => col.trim());
                
                // Expect: Roll Number, Name, Class
                if (columns.length >= 3) {
                    const rollNumber = columns[0];
                    const name = columns[1];
                    const className = columns[2];
                    
                    // Validate class exists
                    if (!classes.some(c => c.name === className)) {
                        errorCount++;
                        continue;
                    }
                    
                    // Check for duplicate roll number
                    if (students.some(s => s.id === rollNumber)) {
                        errorCount++;
                        continue;
                    }
                    
                    // Add new student
                    students.push({
                        id: rollNumber,
                        name: name,
                        class: className
                    });
                    successCount++;
                } else {
                    errorCount++;
                }
            }
            
            // Save data and update display
            saveData();
            updateStudentTable();
            
            // Show results
            showToast(`Successfully added ${successCount} students. ${errorCount > 0 ? errorCount + ' entries had errors.' : ''}`, 
                      errorCount > 0 ? 'warning' : 'success');
            
            // Reset file input
            event.target.value = '';
            
        } catch (error) {
            console.error('Error processing CSV:', error);
            showToast('Error processing CSV file. Please check the format.', 'error');
        }
    };
    
    reader.onerror = function() {
        showToast('Error reading the file', 'error');
    };
    
    reader.readAsText(file);
}

// Navigation functions
function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard').classList.remove('hidden');
    updateDashboardStats();
}

function showStudents() {
    hideAllSections();
    document.getElementById('students').classList.remove('hidden');
    updateStudentTable();
}

function showTeachers() {
    hideAllSections();
    document.getElementById('teachers').classList.remove('hidden');
    updateTeacherTable();
}

function showClasses() {
    hideAllSections();
    document.getElementById('classes').classList.remove('hidden');
    updateClassTable();
}

function showAttendance() {
    hideAllSections();
    document.getElementById('attendance').classList.remove('hidden');
    
    // Initialize date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    
    // Update class dropdown
    const classSelect = document.getElementById('attendanceClass');
    classSelect.innerHTML = '<option value="">Select Class</option>' +
        classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    
    // Add event listeners
    classSelect.addEventListener('change', updateSubjectDropdown);
    document.getElementById('attendanceSubject').addEventListener('change', updateAttendanceTable);
    document.getElementById('attendanceDate').addEventListener('change', updateAttendanceTable);
}

function showReports() {
    hideAllSections();
    document.getElementById('reports').classList.remove('hidden');
}

function hideAllSections() {
    const sections = ['dashboard', 'students', 'teachers', 'classes', 'attendance', 'reports'];
    sections.forEach(section => {
        document.getElementById(section).classList.add('hidden');
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('hidden');
}

// Dashboard statistics
function updateDashboardStats() {
    const stats = {
        students: students.length,
        teachers: new Set(teachers.map(t => t.id)).size,
        classes: classes.length,
        attendance: calculateAttendanceRate()
    };

    document.querySelector('#dashboard div:nth-child(1) p').textContent = stats.students;
    document.querySelector('#dashboard div:nth-child(2) p').textContent = stats.teachers;
    document.querySelector('#dashboard div:nth-child(3) p').textContent = stats.classes;
    document.querySelector('#dashboard div:nth-child(4) p').textContent = `${stats.attendance}%`;

    // Update Class Cards
    updateClassCards();
}

function updateClassCards() {
    const classCardsContainer = document.getElementById('classCards');
    classCardsContainer.innerHTML = classes.map(classItem => {
        // Get teachers assigned to this class
        const classAssignments = teacherAssignments.filter(a => a.class === classItem.name);
        const classTeachers = classAssignments.map(assignment => {
            const teacher = teachers.find(t => t.id === assignment.teacherId);
            return {
                name: teacher ? teacher.name : 'Unknown Teacher',
                subject: assignment.subject
            };
        });
        
        // Get students in this class
        const classStudents = students.filter(s => s.class === classItem.name);
        // Calculate class attendance rate
        const classAttendance = calculateClassAttendanceRate(classItem.name);

        return `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">${classItem.name}</h3>
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        ${classStudents.length} Students
                    </span>
                </div>
                
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">Attendance Rate</p>
                            <p class="text-lg font-semibold ${classAttendance >= 70 ? 'text-green-600' : 'text-red-600'}">
                                ${classAttendance}%
                            </p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Total Teachers</p>
                            <p class="text-lg font-semibold text-purple-600">
                                ${classTeachers.length}
                            </p>
                        </div>
                    </div>

                    <div class="border-t pt-4">
                        <p class="text-sm font-medium text-gray-600 mb-2">Assigned Teachers & Subjects:</p>
                        ${classTeachers.length > 0 ? 
                            `<ul class="space-y-2">
                                ${classTeachers.map(teacher => `
                                    <li class="flex justify-between items-center">
                                        <span class="text-sm font-medium">${teacher.name}</span>
                                        <span class="text-xs bg-gray-100 px-2 py-1 rounded">
                                            ${teacher.subject}
                                        </span>
                                    </li>
                                `).join('')}
                            </ul>`
                            : '<p class="text-sm text-gray-500">No teachers assigned</p>'
                        }
                    </div>

                    <div class="mt-4 flex justify-between items-center">
                        <button onclick="showStudentList('${classItem.name}')" 
                                class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                            <span>View Student List</span>
                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showStudentList(className) {
    const classStudents = students.filter(s => s.class === className);
    const modal = createModal(`${className} Students`, `
        <div class="space-y-4">
            ${classStudents.length > 0 ? `
                <div class="overflow-y-auto max-h-96">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${classStudents.map(student => `
                                <tr>
                                    <td class="px-6 py-4 text-sm text-gray-900">${student.id}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900">${student.name}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p class="text-gray-500 text-center">No students enrolled in this class</p>'}
        </div>
    `);
}

function calculateClassAttendanceRate(className) {
    const classAttendance = attendance.filter(a => {
        const student = students.find(s => s.id === a.studentId);
        return student && student.class === className;
    });

    if (classAttendance.length === 0) return 0;

    const presentCount = classAttendance.filter(record => record.status === 'present').length;
    return Math.round((presentCount / classAttendance.length) * 100);
}

function calculateAttendanceRate() {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(record => record.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
}

// Student management
function showAddStudentForm() {
    const modal = createModal('Add New Student', `
        <form id="addStudentForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Student ID</label>
                <input type="text" name="studentId" class="form-input" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" name="name" class="form-input" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Class</label>
                <select name="class" class="form-input" required>
                    ${getClassOptions()}
                </select>
            </div>
            <button type="submit" class="btn-primary w-full">Add Student</button>
        </form>
    `);

    document.getElementById('addStudentForm').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const student = {
            id: formData.get('studentId'),
            name: formData.get('name'),
            class: formData.get('class')
        };
        students.push(student);
        saveData();
        updateStudentTable();
        closeModal();
        showToast('Student added successfully', 'success');
    };
}

function updateStudentTable() {
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) return;

    // Group students by class
    const studentsByClass = {};
    students.forEach(student => {
        if (!studentsByClass[student.class]) {
            studentsByClass[student.class] = [];
        }
        studentsByClass[student.class].push(student);
    });

    // Clear existing table content
    tableBody.innerHTML = '';

    // Sort classes alphabetically
    const sortedClasses = Object.keys(studentsByClass).sort();

    // Create table content for each class
    sortedClasses.forEach(className => {
        // Add class header
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <td colspan="4" class="px-6 py-4 bg-gray-100">
                <h3 class="text-lg font-semibold text-gray-700">${className}</h3>
            </td>
        `;
        tableBody.appendChild(headerRow);

        // Sort students by ID within each class
        const sortedStudents = studentsByClass[className].sort((a, b) => a.id.localeCompare(b.id));

        // Add students for this class
        sortedStudents.forEach(student => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.class}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="editStudent('${student.id}')" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onclick="deleteStudent('${student.id}')" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add a subtle separator after each class group
        const separatorRow = document.createElement('tr');
        separatorRow.innerHTML = '<td colspan="4" class="border-b border-gray-200"></td>';
        tableBody.appendChild(separatorRow);
    });

    // Show "No students" message if there are no students
    if (sortedClasses.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                No students found. Add students using the "Add New Student" button or upload a CSV file.
            </td>
        `;
        tableBody.appendChild(emptyRow);
    }
}

function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const modal = createModal('Edit Student', `
        <form id="editStudentForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Student ID</label>
                <input type="text" name="studentId" class="form-input" value="${student.id}" readonly>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" name="name" class="form-input" value="${student.name}" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Class</label>
                <select name="class" class="form-input" required>
                    ${getClassOptions(student.class)}
                </select>
            </div>
            <button type="submit" class="btn-primary w-full">Update Student</button>
        </form>
    `);

    document.getElementById('editStudentForm').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const index = students.findIndex(s => s.id === studentId);
        students[index] = {
            id: studentId,
            name: formData.get('name'),
            class: formData.get('class')
        };
        saveData();
        updateStudentTable();
        closeModal();
        showToast('Student updated successfully', 'success');
    };
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== studentId);
        saveData();
        updateStudentTable();
        showToast('Student deleted successfully', 'success');
    }
}

// Teacher management
function showAddTeacherForm() {
    const modal = createModal('Add New Teacher', `
        <form id="addTeacherForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" id="teacherName" required class="w-full border rounded px-3 py-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select id="teacherClass" required class="w-full border rounded px-3 py-2" onchange="updateTeacherFormSubjects()">
                    ${getClassOptions()}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select id="teacherSubject" required class="w-full border rounded px-3 py-2">
                    <option value="">Select Subject</option>
                </select>
            </div>
            <div class="flex justify-end space-x-3">
                <button type="button" onclick="closeModal()" class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Teacher</button>
            </div>
        </form>
    `);

    document.getElementById('addTeacherForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('teacherName').value;
        const assignedClass = document.getElementById('teacherClass').value;
        const subject = document.getElementById('teacherSubject').value;

        // Check if teacher already exists
        let teacherId = teachers.find(t => t.name === name)?.id;
        
        if (!teacherId) {
            // Create new teacher if doesn't exist
            teacherId = Date.now().toString();
            teachers.push({
                id: teacherId,
                name: name
            });
        }

        // Create new assignment
        teacherAssignments.push({
            teacherId: teacherId,
            class: assignedClass,
            subject: subject
        });

        saveData();
        closeModal();
        showTeachers();
        showToast('Teacher added successfully');
    });

    // Initialize subject dropdown
    updateTeacherFormSubjects();
}

function updateTeacherFormSubjects() {
    const selectedClass = document.getElementById('teacherClass').value;
    const subjectSelect = document.getElementById('teacherSubject');
    
    if (!selectedClass) {
        subjectSelect.innerHTML = '<option value="">Select Class First</option>';
        subjectSelect.disabled = true;
        return;
    }

    // Get subjects that are already assigned to this class
    const assignedSubjects = teacherAssignments
        .filter(a => a.class === selectedClass)
        .map(a => a.subject);

    // Filter out already assigned subjects
    const availableSubjects = ALL_SUBJECTS.filter(subject => !assignedSubjects.includes(subject));

    subjectSelect.innerHTML = `
        <option value="">Select Subject</option>
        ${availableSubjects.map(subject => `<option value="${subject}">${subject}</option>`).join('')}
    `;
    subjectSelect.disabled = false;
}

function updateTeacherTable() {
    const tableBody = document.getElementById('teacherTableBody');
    tableBody.innerHTML = '';

    // Group assignments by teacher
    const assignmentsByTeacher = teacherAssignments.reduce((acc, assignment) => {
        const teacher = teachers.find(t => t.id === assignment.teacherId);
        if (!teacher) return acc;

        if (!acc[teacher.id]) {
            acc[teacher.id] = {
                teacher: teacher,
                assignments: []
            };
        }
        acc[teacher.id].assignments.push(assignment);
        return acc;
    }, {});

    // Create table rows
    Object.values(assignmentsByTeacher).forEach(({ teacher, assignments }) => {
        assignments.forEach((assignment, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${teacher.name}
                    ${index === 0 ? '' : '<span class="text-gray-500"> (same)</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${assignment.subject}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${assignment.class}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onclick="editTeacherAssignment('${teacher.id}', ${index})" class="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button onclick="deleteTeacherAssignment('${teacher.id}', ${index})" class="text-red-600 hover:text-red-800">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });
}

function editTeacherAssignment(teacherId, assignmentIndex) {
    const teacher = teachers.find(t => t.id === teacherId);
    const assignment = teacherAssignments.find(a => a.teacherId === teacherId);
    
    if (!teacher || !assignment) return;

    const modal = createModal('Edit Teacher Assignment', `
        <form id="editTeacherForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" id="teacherName" required class="w-full border rounded px-3 py-2" value="${teacher.name}">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select id="teacherClass" required class="w-full border rounded px-3 py-2" onchange="updateEditTeacherFormSubjects('${teacherId}')">
                    ${getClassOptions(assignment.class)}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select id="teacherSubject" required class="w-full border rounded px-3 py-2">
                    <option value="">Select Subject</option>
                </select>
            </div>
            <div class="flex justify-end space-x-3">
                <button type="button" onclick="closeModal()" class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Changes</button>
            </div>
        </form>
    `);

    // Initialize subject dropdown
    updateEditTeacherFormSubjects(teacherId);
    document.getElementById('teacherSubject').value = assignment.subject;

    document.getElementById('editTeacherForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('teacherName').value;
        const newClass = document.getElementById('teacherClass').value;
        const newSubject = document.getElementById('teacherSubject').value;

        // Update teacher name
        teacher.name = name;

        // Update assignment
        assignment.class = newClass;
        assignment.subject = newSubject;

        saveData();
        closeModal();
        showTeachers();
        showToast('Teacher updated successfully');
    });
}

function deleteTeacherAssignment(teacherId, assignmentIndex) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        // Remove the specific assignment
        teacherAssignments = teacherAssignments.filter((a, index) => 
            !(a.teacherId === teacherId && index === assignmentIndex));

        // If teacher has no more assignments, remove the teacher
        if (!teacherAssignments.some(a => a.teacherId === teacherId)) {
            teachers = teachers.filter(t => t.id !== teacherId);
        }

        saveData();
        showTeachers();
        showToast('Teacher assignment deleted successfully');
    }
}

// Class management
function showAddClassForm() {
    const modal = createModal('Add New Class', `
        <form id="addClassForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Class Name</label>
                <input type="text" name="className" class="form-input" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Teacher</label>
                <select name="teacher" class="form-input" required>
                    ${getTeacherOptions()}
                </select>
            </div>
            <button type="submit" class="btn-primary w-full">Add Class</button>
        </form>
    `);

    document.getElementById('addClassForm').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newClass = {
            name: formData.get('className'),
            teacher: formData.get('teacher'),
            students: []
        };
        classes.push(newClass);
        saveData();
        updateClassTable();
        closeModal();
        showToast('Class added successfully', 'success');
    };
}

function updateClassTable() {
    const tbody = document.getElementById('classTableBody');
    tbody.innerHTML = classes.map(cls => `
        <tr>
            <td class="px-6 py-4">${cls.name}</td>
            <td class="px-6 py-4">${cls.teacher}</td>
            <td class="px-6 py-4">${cls.students.length} students</td>
            <td class="px-6 py-4">
                <button onclick="editClass('${cls.name}')" class="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                <button onclick="deleteClass('${cls.name}')" class="text-red-600 hover:text-red-800">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Attendance management
function updateSubjectDropdown() {
    const selectedClass = document.getElementById('attendanceClass').value;
    const subjectSelect = document.getElementById('attendanceSubject');
    
    if (!selectedClass) {
        subjectSelect.innerHTML = '<option value="">Select Subject</option>';
        subjectSelect.disabled = true;
        updateAttendanceTable();
        return;
    }

    // Get class information and teacher
    const classInfo = classes.find(c => c.name === selectedClass);
    const teacher = teachers.find(t => t.id === classInfo?.teacherId);
    
    // Get all subjects taught in this class
    const classSubjects = teacherAssignments
        .filter(a => a.class === selectedClass)
        .map(a => a.subject);

    // Update subject dropdown
    subjectSelect.innerHTML = '<option value="">Select Subject</option>' +
        classSubjects.map(subject => `<option value="${subject}">${subject}</option>`).join('');
    subjectSelect.disabled = false;

    updateAttendanceTable();
}

function updateAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    const noStudentsMessage = document.getElementById('noStudentsMessage');
    const selectedClass = document.getElementById('attendanceClass').value;
    const selectedDate = document.getElementById('attendanceDate').value;
    const selectedSubject = document.getElementById('attendanceSubject').value;

    tbody.innerHTML = '';

    if (!selectedClass || !selectedDate || !selectedSubject) {
        return;
    }

    // Get students in the selected class
    const classStudents = students.filter(s => s.class === selectedClass);
    
    if (classStudents.length === 0) {
        noStudentsMessage.textContent = 'No students found in this class';
        noStudentsMessage.classList.remove('hidden');
        return;
    }
    
    noStudentsMessage.classList.add('hidden');
    
    // Generate attendance rows
    classStudents.forEach(student => {
        // Check if attendance record exists for this student on this date and subject
        const attendanceRecord = attendance.find(a => 
            a.studentId === student.id && 
            a.date === selectedDate &&
            a.subject === selectedSubject
        );
        
        const status = attendanceRecord ? attendanceRecord.status : 'not_marked';
        
        tbody.innerHTML += `
            <tr data-student-id="${student.id}">
                <td class="px-6 py-4">${student.id}</td>
                <td class="px-6 py-4">${student.name}</td>
                <td class="px-6 py-4">${selectedSubject}</td>
                <td class="px-6 py-4">
                    <span class="status-badge ${status}">${formatStatus(status)}</span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="markAttendance('${student.id}', '${selectedDate}', '${selectedSubject}', 'present')" 
                            class="present-btn ${status === 'present' ? 'bg-green-600' : 'bg-green-500'} text-white px-3 py-1 rounded mr-2 hover:bg-green-600">
                        Present
                    </button>
                    <button onclick="markAttendance('${student.id}', '${selectedDate}', '${selectedSubject}', 'absent')" 
                            class="absent-btn ${status === 'absent' ? 'bg-red-600' : 'bg-red-500'} text-white px-3 py-1 rounded hover:bg-red-600">
                        Absent
                    </button>
                </td>
            </tr>
        `;
    });
}

function markAttendance(studentId, date, subject, status) {
    try {
        // Find the row for this student
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
        if (!row) return;

        // Get the buttons
        const presentButton = row.querySelector('.present-btn');
        const absentButton = row.querySelector('.absent-btn');
        const statusSpan = row.querySelector('.status-badge');

        // Reset both buttons
        presentButton.className = 'present-btn bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600';
        absentButton.className = 'absent-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600';

        // Set active button
        if (status === 'present') {
            presentButton.className = 'present-btn bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-600';
        } else {
            absentButton.className = 'absent-btn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-600';
        }

        // Update status display
        statusSpan.className = `status-badge ${status}`;
        statusSpan.textContent = formatStatus(status);

        // Remove existing attendance record for this student on this date and subject
        attendance = attendance.filter(a => 
            !(a.studentId === studentId && 
              a.date === date && 
              a.subject === subject)
        );
        
        // Add new attendance record
        attendance.push({
            studentId,
            date,
            subject,
            status,
            timestamp: new Date().toISOString()
        });
        
        // Save data
        saveData();
    } catch (error) {
        console.error('Error marking attendance:', error);
        showToast('Error marking attendance. Please try again.', 'error');
    }
}

function formatStatus(status) {
    switch(status) {
        case 'present':
            return 'Present';
        case 'absent':
            return 'Absent';
        case 'not_marked':
            return 'Not Marked';
        default:
            return 'Unknown';
    }
}

// Utility functions
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeModal()">&times;</span>
            <h2 class="text-2xl font-bold mb-4">${title}</h2>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    return modal;
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function getClassOptions(selectedClass = '') {
    return classes.map(cls => 
        `<option value="${cls.name}" ${cls.name === selectedClass ? 'selected' : ''}>${cls.name}</option>`
    ).join('');
}

function getTeacherOptions(selectedTeacher = '') {
    return teachers.map(teacher => 
        `<option value="${teacher.name}" ${teacher.name === selectedTeacher ? 'selected' : ''}>${teacher.name}</option>`
    ).join('');
}

function logout() {
    localStorage.setItem('isLoggedIn', 'false');
    window.location.href = 'login.html';
}

// Reports functions
function generateDepartmentReport() {
    const reportTitle = "Department Summary Report";
    let reportContent = `
        <div class="space-y-6">
            <div class="overflow-x-auto">
                <table class="min-w-full table-auto">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Students</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Teachers</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance Rate</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${generateDepartmentRows()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    displayReport(reportTitle, reportContent);
}

function generateClassAttendanceReport() {
    const reportTitle = "Class-wise Attendance Report";
    let reportContent = `
        <div class="space-y-6">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Select Date Range</label>
                <div class="flex space-x-4 mt-2">
                    <input type="date" class="form-input" id="startDate">
                    <input type="date" class="form-input" id="endDate">
                    <button onclick="updateClassAttendance()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Update Report
                    </button>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full table-auto">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Students</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance Rate</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${generateClassAttendanceRows()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    displayReport(reportTitle, reportContent);
}

function generateStudentReport() {
    const reportTitle = "Student-wise Report";
    let reportContent = `
        <div class="space-y-6">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Select Student</label>
                <select class="form-input mt-2" id="studentSelect" onchange="updateStudentReport()">
                    <option value="">Select a student</option>
                    ${students.map(student => `
                        <option value="${student.id}">${student.name} (${student.id})</option>
                    `).join('')}
                </select>
            </div>
            <div id="studentReportContent"></div>
        </div>
    `;
    displayReport(reportTitle, reportContent);
}

function exportReports() {
    const reportTitle = "Export Reports";
    let reportContent = `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 border rounded">
                    <h4 class="font-semibold mb-2">Department Summary</h4>
                    <button onclick="downloadReportAsPDF('department')" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-2">
                        Download PDF
                    </button>
                    <button onclick="downloadReportAsExcel('department')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Download Excel
                    </button>
                </div>
                <div class="p-4 border rounded">
                    <h4 class="font-semibold mb-2">Class Attendance</h4>
                    <button onclick="downloadReportAsPDF('attendance')" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-2">
                        Download PDF
                    </button>
                    <button onclick="downloadReportAsExcel('attendance')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Download Excel
                    </button>
                </div>
            </div>
        </div>
    `;
    displayReport(reportTitle, reportContent);
}

function displayReport(title, content) {
    const reportDisplay = document.getElementById('reportDisplay');
    const reportTitle = document.getElementById('reportTitle');
    const reportContent = document.getElementById('reportContent');

    reportTitle.textContent = title;
    reportContent.innerHTML = content;
    reportDisplay.classList.remove('hidden');
}

function generateDepartmentRows() {
    const departments = {};
    students.forEach(student => {
        if (!departments[student.class]) {
            departments[student.class] = {
                students: 0,
                teachers: 0,
                attendance: []
            };
        }
        departments[student.class].students++;
    });

    teachers.forEach(teacher => {
        const teacherClasses = classes.filter(c => c.teacher === teacher.name);
        teacherClasses.forEach(c => {
            if (departments[c.name]) {
                departments[c.name].teachers++;
            }
        });
    });

    Object.keys(departments).forEach(dept => {
        const deptStudents = students.filter(s => s.class === dept);
        const deptAttendance = attendance.filter(a => 
            deptStudents.some(s => s.id === a.studentId)
        );
        const presentCount = deptAttendance.filter(a => a.status === 'present').length;
        departments[dept].attendanceRate = deptAttendance.length > 0 
            ? Math.round((presentCount / deptAttendance.length) * 100) 
            : 0;
    });

    return Object.entries(departments).map(([dept, data]) => `
        <tr>
            <td class="px-6 py-4">${dept}</td>
            <td class="px-6 py-4">${data.students}</td>
            <td class="px-6 py-4">${data.teachers}</td>
            <td class="px-6 py-4">${data.attendanceRate}%</td>
        </tr>
    `).join('');
}

function generateClassAttendanceRows() {
    return classes.map(cls => {
        const classStudents = students.filter(s => s.class === cls.name);
        const classAttendance = attendance.filter(a => 
            classStudents.some(s => s.id === a.studentId)
        );
        const presentCount = classAttendance.filter(a => a.status === 'present').length;
        const attendanceRate = classAttendance.length > 0 
            ? Math.round((presentCount / classAttendance.length) * 100) 
            : 0;

        return `
            <tr>
                <td class="px-6 py-4">${cls.name}</td>
                <td class="px-6 py-4">${classStudents.length}</td>
                <td class="px-6 py-4">${presentCount}</td>
                <td class="px-6 py-4">${classAttendance.length - presentCount}</td>
                <td class="px-6 py-4">${attendanceRate}%</td>
            </tr>
        `;
    }).join('');
}

function updateStudentReport() {
    const studentId = document.getElementById('studentSelect').value;
    if (!studentId) return;

    const student = students.find(s => s.id === studentId);
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    const presentCount = studentAttendance.filter(a => a.status === 'present').length;
    const attendanceRate = studentAttendance.length > 0 
        ? Math.round((presentCount / studentAttendance.length) * 100) 
        : 0;

    const reportContent = `
        <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded">
                <h4 class="font-semibold mb-2">Student Information</h4>
                <p><strong>Name:</strong> ${student.name}</p>
                <p><strong>ID:</strong> ${student.id}</p>
                <p><strong>Class:</strong> ${student.class}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded">
                <h4 class="font-semibold mb-2">Attendance Summary</h4>
                <p><strong>Total Days:</strong> ${studentAttendance.length}</p>
                <p><strong>Present:</strong> ${presentCount}</p>
                <p><strong>Absent:</strong> ${studentAttendance.length - presentCount}</p>
                <p><strong>Attendance Rate:</strong> ${attendanceRate}%</p>
            </div>
        </div>
    `;

    document.getElementById('studentReportContent').innerHTML = reportContent;
}

function downloadReportAsPDF(type) {
    showToast('PDF download started...', 'success');
}

function downloadReportAsExcel(type) {
    showToast('Excel download started...', 'success');
}

function generateSubjectAttendanceReport() {
    const reportTitle = "Subject-wise Attendance Report";
    let reportContent = `
        <div class="space-y-6">
            <div class="mb-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Select Class</label>
                        <select id="reportClassSelect" class="form-input mt-2 w-full" onchange="updateReportSubjects()">
                            <option value="">Select Class</option>
                            ${getClassOptions()}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Select Subject</label>
                        <select id="reportSubjectSelect" class="form-input mt-2 w-full">
                            <option value="">Select Subject</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" id="subjectReportStartDate" class="form-input mt-2 w-full">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" id="subjectReportEndDate" class="form-input mt-2 w-full">
                    </div>
                </div>
                <div class="mt-4">
                    <button onclick="updateSubjectAttendanceReport()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Generate Report
                    </button>
                </div>
            </div>
            <div id="subjectReportContent" class="overflow-x-auto">
                <!-- Report content will be inserted here -->
                <div class="text-center text-gray-500">Please select all filters to view the report</div>
            </div>
        </div>
    `;
    displayReport(reportTitle, reportContent);
}

function updateReportSubjects() {
    const classSelect = document.getElementById('reportClassSelect');
    const subjectSelect = document.getElementById('reportSubjectSelect');
    const selectedClass = classSelect.value;

    // Clear current options
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';

    if (!selectedClass) return;

    // Get subjects for the selected class
    const classSubjects = teacherAssignments
        .filter(ta => ta.class === selectedClass)
        .map(ta => ta.subject);

    // Add all available subjects from the curriculum
    ALL_SUBJECTS.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

function updateSubjectAttendanceReport() {
    const selectedClass = document.getElementById('reportClassSelect').value;
    const selectedSubject = document.getElementById('reportSubjectSelect').value;
    const startDate = document.getElementById('subjectReportStartDate').value;
    const endDate = document.getElementById('subjectReportEndDate').value;
    const contentDiv = document.getElementById('subjectReportContent');

    if (!selectedClass || !selectedSubject || !startDate || !endDate) {
        contentDiv.innerHTML = '<div class="text-center text-gray-500">Please select all filters to view the report</div>';
        return;
    }

    // Get students in the selected class
    const classStudents = students.filter(s => s.class === selectedClass);

    // Get attendance records for the date range
    const filteredAttendance = attendance.filter(a => 
        a.subject === selectedSubject &&
        a.date >= startDate &&
        a.date <= endDate &&
        classStudents.some(s => s.id === a.studentId)
    );

    // Prepare data for report and export
    const reportData = classStudents.map(student => {
        const studentAttendance = filteredAttendance.filter(a => a.studentId === student.id);
        const totalDays = studentAttendance.length;
        const presentDays = studentAttendance.filter(a => a.status === 'present').length;
        const absentDays = totalDays - presentDays;
        const attendanceRate = totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

        return {
            id: student.id,
            name: student.name,
            presentDays,
            absentDays,
            attendanceRate
        };
    });

    // Generate report HTML
    let reportHTML = `
        <div class="mb-4 flex justify-between items-center">
            <div class="text-lg font-semibold">
                ${selectedClass} - ${selectedSubject} (${startDate} to ${endDate})
            </div>
            <div class="space-x-2">
                <button onclick="exportToPDF()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Export as PDF
                </button>
                <button onclick="exportToCSV()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Export as CSV
                </button>
            </div>
        </div>
        <table class="min-w-full table-auto">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance Rate</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;

    reportData.forEach(data => {
        reportHTML += `
            <tr>
                <td class="px-6 py-4">${data.id}</td>
                <td class="px-6 py-4">${data.name}</td>
                <td class="px-6 py-4">${data.presentDays}</td>
                <td class="px-6 py-4">${data.absentDays}</td>
                <td class="px-6 py-4">${data.attendanceRate}%</td>
            </tr>
        `;
    });

    reportHTML += `
            </tbody>
        </table>
    `;

    contentDiv.innerHTML = reportHTML;

    // Store report data for export
    window.currentReportData = {
        class: selectedClass,
        subject: selectedSubject,
        startDate,
        endDate,
        data: reportData
    };
}

function exportToPDF() {
    const reportData = window.currentReportData;
    if (!reportData) {
        showToast('No report data available to export', 'error');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text('Attendance Report', 14, 15);

        // Add report info
        doc.setFontSize(12);
        doc.text(`Class: ${reportData.class}`, 14, 25);
        doc.text(`Subject: ${reportData.subject}`, 14, 32);
        doc.text(`Period: ${reportData.startDate} to ${reportData.endDate}`, 14, 39);

        // Prepare table data
        const tableData = reportData.data.map(item => [
            item.id,
            item.name,
            item.presentDays.toString(),
            item.absentDays.toString(),
            item.attendanceRate + '%'
        ]);

        // Add table
        doc.autoTable({
            startY: 45,
            head: [['Student ID', 'Name', 'Present', 'Absent', 'Attendance Rate']],
            body: tableData,
            headStyles: { fillColor: [41, 128, 185] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Save the PDF
        doc.save(`attendance_report_${reportData.class}_${reportData.subject}.pdf`);
        showToast('PDF exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        showToast('Error exporting PDF. Please try again.', 'error');
    }
}

function exportToCSV() {
    const reportData = window.currentReportData;
    if (!reportData) {
        showToast('No report data available to export', 'error');
        return;
    }

    try {
        // Prepare CSV content
        const headers = ['Student ID', 'Name', 'Present Days', 'Absent Days', 'Attendance Rate'];
        const rows = reportData.data.map(item => [
            item.id,
            item.name,
            item.presentDays,
            item.absentDays,
            item.attendanceRate + '%'
        ]);

        // Convert to CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `attendance_report_${reportData.class}_${reportData.subject}.csv`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('CSV exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showToast('Error exporting CSV. Please try again.', 'error');
    }
}

// Add this to your existing CSS file
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
    }
    .status-badge.present {
        background-color: #DEF7EC;
        color: #03543F;
    }
    .status-badge.absent {
        background-color: #FDE8E8;
        color: #9B1C1C;
    }
    .status-badge.not_marked {
        background-color: #E5E7EB;
        color: #374151;
    }
`;
document.head.appendChild(styleSheet); 