
// 3. load existing dat from local storage
let entries = {};
async function loadEntries() {
    const response = await fetch('diaryLayout.json');
    journalData = await response.json();
    populateEntries();
}
// 4. display the saved entries
const leftPageContent = document.querySelector('[data-page="left"] .pageContent');
const rightPageContent = document.querySelector('[data-page="right"] .pageContent');
function updateEntriesList() {
    leftPageContent.innerHTML = entries.map(entry =>
        <div style="border: 1px solid #ccc; padding: 10px; margin: 5px;">
            ${entry.text} <small>(${new Date(entry.timestamp).toLocaleString()})</small>
            <button onClick="deleteEntry(${entry.id})">Delete</button>
        </div>
    ).join('');
}
saveButton.addEventListener('click', () => {
    if (input.value.trim()) {
        const newEntry = {
            id: Date.now(),
            text: input.value,
            timestamp: Date().toISOString()
        };
        entries.push(newEntry);
        localStorage.setItem('journalEntries', JSON.stringify(entries));
        input.value = '';
        updateEntriesList();
    }
});
window.deleteEntry = (id) => {
    entries = entries.filter(entry => entry.id !== id);
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    updateEntriesList();
}
updateEntriesList();