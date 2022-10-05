const { MongoClient } = require('mongodb');
require('dotenv').config();
const {crearReserva} = require('./controllers/reserva');




async function main() {

    const uri = process.env.MONGODB_URI;

    const cliente = new MongoClient(uri);

    try {
        // Conexion al cluster de MongoDB
        await cliente.connect();


        await crearReserva(cliente,
            "jesus@gmail.com",
            "Domo geodésico en el desierto", //Pisac, Cusco      _Domo geodésico en el desierto  Casa domo en el Valle Sagrado
            [new Date("2022-10-09"), new Date("2022-10-10")],
            { precioPorNoche: 1709, pedidoEspecial: "Aire acondicionado", desayunoIncluido: true });

            
    } finally {
        
        await cliente.close();
    }
}

main().catch(console.error);

