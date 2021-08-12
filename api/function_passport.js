//-LOGIN
function postLogin (req, res) {
  //var user = req.user;
  res.sendFile(process.cwd() + '/public/index.html');
}
function postLogin (req, res) {
  let { username } = req.body
  req.session.username = username
  res.sendFile(process.cwd() + '/public/index.html');
}

function getLogin(req, res) {  
  if (req.isAuthenticated()) {
    //console.log('user logueado',req.user);
    res.render('tablas', {
      nombre: req.user.username
    });
  }
  else {
    console.log('user NO logueado');
    res.sendFile(process.cwd() + '/public/login.html');
  }
}


function getFaillogin (req, res) {
  console.log('error en login');
  res.render('login-error', {
  });
}

//-SIGNUP
function postSignup (req, res) {
  var user = req.user;
  res.sendFile(process.cwd() + '/public/signup.html');
}

function getSignup(req, res) {
    res.sendFile(process.cwd() + '/public/signup.html');
}

function getFailsignup (req, res) {
  console.log('error en signup');
  res.render('signup-error', {
  });
}

function getSignupSucessfull (req, res) {
  req.logout();
  res.sendFile(process.cwd() + '/public/login.html');

}

//-LOGOUT
function getLogout (req, res) {
  //let nombre = req.user.username;
  let { displayName} = req.user;
  //console.log('sssssssssaaa', displayName)
  let nombre = displayName//req.user.displayName
  req.logout();
  res.render("logout", {nombre})
}


//-INFO
function info(req, res) {

  process.stdout.write('Argumentos de entrada\n')
  process.argv.forEach((arg, index) => {
      console.log(index + ' -> ' + arg)
  });

  console.log('Nombre de la Plataforma',process.platform);
  console.log('Version de Nodejs', process.version);
  console.log('Uso de memoria', process.memoryUsage());
  console.log('Path de Ejecucion: ',process.execPath);
  console.log('Process id', process.pid)
  console.log('Carpeta corriente:', process.cwd())


  res.render("info", {
    arg1: process.argv[3],
    arg2: process.argv[4],
    plataforma: process.platform,
    versionNode: process.version,
    memoria: process.memoryUsage(),
    path: process.execPath,
    processID: process.pid,
    dirCarpeta: process.cwd()
})

}

//-RAMDOMS
const { fork } = require('child_process')

function randoms(req, res) {
  let {cant} = req.query;
  if (!cant){
    cant=100000000;
  }
        const computo = fork(__dirname + '/fork.js')
        computo.send(cant)
        computo.on('message', sum => {
            res.end(`Array de nros ramdom [${JSON.stringify(sum)}]`)
        })
    }

module.exports = {
    getLogin,
    postLogin,
    getFaillogin,
    getLogout,
    getSignup,
    postSignup,
    getFailsignup,
    getSignupSucessfull,
    info,
    randoms
}
