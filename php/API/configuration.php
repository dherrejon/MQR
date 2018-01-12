<?php

    $time_zone = "America/Mexico_City";
    $db_host = "localhost";
    $db_user = "root";
    $db_password = "cuentamysql";
    $db_name = "sabiduria";

    $key = "2017.s1St3m4MQr.M4R10Qu1J4DarZ";
    $token_expiration_time = '+1 hour';
    $session_expiration_time = '+20 hour';

    $url_webmail_app = "http://localhost/MQR/#/Webmail";
    $password_encriptacion_bd = "2017.3ncrypt.w3bmail";
    $directorio_adjuntos = '/adjuntos';

    function getConnection()
    {

        global $db_host;
        global $db_user;
        global $db_password;
        global $db_name;

        $dbh = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_password, array(PDO::MYSQL_ATTR_INIT_COMMAND =>
                                                                                            'SET NAMES  \'UTF8\''));

        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $dbh;

    };

?>
