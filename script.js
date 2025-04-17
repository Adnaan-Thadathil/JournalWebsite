document.addEventListener('DOMContentLoaded', async function() {
    const journal = document.querySelector('.journal');
    const frontCover = document.querySelector('.front-cover');
    const backCover = document.querySelector('.back-cover');
    let pagesContainer = document.querySelector('.pages');
    const prevPageBtn = document.querySelector('.prevPage');
    const nextPageBtn = document.querySelector('.nextPage');
    let currentPageSpan = document.querySelector('[data-current-page]');
    let totalPagesSpan = document.querySelector('[data-total-pages]');
    const spine = document.querySelector('[data-interaction-zone]');
    const pageCount = document.querySelector('.pageCount');
    let pageDataPages = [];
    let currentPage = 0;
    let isCoverOn = true;
    let totalPages = 0;
    let isOpen = false;
    // json and local storage loading data
    
        // try to load from localStorage
        let pageData;
        try {
            pageData = JSON.parse(localStorage.getItem('pageData'));
        } catch (error) {
            console.error('Error parsing localStorage data:', error);
            pageData = null;
        }
        // if no localStroage data, load from json
        if (!pageData || pageData.length === 0) {
            try {
                const response = await fetch('diaryLayout.json');
                pageData = await response.json();
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                pageDataPages = pageData.page || [];
                localStorage.setItem('pageData', JSON.stringify(pageDataPages));
            } catch (error) {
                console.error('Error loading JSON:', error);
                pageDataPages = [];
            }
        } else {
            pageDataPages = pageData;
        }
        renderPages(pageDataPages);

    totalPages = pageDataPages.length;
    totalPagesSpan.textContent = totalPages;
    currentPageSpan.textContent = currentPage;
    
    // Initialize
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
            console.log(currentPage);
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
        pageHider();
        
        // Update button states
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        pageCount.style.zIndex = '99'
        
        // Show back cover when on last page
        if (currentPage === totalPages) {
            backCover.style.zIndex = totalPages + 1;
        } else {
            backCover.style.zIndex = '-1';
        }
    }
    
    // Initially hide pages container
    pagesContainer.style.visibility = 'hidden';
    
    
    function renderPages(pages) {
        console.log('Rendering pages:', pages);
        let pageElement;
        const pagesContainer = document.querySelector('.pages');
        /*pagesContainer.innerHTML = '';*/
        pages.forEach(page => {
            const pageElement = document.createElement('div');
            pageElement.classList.add('page');
            pageElement.dataset.pageId = page.id;
            
            pageElement.innerHTML = `
            <div class="page-number">
            <div class ="page-header pageElement">
                <h2 class="header-title">${escapeHtml(page.Title)}</h2>
                <h3 class="header-date">${escapeHtml(page.Date)}</h3>
                <button class="edit-btn">Edit</button>
                <button class="save-btn" style="display: none;">Save</button>
            </div>
            <div class="page-content pageElement">${escapeHtml(page.content)}</div>
            <div class="edit-area" style="display: none;">
                <input type="text" class="title-editor" value="${escapeHtml(page.Title)}">
                <input type="text" class="date-editor" value="${escapeHtml(page.Date)}">
                <textarea class="content-editor">${escapeHtml(page.content)}</textarea>
                <button class="save-btn" style="display: none;">Save</button>
                <button class="delete-btn">Delete</button>
                <button class="add-btn">Add</button>
            </div>
            </div>
            `;
            pagesContainer.appendChild(pageElement);
            const pageChecker = pagesContainer.querySelectorAll('.page-number');
            pageHider();  
            setupPageEvents(pageElement, page, pages);
            if (prevPageBtn && !pagesContainer.contains(prevPageBtn)) {
                pagesContainer.appendChild(prevPageBtn);
            }
            if (nextPageBtn && !pagesContainer.contains(nextPageBtn)) {
                pagesContainer.appendChild(nextPageBtn);
            }   
        });

        function setupPageEvents(element, aPage, allPages) {
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
                console.log('editing page:', aPage);
                headingTitle.style.display = 'none';
                headingDate.style.display = 'none';
                contentDisplay.style.display = 'none';

                editArea.style.display = 'block';
                editBtn.style.display = 'none';
                saveBtn.style.display = 'inline-block';

                titleEditor.focus();
            });

            saveBtn.addEventListener('click', () => {
                console.log('saving page:', aPage);
                const newTitle = titleEditor.value.trim();
                const newDate = dateEditor.value.trim();
                const newContent = contentEditor.value.trim();
                if (newTitle) {
                    aPage.Title = newTitle;
                    headingTitle.textContent = newTitle;
                    headingTitle.style.display = 'block';
                    console.log('Title updated:', newTitle);
                }
                if (newDate) {
                    aPage.Date = newDate;
                    headingDate.textContent = newDate;
                    headingDate.style.display = 'block';
                    console.log('Date updated:', newDate);
                }
                if (newContent) {
                    aPage.content = newContent;
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
                console.log('deleting page:', aPage);
                var pageId = aPage.id;
                var index = allPages.findIndex(p => p.id === pageId);
                for (let i = index; i < allPages.length; i++) {
                    if (allPages[i].id === pageId) {
                        allPages.splice(i, 1);
                        updateTotalPages();
                        localStorage.setItem('pageData', JSON.stringify(allPages));
                        element.remove();
                        renderPages(allPages);
                    }
                }
            });
            console.log(aPage);
            addBtn.addEventListener('click', () => {
                console.log('adding page:', aPage);
                var pageId = aPage.id;
                var index = allPages.findIndex(p => p.id === pageId);
                for (let i = index; i < allPages.length; i++) {
                    const newPage = {
                        id: pageId++,
                        Title: '',
                        Date: '',
                        content: ''
                    };
                    allPages.push(newPage);
                    updateTotalPages();
                    localStorage.setItem('pageData', JSON.stringify(allPages));
                    renderPages(allPages);
                        
                }
                
            });
            function updateTotalPages() {
                totalPages = allPages.length;
            }
            
            
        }
        
        
        function escapeHtml(unsafe) {
            if (typeof unsafe !== 'string') {
                return unsafe;
            }
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    }
    function pageHider() {
        const pageChecker = pagesContainer.querySelectorAll('.page-number'); // Use querySelectorAll
        const pageID = pagesContainer.querySelectorAll('[data-page-id]'); // Use querySelectorAll
    
        for (let i = 0; i < pageChecker.length; i++) {
            pageChecker[i].style.zIndex = i + 1;
    
            console.log('Current Page:', currentPage);
            console.log('Page ID:', pageID[i].dataset.pageId);
    
            if (pageID[i].dataset.pageId === String(currentPage)) { // Compare with currentPage
                pageChecker[i].style.visibility = 'visible';
            } else {
                pageChecker[i].style.visibility = 'hidden';
            }
        }
    }
    
    
    
});
