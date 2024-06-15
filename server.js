const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const { validationResult, check, body } = require('express-validator');

const { loadContact, findContact, addContact, checkDuplicate, deleteContact, updateContact } = require('./utilities/contacts.js')

const session = require('express-session')
const cookie = require('cookie-parser')
const flash = require('connect-flash')

const host = 'localhost'
const port = 3000

// menggunakan ejs
app.set('view engine', 'ejs')

// menggunakan ejs layouts
// third party middleware
app.use(expressLayouts)
app.use(cookie('secret'))
app.use(session({
    cookie: {
        maxAge: 6000
    },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

// express static
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// application level middleware


app.get('/', (req, res) => {
    // res.sendFile('./index.html', { root: __dirname })
    
    res.render('index', {
        layout: 'layouts/main-layout.ejs',
        title: 'Home',
        nama: 'Upiland',
    })
})

app.get('/about', (req, res) => {
    // res.sendFile('./about.html', { root: __dirname })
    res.render('about', {
        layout: 'layouts/main-layout.ejs',
        title: 'About',
    })
})

app.get('/contact', (req, res) => {
    // res.sendFile('./contact.html', { root: __dirname })
    const contacts = loadContact()

    res.render('contact', {
        layout: 'layouts/main-layout.ejs',
        title: 'Contact',
        contacts,
        msg: req.flash('msg')
    })
})

app.get('/contact/add', (req, res) => {

    const result = validationResult(req)
    res.render('add-contact', {
        layout: 'layouts/main-layout.ejs',
        title: 'Tambah Data Contact',
        errors: result.array()
    })
})

// route untuk post contact
app.post('/contact', [
    check('email').isEmail().withMessage('Email Tidak Valid'),
    check('noHP').isMobilePhone('id-ID').withMessage('No HP Tidak Valid'),
    body('nama').custom(value => {
        
        const duplicate = checkDuplicate(value)

        if (duplicate) {
            throw new Error('Nama Sudah Terdaftar Dalam Contact')
        }

        return true
    })
    ], (req, res) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
        
        res.render('add-contact', {
            layout: 'layouts/main-layout.ejs',
            title: 'Tambah Data Contact',
            errors: result.array()
        })

    } else {
        addContact(req.body)
        req.flash('msg', 'Data Contact Berhasil Ditambahkan')
        res.redirect('/contact')
    }
})

// route untuk edit contact
app.post('/contact/edit', [
    check('email').isEmail().withMessage('Email Tidak Valid'),
    check('noHP').isMobilePhone('id-ID').withMessage('No HP Tidak Valid'),
    body('nama').custom((value, { req }) => {
        
        const duplicate = checkDuplicate(value)

        if (value !== req.body.oldNama && duplicate) {
            throw new Error('Nama Sudah Terdaftar Dalam Contact')
        }

        return true
    })
    ], (req, res) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
        
        res.render('edit-contact', {
            layout: 'layouts/main-layout.ejs',
            title: 'Tambah Data Contact',
            errors: result.array(),
            contact: req.body
        })

    } else {
        updateContact(req.body)
        req.flash('msg', 'Data Contact Berhasil Ditambahkan')
        res.redirect('/contact')
    }
})


app.get('/contact/edit/:nama', (req, res) => {

    const contact = findContact(req.params.nama)
    const result = validationResult(req)

    res.render('edit-contact', {
        layout: 'layouts/main-layout.ejs',
        title: 'Edit Contact',
        contact,
        errors: result.array()
    })
})

app.get('/contact/delete/:nama', (req, res) => {

    const contact = findContact(req.params.nama)

    // untuk kondisi jika contact ada
    if (!contact) {
        res.status(404)
        res.send('<h1>404</h1>')
    } else {
        deleteContact(req.params.nama)
        req.flash('msg', 'Data Contact Berhasil Dihapus')
        res.redirect('/contact')
    }
})

app.get('/contact/:nama', (req, res) => {

    const contact = findContact(req.params.nama)

    res.render('detail', {
        layout: 'layouts/main-layout.ejs',
        title: 'Detail Contact',
        contact
    })
})


// app.use digunakan untuk middleware yg mana selain path diatas akan menampilkan halaman tidak ditemukan
app.use('/', (req, res) => {
    // res.status digunakan untuk menambahkan status code
    res.status(404)
    res.send('<h1>404</h1>')
})

app.listen(port, () => {
    console.log(`Server running in http://${host}:${port}`)
})