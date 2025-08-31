// API Configuration
const API_BASE_URL = 'https://predesk.onrender.com/api';

// DOM Elements
const profileCard = document.getElementById('profileCard');
const projectsGrid = document.getElementById('projectsGrid');
const skillsGrid = document.getElementById('skillsGrid');
const searchResults = document.getElementById('searchResults');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchType = document.getElementById('searchType');
const searchCategory = document.getElementById('searchCategory');
const skillFilter = document.getElementById('skillFilter');
const projectModal = document.getElementById('projectModal');
const projectModalContent = document.getElementById('projectModalContent');

// Global state
let allSkills = [];
let allProjects = [];

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Promise.all([
            loadProfile(),
            loadProjects(),
            loadSkills(),
            loadSearchCategories()
        ]);
        
        setupEventListeners();
        setupSearchFilters();
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to load application data');
    }
});

// Event Listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Filter changes
    skillFilter.addEventListener('change', filterProjectsBySkill);
    searchType.addEventListener('change', updateSearchCategories);
    
    // Modal functionality
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        projectModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            projectModal.style.display = 'none';
        }
    });
}

// API Functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
    }
}

// Load Profile
async function loadProfile() {
    try {
        const profile = await apiCall('/profile');
        renderProfile(profile);
    } catch (error) {
        profileCard.innerHTML = `
            <div class="profile-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load profile</p>
            </div>
        `;
    }
}

function renderProfile(profile) {
    const skillsHtml = profile.skills.map(skill => 
        `<span class="skill-tag">${skill.name}</span>`
    ).join('');
    
    const workHtml = profile.work_experience.map(work => `
        <div class="work-item">
            <div class="work-position">${work.position}</div>
            <div class="work-company">${work.company}</div>
            <div class="work-description">${work.description}</div>
        </div>
    `).join('');
    
    profileCard.innerHTML = `
        <div class="profile-header">
            <h2 class="profile-name">${profile.name}</h2>
            <div class="profile-email">${profile.email}</div>
            <div class="profile-education">${profile.education}</div>
        </div>
        
        <div class="profile-links">
            ${profile.github_link ? `<a href="${profile.github_link}" target="_blank" class="profile-link"><i class="fab fa-github"></i> GitHub</a>` : ''}
            ${profile.linkedin_link ? `<a href="${profile.linkedin_link}" target="_blank" class="profile-link"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
            ${profile.portfolio_link ? `<a href="${profile.portfolio_link}" target="_blank" class="profile-link"><i class="fas fa-globe"></i> Portfolio</a>` : ''}
        </div>
        
        <div class="profile-skills">
            <h3>Skills</h3>
            <div class="skills-tags">${skillsHtml}</div>
        </div>
        
        <div class="work-experience">
            <h3>Work Experience</h3>
            ${workHtml}
        </div>
    `;
}

// Load Projects
async function loadProjects() {
    try {
        const projects = await apiCall('/projects');
        allProjects = projects;
        renderProjects(projects);
        populateSkillFilter(projects);
    } catch (error) {
        projectsGrid.innerHTML = `
            <div class="projects-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load projects</p>
            </div>
        `;
    }
}

function renderProjects(projects) {
    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-projects">
                <i class="fas fa-folder-open"></i>
                <p>No projects found</p>
            </div>
        `;
        return;
    }
    
    const projectsHtml = projects.map(project => `
        <div class="project-card" onclick="openProjectModal(${project.id})">
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-skills">
                    ${project.skills ? project.skills.map(skill => 
                        `<span class="project-skill">${skill}</span>`
                    ).join('') : ''}
                </div>
                <div class="project-links">
                    ${project.github_link ? `<a href="${project.github_link}" target="_blank" class="project-link">GitHub</a>` : ''}
                    ${project.live_link ? `<a href="${project.live_link}" target="_blank" class="project-link">Live Demo</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    projectsGrid.innerHTML = projectsHtml;
}

function populateSkillFilter(projects) {
    const skills = new Set();
    projects.forEach(project => {
        if (project.skills) {
            project.skills.forEach(skill => skills.add(skill));
        }
    });
    
    const skillOptions = Array.from(skills).sort().map(skill => 
        `<option value="${skill}">${skill}</option>`
    );
    
    skillFilter.innerHTML = '<option value="">All skills</option>' + skillOptions;
}

function filterProjectsBySkill() {
    const selectedSkill = skillFilter.value;
    
    if (!selectedSkill) {
        renderProjects(allProjects);
        return;
    }
    
    const filteredProjects = allProjects.filter(project => 
        project.skills && project.skills.includes(selectedSkill)
    );
    
    renderProjects(filteredProjects);
}

// Load Skills
async function loadSkills() {
    try {
        const skills = await apiCall('/skills');
        allSkills = skills;
        renderSkills(skills);
    } catch (error) {
        skillsGrid.innerHTML = `
            <div class="skills-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load skills</p>
            </div>
        `;
    }
}

