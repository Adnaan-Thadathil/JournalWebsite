document.addEventListener('DOMContentLoaded', function() {
    const journal = document.querySelector('.journal');
    const frontCover = document.querySelector('.front-cover');
    const backCover = document.querySelector('.back-cover');
    let pagesContainer = document.querySelector('.pages');
    const prevPageBtn = document.querySelector('.prevPage');
    const nextPageBtn = document.querySelector('.nextPage');
    let currentPageSpan = document.querySelector('[data-current-page]');
    let totalPagesSpan = document.querySelector('[data-total-pages]');
    const spine = document.querySelector('[data-interaction-zone]');
    
    let currentPage = 1;
    let isCoverOn = true; // tracks if the cover is on or off
    let totalPages = 20; // total number of pages
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
        if ((e.key === 'ArrowLeft' && currentPage === 1) || (e.key === 'Escape')) {
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
    function updateTotalPages() {
        totalPages = allPages.length;
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
    
    // Initially hide pages container
    pagesContainer.style.visibility = 'hidden';
    // json and local storage loading data
    document.addEventListener('DOMContentLoaded', async function() {
        // try to load from localStorage
        let pageData = JSON.parse(localStorage.getItem('pageData'));
        // if no localStroage data, load from json
        if (!pageData) {
            try {
                const response = await fetch('diaryLayout.json');
                pageData = await response.json();
                pageDataPages = pageData.page;
                localStorage.setItem('pageData', JSON.stringify(pageDataPages));
            } catch (error) {
                console.error('Error loading JSON:', error);
                pageDataPages = [];
            }
        }

        renderPages(pageDataPages);
    });
    
    function renderPages(pages) {
        pages.forEach(page => {
            const pageElement = document.createElement('div');
            pageElement.className = 'page';
            pageElement.dataset.pageId = page.id;
            
            pageElement.innerHTML = `
            <div class ="page-header pageElement">
                <h2 class="header-title">${escapeHtml(page.Title)}</h2>
                <h3 class="header-date">${escapeHtml(page.Date)}</h3>
                <button class="edit-btn">Edit</button>
                <button class="save-btn" style="display: none;">Save</button>
            </div>
            <div class="page-content pageElement">${escapeHtml(page.content)}</div>
            <div class="edit-area" style="display: none;">
                <textarea class="content-editor">${escapeHtml(page.content)}</textarea>
                <input type="text" class="title-editor" value="${escapeHtml(page.Title)}">
                <input type="text" class="date-editor" value="${escapeHtml(page.Date)}">
                <button class="save-btn">Save</button>
                <button class="delete-btn">Delete</button>
                <button class="add-btn">Add</button>
            </div>
            `;
            pagesContainer.appendChild(pageElement);
            setupPageEvents(pageElement, page, pages);       
        });

        function setupPageEvents(element, page, allPages) {
            const editBtn = element.querySelector('.edit-btn');
            const saveBtn = element.querySelector('.save-btn');
            const deleteBtn = element.querySelector('.delete-btn');
            const addBtn = element.querySelector('.add-btn');
            let headingTitle = element.querySelector('.header-title');
            let headingDate = element.querySelector('.header-date');
            let titleEditor = element.querySelector('.title-editor');
            let dateEditor = element.querySelector('.date-editor');
            let editArea = element.querySelector('.edit-area');
            let contentEditor = element.querySelector('.content-editor');
            let contentDisplay = element.querySelector('.page-content');
            
            editBtn.addEventListener('click', () => {
                headingTitle.style.display = 'none';
                headingDate.style.display = 'none';
                contentDisplay.style.display = 'none';

                editArea.style.display = 'block';
                editBtn.style.display = 'none';
                saveBtn.style.display = 'inline-block';

                titleEditor.focus();
            });

            saveBtn.addEventListener('click', () => {
                const newTitle = titleEditor.value.trim();
                const newDate = dateEditor.value.trim();
                const newContent = contentEditor.value.trim();
                if (newTitle) {
                    page.Title = newTitle;
                    headingTitle.textContent = newTitle;
                    headingTitle.style.display = 'block';
                    console.log('Title updated:', newTitle);
                }
                if (newDate) {
                    page.Date = newDate;
                    headingDate.textContent = newDate;
                    headingDate.style.display = 'block';
                    console.log('Date updated:', newDate);
                }
                if (newContent) {
                    page.content = newContent;
                    contentDisplay.textContent = newContent;
                    contentDisplay.style.display = 'block';
                    console.log('Content updated:', newContent);
                }
                editArea.style.display = 'none';
                editBtn.style.display = 'inline-block';
                saveBtn.style.display = 'none';
                localStorage.setItem('pageData', JSON.stringify(allPages));
            });
            
            deleteBtn.addEventListener('click', () => {
                const pageId = page.id;
                const index = allPages.findIndex(p => p.id === pageId);
                if (index !== -1) {
                    allPages.splice(index, 1);
                    updateTotalPages();
                    localStorage.setItem('pageData', JSON.stringify(allPages));
                    element.remove();
                }
            });
            addBtn.addEventListener('click', () => {
                const pageId = page.id;
                const index = allPages.findIndex(p => p.id === pageId);
                if (index !== -1) {
                       if (index == allPages.length - 1) {
                        const newPage = {
                            id: pageId,
                            Title: '',
                            Date: '',
                            content: ''
                            };
                        }
                        allPages.push(newPage);
                    allPages.splice(index + 1, 0, newPage);
                    updateTotalPages();
                    localStorage.setItem('pageData', JSON.stringify(allPages));
                    renderPages(allPages);
                        
                }
                
            });
            
            
        }
        pagesContainer.insertBefore(page, nextPageBtn);
        
    }
    
    
    
});
