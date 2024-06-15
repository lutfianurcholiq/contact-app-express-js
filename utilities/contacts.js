const { check } = require('express-validator')
const fs = require('fs') 

// melakukan cek folder data
const folderPath = './data'
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath)
}

// melakukan cek file contacts.json
const filePath = './data/contacts.json'
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf-8')
}

// fungsi untuk load contact
const loadContact = () => {
    // melakukan pembuatan file contacts.json
    const file = fs.readFileSync('data/contacts.json', 'utf-8')
    // melakukan convert ke json
    const contacts = JSON.parse(file)

    return contacts
}

// fungsi untuk mencari nama dalam contact
const findContact = (nama) => {
    const contacts = loadContact()
    return contacts.find((contact) => contact.nama.toLowerCase() === nama.toLowerCase());
}

// fungsi untuk menimpa contact dengan yg baru
const saveContacts = (contact) => {
    fs.writeFileSync('./data/contacts.json', JSON.stringify(contact))
}

// fungsi untuk menyimpan contact
const addContact = (contact) => {
    const contacts = loadContact()
    contacts.push(contact)
    saveContacts(contacts)
}

// untuk cek duplicate isi contact
const checkDuplicate = (nama) => {
    const contacts = loadContact()
    return contacts.find((contact) => contact.nama === nama)
}

// fungsi untuk delete isi contact
const deleteContact = (nama) => {
    const contacts = loadContact()
    const filterContact = contacts.filter((contact) => contact.nama !== nama)

    saveContacts(filterContact)
}

// fungsi untuk edit isi contact
const updateContact = (contactBaru) => {
    const contacts = loadContact()
    const filteredContact = contacts.filter((contact) => contact.nama !== contactBaru.oldNama)
    // menghapus oldNama dari contactBaru biar di push ke contact.json
    delete contactBaru.oldNama
    // melakukan push contact baru
    filteredContact.push(contactBaru)
    saveContacts(filteredContact)
}

module.exports = { loadContact, findContact, addContact, checkDuplicate, deleteContact, updateContact }