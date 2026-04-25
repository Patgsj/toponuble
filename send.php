<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $para = "patricio@toponuble.cl";
    $asunto = "Nueva Cotización desde Topoñuble.cl";

    // Recolectar datos
    $nombre = strip_tags($_POST['nombre']);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $telefono = strip_tags($_POST['telefono']);
    $servicio = strip_tags($_POST['servicio']);
    $ubicacion = strip_tags($_POST['ubicacion']);
    $mensaje = strip_tags($_POST['mensaje']);

    $contenido = "Detalles de la solicitud:\n\n";
    $contenido .= "Nombre: $nombre\n";
    $contenido .= "Email: $email\n";
    $contenido .= "Teléfono: $telefono\n";
    $contenido .= "Servicio: $servicio\n";
    $contenido .= "Ubicación: $ubicacion\n\n";
    $contenido .= "Mensaje:\n$mensaje\n";

    // Headers para que el correo sea válido
    $headers = "From: patricio@toponuble.cl\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    if (mail($para, $asunto, $contenido, $headers)) {
        echo json_encode(["status" => "success"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error del servidor al enviar"]);
    }
} else {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Método no permitido"]);
}
?>