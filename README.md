# 27-Autorizacion-Autenticacion-P2

Entregable del desafio de la clase 26, donde contiene la siguiente distribucion de carpetas:

*desafio-clase29-corridas: en esta carpeta estan las imagenes de las corridas realizadas para el desafio.

*API: funciones de la logica del producto, las de bcrypt y las funciones que utiliza las rutas del passport.

*BaseDatos: lo relacionado a la base de datos en MongoDB, para los mensajes, productos y usurios registrados.

*PUCLIC: la logica del front-end, vistas de login y signup.

*ROUTES: endpoints para los productos.

*Views: plantillas handlebars.

*Server.js: contiene la logica del back-end y la configuracion de la autenticacion de passport-facebook.

Para correr el programas, se puede o no especificar los parametros: npm start "1" "2" "3" "4"
donde:
1-Modo "FORK" o "CLUSTER", si no se especifica nada, se correra el programa en modo FORK.
2-Puerto a eleccion, si no se especifica nada se correra el programa en el puerto 8080.
3-FACEBOOK_CLIENT_ID.
4-FACEBOOK_CLIENT_SECRET
