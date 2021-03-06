const express = require('express');
const morgan = require('morgan');
const path  = require('path');
const app = express();
//Settings
app.set('port', process.env.PORT || 3000);

//Middleware
app.use(morgan('dev'));
app.use(express.json());
//Static Files
app.use(express.static(path.join(__dirname + '/target/tmp')));

app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});