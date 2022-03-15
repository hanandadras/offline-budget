//var to hold db connection
let db;
//establish connex to IndexedDB called transaction
const request = indexedDB.open('offlineBudget', 1);
//event if database version changes
request.onupgradedneeded = function (target) {
    //save ref to event
    const db = target.result;
    //create object store table
    db.createObjectStore('pending', { autoIncrement: true });
};
upon a successful request on success
request.onsuccess = ({ target }) => {
    db = target.result;

    //check if online 
    if (navigator.online) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);

    //function executed if new transaction is submitted
    function saveRecord(record) {
        //new transaction with read and write permission
        const transaction = db.transaction(['pending'], 'readwrite');
        const store = transaction.objectStore("pending");
        //add record to store with add method
        store.add(record);
    }

}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    return response.json();
                })
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

    // listen when app comes back online
    window.addEventListener("online", checkDatabase);