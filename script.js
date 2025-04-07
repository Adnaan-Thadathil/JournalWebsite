document.addEventListener('DOMContentLoaded', function() {
    const journal = document.querySelector('.journal');
    const frontCover = document.querySelector('.front-cover');
    const backCover = document.querySelector('.back-cover');
    const pagesContainer = document.querySelector('.pages');
    const pageElements = document.querySelectorAll('.page');
    const prevPageBtn = document.querySelector('.prevPage');
    const nextPageBtn = document.querySelector('.nextPage');
    const currentPageSpan = document.querySelector('[data-current-page]');
    const totalPagesSpan = document.querySelector('[data-total-pages]');
    const spine = document.querySelector('[data-interaction-zone]');
    
    let currentPage = 1;
    let isCoverOn = true; // tracks if the cover is on or off
    const totalPages = 10;
    let isOpen = false;
    
    // Initialize
    totalPagesSpan.textContent = totalPages;
    updatePageDisplay();
    
    // Position back cover behind everything
    backCover.style.zIndex = '-1';
    
    // Open/close the journal
    frontCover.addEventListener('click', function() {
        if (!isOpen) {
            openJournal();
        }
    });
    
    spine.addEventListener('click', function() {
        if (isOpen && !isCoverOn) {
            showCover();
        } else if (isOpen) {
            closeJournal();
        }
    });
    
    // Page navigation
    nextPageBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            updatePageDisplay();
        }
    });
    
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updatePageDisplay();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!isOpen) return;
        if (e.key === 'Escape') {
            if (isCoverOn) {
                closeJournal();
            } else {
                showCover();
            }
        }
        if (e.key === 'ArrowRight' && currentPage < totalPages) {
            currentPage++;
            updatePageDisplay();
        } else if (e.key === 'ArrowLeft' && currentPage > 1) {
            currentPage--;
            updatePageDisplay();
        }
    });
    
    function openJournal() {
        journal.setAttribute('data-state', 'open');
        frontCover.style.transform = 'rotateY(-160deg)';
        isOpen = true;
        isCoverOn = false;
        // Show pages container
        pagesContainer.style.visibility = 'visible';
    }
    function showCover() {
        isCoverOn = true;
        pagesContainer.style.visibility = 'hidden';
        frontCover.style.transform = 'rotateY(0deg)';
    }
    
    function closeJournal() {
        journal.setAttribute('data-state', 'closed');
        frontCover.style.transform = 'rotateY(0deg)';
        isOpen = false;
        isCoverOn = true;
        // Hide pages container when closed
        pagesContainer.style.visibility = 'hidden';
        // Reset to first page when closing
        currentPage = 1;
        updatePageDisplay();
    }
    
    function updatePageDisplay() {
        currentPageSpan.textContent = currentPage;
        
        // Show/hide pages based on current page
        pageElements.forEach((page, index) => {
            const pageNumber = parseInt(page.getAttribute('data-page-number'));
            
            if (pageNumber === currentPage || pageNumber === currentPage + 1) {
                page.setAttribute('aria-hidden', 'false');
            } else {
                page.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Update button states
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        
        // Show back cover when on last page
        if (currentPage === totalPages) {
            backCover.style.zIndex = '100';
        } else {
            backCover.style.zIndex = '-1';
        }
    }
    
    // Create additional pages dynamically (since HTML only has 2 pages)
    createAdditionalPages();
    
    function createAdditionalPages() {
        const pageNav = document.querySelector('.pageNav');
        
        for (let i = 3; i <= totalPages; i++) {
            const isLeftPage = i % 2 !== 0;
            const page = document.createElement('div');
            page.className = `page layout${isLeftPage ? 'Left' : 'Right'}`;
            page.setAttribute('data-page', isLeftPage ? 'left' : 'right');
            page.setAttribute('data-flip-direction', isLeftPage ? 'backward' : 'forward');
            page.setAttribute('aria-hidden', 'true');
            page.setAttribute('data-page-number', i);
            
            const date = new Date();
            date.setDate(date.getDate() + i - 1);
            const dateString = date.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });
            
            page.innerHTML = `
                <div class="pageHeader">
                    <h2>Page ${i}</h2>
                    <div class="date">${dateString}</div>
                </div>
                <div class="pageContent">
                    <!--content go here-->
                </div>
            `;
            
            // Insert before the nextPage button
            pageNav.insertBefore(page, nextPageBtn);
        }
    }
    
    // Initially hide pages container
    pagesContainer.style.visibility = 'hidden';
});