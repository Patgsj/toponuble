<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $para = "patricio@toponuble.cl";
    $asunto = "Nuevo mensaje de contacto - Topoñuble";
    
    $nombre = $_POST['nombre'];
    $correo = $_POST['email'];
    $mensaje = $_POST['mensaje'];
    
    $cuerpo = "Nombre: $nombre\nCorreo: $correo\n\nMensaje:\n$mensaje";
    $headers = "From: contacto@toponuble.cl";

    if (mail($para, $asunto, $cuerpo, $headers)) {
        echo "Mensaje enviado con éxito";
    } else {
        echo "Error al enviar";
    }
}
?>