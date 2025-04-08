document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const icon = darkModeToggle.querySelector('i');
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Toggle icon
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('darkMode', null);
        }
    });
}); 