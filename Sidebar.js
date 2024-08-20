document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');

    toggleButton.addEventListener('click', function () {
        sidebar.classList.toggle('hidden');
        toggleButton.textContent = sidebar.classList.contains('hidden') ? '<' : '>';
    });
});
