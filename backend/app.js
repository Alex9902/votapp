require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const login = require('./routes/auth');

app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

//RUTAS
app.use('/api', login);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(8080, () => console.log("http://localhost:8080"));