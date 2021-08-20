function obtenerRandom() {
    return Math.floor(Math.random() * (1000 - 1)) + 1;
}

let numeros = {}
function rand(cant){
    for(let i=0; i<cant; i++) {
        let numero = obtenerRandom()
        if(!numeros[numero]) numeros[numero] = 1;
        numeros[numero]++
    }
    return numeros;
}

process.on('message', msg => {
    console.log(msg)
    const sum = rand(msg)
    process.send(sum)
})

module.exports = {
    obtenerRandom,
}




