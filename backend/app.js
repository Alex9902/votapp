require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

const auth = require("./middleware/auth");
const login = require('./routes/login');

app.use(express.json());
app.use(cookieParser());

/**
 * RUTAS PUBLICAS
 * /login - /frontend/assets
 * 
 * RUTAS PROTEGIDAS
 * todas las que tienen cmo argumento el middleware
 */
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use('/api', login);


app.use('/views', auth, express.static(path.join(__dirname, '../frontend/views')));

app.get('/', (req, res) => {
    if (req.cookies && req.cookies.token_votapp) return;

    else res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(8080, () => console.log("http://localhost:8080"));