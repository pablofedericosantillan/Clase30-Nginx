// -------------- MODO FORK -------------------
//pm2 start server.js --name="Server1" --watch -- 8081 FORK 

// -------------- MODO CLUSTER -------------------
//pm2 start server.js --name="Server2" --watch -i max -- 8082 CLUSTER 
//o
//pm2 start server.js --name="Server1" --watch -- 8082 CLUSTER 


//pm2 list
//pm2 delete id/name
//pm2 desc name
//pm2 monit
//pm2 --help
//pm2 logs
//pm2 flush

// ------------------ NGINX ----------------------
//http://nginx.org/en/docs/windows.html
//start nginx
//tasklist /fi "imagename eq nginx.exe"
//nginx -s reload
//nginx -s quit

const express = require('express');
const app = express();
const http = require('http').Server(app);
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;


//console.log('p',process.argv[3])
// crear los workers
if (cluster.isMaster &&  process.argv[3]=='CLUSTER' ) {

    console.log('Num Process',numCPUs)
    console.log(`PID MASTER ${process.pid}`)

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork(); // creamos un worker para cada cpu
    }

    // controlamos la salida de los workers
    cluster.on('exit', worker => {
        console.log('Worker', worker.process.pid, 'died', new Date().toLocaleString());
        cluster.fork();
    });

} else{

const io = require('socket.io')(http);
const productos = require('./api/productos');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
//app.use(express.static('public'))

/* -------------------- Base de Datos ---------------------- */
require('./baseDatos/models/coneccion');
const baseDatosMensajes = require('./baseDatos/baseDatosMensajes');

/* -------------------- HTTP endpoints ---------------------- */
const productosRouter = require('./routes/productos');
app.use('/api', productosRouter);

/* --------------- Configuración de handlebars -------------- */
const handlebars = require('express-handlebars');
app.engine(
    "hbs",
    handlebars({
      extname: ".hbs",
      defaultLayout: 'index.hbs',
    })
);
app.set("view engine", "hbs");
app.set("views", "./views");

/* -----------------Cookies, Session y Storages--------------------- */
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

app.use(cookieParser())
app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://pfsantillan:35783028@cluster0.kfxor.mongodb.net/ecommerce?retryWrites=true&w=majority",
        //'mongodb://localhost:27017/ecommerce',
        mongoOptions: advancedOptions,
        ttl: 10*60
    }),
   /* cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 10*10*60
    },*/
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}));

/* ------------------- PASSPORT ---------------------------- */
const passport = require('passport');
//const LocalStrategy = require('passport-local').Strategy;
const bCrypt = require('./api/bCrypt');
const User = require('./baseDatos/baseDatosUsers');
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv');

dotenv.config();

// completar con sus credenciales
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID; //process.argv[4] || 
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET //process.argv[5] ||;

// configuramos passport para usar facebook
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'emails'],
    scope: ['email']
}, function (accessToken, refreshToken, profile, done) {
    //console.log(profile);
    let userProfile = profile;
    return done(null, userProfile);
}));

  passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

//Inicializamos Passport 
app.use(passport.initialize());
app.use(passport.session());


/* -----------------ENDPOINTS: LOGING, SIGNUP Y LOGOUT--------------------- */
const function_passport = require('./api/function_passport');

//-LOGIN
app.get('/login', function_passport.getLogin);
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook',
    {
        successRedirect: '/datos',
        failureRedirect: '/faillogin'
    }
));
app.get('/datos', (req,res) => {
    //console.log(req.user)
    let { displayName, emails, photos} = req.user;
    console.log('datos extraidos', displayName, emails[0].value, photos[0].value)
    console.log('\n ---entre a datos----\n')
        res.render("tablas", {
            nombre: displayName,
            email: emails[0].value,
            foto: photos[0].value
        })
})
app.get('/faillogin', (req, res) => {
    res.status(401).send({ error: 'no se pudo autenticar con facebook' })
});

//-LOGOUT
app.get('/logout', function_passport.getLogout);

//-INFO
app.get('/info', function_passport.info);

//-RAMDOMS
app.get('/randoms', function_passport.randoms);

/* -------------------- Web Sockets ---------------------- */
const mensajes = [];
io.on('connection', async socket => {
    console.log('Nuevo cliente conectado!');
    
    socket.emit('productos', productos.listar());
    socket.on('update', async data => {
     await io.sockets.emit('productos', productos.listar());
    });

    socket.emit('messages', await baseDatosMensajes.leer());
    socket.on('new-message', async msj=>{
        //console.log(msj)
        await baseDatosMensajes.guardar(msj)
        io.sockets.emit('messages', await baseDatosMensajes.leer()); 
    })    
});

/* ------------------------------------------------------- */
const PORT = parseInt(process.argv[2]) || 8080;
http.listen(PORT, () => {
    //console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Servidor express escuchando en http://localhost:${PORT} - PID WORKER ${process.pid}`)
});
http.on("error", error => console.log(`Error en servidor ${error}`))

}