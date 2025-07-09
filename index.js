// chrome://extensions/
let dateEl = document.getElementById("today-el")

// Get today's date
var today = new Date()
var dd = String(today.getDate()).padStart(2, '0')
var mm = String(today.getMonth() + 1).padStart(2, '0')
var yyyy = today.getFullYear()

today = mm + '/' + dd + '/' + yyyy
dateEl.innerHTML = `Date ${today}`
let myLeads = []

// input fields
const linkEl = document.getElementById("link-el")
const comEl = document.getElementById("com-el")
const posEl = document.getElementById("pos-el")
const statusEl = document.getElementById("status-el")
const ulEl = document.getElementById("ul-el")
const inputErr = document.getElementById("input-error")

// buttons
const saveJobBtn = document.getElementById("save-job-btn")
const tabBtn = document.getElementById("tab-btn")
const deleteBtn = document.getElementById("delete-btn")
const downloadBtn = document.getElementById("download-btn")
const container = document.getElementById("container-buttons")

const counterEl = document.getElementById("counter-el")

// local storage
const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads"))

function render(leads){
    counterEl.innerText = `(${myLeads.length})`
    ulEl.innerHTML = ""  // clear first
    let listItems = ""
    let mostRecent = myLeads.reverse()
    let maxLength = (leads.length < 5) ? leads.length : 5
    for (let i = 0; i < maxLength; i++){
        listItems += `
            <li>
                <a target='_blank' href='${mostRecent[i]['url']}'>
                    ${mostRecent[i]['company']}
                </a>
                <p class="indent status"> ${mostRecent[i]['status'].toUpperCase()}</p>
            </li>
        `   
    }
    ulEl.innerHTML += listItems
}

if (leadsFromLocalStorage){
    myLeads = leadsFromLocalStorage
    render(myLeads)
}

function clear(){
    localStorage.clear()
    ulEl.innerHTML = ''
    myLeads = []
    render(myLeads)
}

function jsonToCSV(object){
    const items = object
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(items[0])
    const csv = [
    header.join(','), // header row first
    ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')
    return csv
}

function download(file) {
    const link = document.createElement('a')
    const url = URL.createObjectURL(file)

    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

tabBtn.addEventListener("click", function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        myLeads.push({"url": tabs[0].url, "position": tabs[0].title, "company": "Unknown Company", "status": statusEl.value, "date": today})
        localStorage.setItem("myLeads", JSON.stringify(myLeads))
        render(myLeads)
    })
})

saveJobBtn.addEventListener("click", function(){   
    if(!linkEl.value) {
        console.log("Missing Link!")
    }
    else{
        myLeads.push({"url": linkEl.value, "position": posEl.value, "company": comEl.value, "status": statusEl.value, "date": today})
        linkEl.value = ""
        posEl.value = ""
        comEl.value = ""
        localStorage.setItem("myLeads", JSON.stringify(myLeads))
        render(myLeads)
    }
}
)

deleteBtn.addEventListener("dblclick", clear)


downloadBtn.addEventListener("click", function(){
    csv = jsonToCSV(myLeads)
    const file = new File([csv], `jobs-applied-${today}.csv`, {
        type: 'text/plain',
    })

    download(file)
    clear()
})