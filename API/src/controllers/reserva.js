


const crearReserva = async (cliente, userEmail, nombreAlojamiento, fechasParaReservar, detallesReserva) => {

    
    const usuarios = cliente.db("BD4").collection("usuarios");

  
    const alojamientos = cliente.db("BD4").collection("alojamientos");

    // Documento de reserva que se agrega para los usarios.
    const reservacion = crearDocumentoReserva(nombreAlojamiento, fechasParaReservar, detallesReserva);

    // Inicio de la sesion del cliente
    const session = cliente.startSession();

    //Opciones para la transaccion | opcional
    const opcionesTransaccion = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };

    try {
        
        const resultadoTransaccion = await session.withTransaction(async () => {


            // Comprobar si el alojamientode Airbnb ya está reservado para esas fechas
            const isAlojamientoReservado = await alojamientos.findOne(
                { nombre: nombreAlojamiento, fechasReservadas: { $in: fechasParaReservar } },
                { session });
            if (isAlojamientoReservado) {
                await session.abortTransaction();
                console.error("Este Alojamiento ya está reservado para al menos una de las fechas indicadas. No se pudo crear la reserva.");
                console.error("Cualquier operación que ya haya ocurrido como parte de esta transacción se revertirá.")
                return;
            }

            // Agregue una reserva a la matriz de reservas para el documento apropiado en la colección de usuarios

            const usuariosActualizados = await usuarios.updateOne(
                { email: userEmail },
                { $addToSet: { reservaciones: reservacion } },  //agrega un valor a una matriz
                { session });

            console.log(`${usuariosActualizados.matchedCount} usuarios encontrados en la colección con la dirección de correo electrónico ${userEmail}.`);
            console.log(`${usuariosActualizados.modifiedCount} documento usuario actualizado con la reserva.`);

            //  Agregue las fechas de reserva a la matriz de fechas reservadas para el documento apropiado en la colección de alojamientos
            const alojamientoActualizado = await alojamientos.updateOne(
                { nombre: nombreAlojamiento },
                { $addToSet: { fechasReservadas: { $each: fechasParaReservar } } }, //operador para agregar varios valores a una matriz
                { session });
            console.log(`${alojamientoActualizado.matchedCount} documento encontrado en la colección alojamientos con el nombre ${nombreAlojamiento}.`);
            console.log(`${alojamientoActualizado.modifiedCount} el documento fue actualizado para incluir las fechas de reserva.`);

        }, opcionesTransaccion);


        if (resultadoTransaccion) {
            console.log("La reserva fue creada con éxito.");
        } else {
            console.log("La transacción fue abortada intencionalmente.");
        }
    } catch (e) {
        console.log("La transacción fue abortada debido a un error inesperado: " + e);
    } finally {
       
        await session.endSession();
    }

}

const crearDocumentoReserva = (nombreAlojamiento, fechasParaReservar, detallesReserva) => {
    
    let reservacion = {
        nombre: nombreAlojamiento,
        fechas: fechasParaReservar,
    }
    for (let detalle in detallesReserva) {
        reservacion[detalle] = detallesReserva[detalle];
    }

    return reservacion;
}


module.exports = {
    crearDocumentoReserva,
    crearReserva
}