function renderSkills(skills) {
    if (skills.length === 0) {
        skillsGrid.innerHTML = `
            <div class="no-skills">
                <i class="fas fa-tools"></i>
                <p>No skills found</p>
            </div>
        `;
        return;
    }
    
    const skillsHtml = skills.map(skill => `
        <div class="skill-card">
            <h3 class="skill-name">${skill.name}</h3>
            <div class="skill-level">${skill.proficiency_level}</div>
            <div class="skill-category">${skill.category}</div>
            <div class="skill-projects">Used in ${skill.project_count || 0} projects</div>
        </div>
    `).join('');
    
    skillsGrid.innerHTML = skillsHtml;
}

// Search Functionality
async function performSearch() {
    const query = searchInput.value.trim();
    // const type = searchType.value;
    // const category = searchCategory.value;

    const type = 'All types';
    const category = 'All categories';
    
    if (!query) {
        showSearchPlaceholder();
        return;
    }
    
    try {
        showSearchLoading();
        
        let endpoint = `/search?q=${encodeURIComponent(query)}`;
        if (type) endpoint += `&type=${type}`;
        if (category) endpoint += `&category=${category}`;
        
        const results = await apiCall(endpoint);
        renderSearchResults(results);
        
    } catch (error) {
        showSearchError('Search failed. Please try again.');
    }
}

function renderSearchResults(searchData) {
    if (searchData.results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>No results found for "${searchData.query}"</p>
            </div>
        `;
        return;
    }
    
    const resultsHtml = searchData.results.map(result => `
        <div class="search-result">
            <span class="search-result-type">${result.type}</span>
            <h3 class="search-result-title">${result.title}</h3>
            <p class="search-result-description">${result.description}</p>
        </div>
    `).join('');
    
    searchResults.innerHTML = `
        <div class="search-summary">
            <p>Found ${searchData.total_results} results for "${searchData.query}"</p>
        </div>
        ${resultsHtml}
    `;
}

function showSearchLoading() {
    searchResults.innerHTML = `
        <div class="search-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching...</p>
        </div>
    `;
}

function showSearchPlaceholder() {
    searchResults.innerHTML = `
        <div class="search-placeholder">
            <i class="fas fa-search"></i>
            <p>Enter a search term to find projects, skills, or experience</p>
        </div>
    `;
}

function showSearchError(message) {
    searchResults.innerHTML = `
        <div class="search-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Search Filters
function setupSearchFilters() {
    updateSearchCategories();
}

function updateSearchCategories() {
    const selectedType = searchType.value;
    const categorySelect = searchCategory;
    
    // Clear existing options
    categorySelect.innerHTML = '<option value="">All categories</option>';
    
    if (selectedType === 'skill') {
        const categories = [...new Set(allSkills.map(skill => skill.category))];
        categories.forEach(category => {
            if (category) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            }
        });
    }
}

async function loadSearchCategories() {
    try {
        const skills = await apiCall('/skills');
        const categories = [...new Set(skills.map(skill => skill.category))];
        
        const categoryOptions = categories.map(category => 
            `<option value="${category}">${category}</option>`
        );
        
        searchCategory.innerHTML = '<option value="">All categories</option>' + categoryOptions;
    } catch (error) {
        console.error('Failed to load search categories:', error);
    }
}

// Project Modal
async function openProjectModal(projectId) {
    try {
        const project = await apiCall(`/projects/${projectId}`);
        renderProjectModal(project);
        projectModal.style.display = 'block';
    } catch (error) {
        console.error('Failed to load project details:', error);
        showError('Failed to load project details');
    }
}

function renderProjectModal(project) {
    const skillsHtml = project.skills ? project.skills.map(skill => 
        `<span class="project-skill">${skill.name}</span>`
    ).join('') : '';
    
    projectModalContent.innerHTML = `
        <div class="project-modal">
            <img src="${project.image_url || 'https://via.placeholder.com/400x300/667eea/FFFFFF?text=Project'}" 
                 alt="${project.title}" class="project-image" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
            <h2>${project.title}</h2>
            <p style="margin: 1rem 0; line-height: 1.6; color: #64748b;">${project.description}</p>
            
            ${skillsHtml ? `
                <div style="margin: 1rem 0;">
                    <h4>Skills Used:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                        ${skillsHtml}
                    </div>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                ${project.github_link ? `<a href="${project.github_link}" target="_blank" class="project-link">View on GitHub</a>` : ''}
                ${project.live_link ? `<a href="${project.live_link}" target="_blank" class="project-link">Live Demo</a>` : ''}
            </div>
        </div>
    `;
}

// Utility Functions
function showError(message) {
    console.error(message);
    // You could implement a toast notification system here
}

// Smooth scrolling for navigation links
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





