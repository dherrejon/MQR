<?php

    require 'Slim/Slim.php';
    require 'configuration.php';

    require 'General/Sesion.php';

    /*-----Seguridad-----*/
    require 'PHP-JWT/Authentication/JWT.php';
    require 'PHP-JWT/Exceptions/SignatureInvalidException.php';
    require 'PHP-JWT/Exceptions/BeforeValidException.php';
    require 'PHP-JWT/Exceptions/ExpiredException.php';

    $host = $_SERVER['SERVER_NAME'];

    \Slim\Slim::registerAutoloader();
    $app = new \Slim\Slim();

    date_default_timezone_set($time_zone);

    session_start();

    //-------------------------------------------------Seguridad------------------------------------------
    $seguridad = function() use ($key, $host) 
    {

        $app = \Slim\Slim::getInstance();

        $jwt = $app->request->headers->get('X-Api-Key');

        if( null != $jwt )
        {
             try
             {
                    $app->response->headers->set('X-Origin-Response', $host); 
                    $jwtDecoded = JWT::decode($jwt, $key, array('HS256'));
             }
             catch ( SignatureInvalidException $excepcionSE )
             {
                    $app->status(401);
                    $app->stop();
             }
             catch ( BeforeValidException $excepcionBE )
             {
                    $app->status(401);
                    $app->stop();
             }
             catch ( ExpiredException $excepcionEE )
             {

                    try{
                            $app->response->headers->set('X-Api-Key', generateToken(false)); 
                    }
                    catch ( DomainException $excepcion )
                    {
                            $app->status(401);
                            $app->stop();
                    }

             }
             catch ( DomainException $excepcionDE )
             {
                    $app->status(401);
                    $app->stop();
             }
             catch ( UnexpectedValueException $excepcionUE )
             {
                    $app->status(401);
                    $app->stop();               
             }
        }
        else
        {
            $app->status(401);
            $app->stop();
        }        
    };

    //------------------------------------ Inicio de sesion ------------------------------------------------
    function generateToken($expired)
    {
        global $key;
        global $host;
        global $app;
        global $token_expiration_time;
        $state;
        
        if(!$expired)
        {
            if ( isset( $_SESSION['MQR'] ) )
                $state = true;
            else
                $state = false;
        }
        else
            $state = 'expired';
            
        try{
                $newPayload = array(
                    "state" => $state,
                    "iat" => time(),
                    "exp" => strtotime($token_expiration_time)
                );

                $newJWT = JWT::encode($newPayload, $key);

                return $newJWT;
        }
        catch ( DomainException $excepcion )
        {
                $app->status(401);
                $app->stop();
        }
    }

    function quitarSesion()
    {
        
        if( isset( $_SESSION['MQR'] ) )
        {
            
            if ( ini_get("session.use_cookies") ) 
            {
            
                $params = session_get_cookie_params();
                setcookie(session_name(), 
                                      '', 
                          time() - 42000,
                         $params["path"], 
                       $params["domain"],
                       $params["secure"], 
                    $params["httponly"]);
                
            }
            
            session_unset();
            session_destroy();
            
        }
    }

    $ChecarSesion = function() use ($session_expiration_time)
    {
        
        $app = \Slim\Slim::getInstance();
        
        if( isset( $_SESSION['MQR'] ) ) 
        {

            if( ( $_SESSION['timeout'] - time() ) < 0 )
            {
                quitarSesion();
                
                $app->response->headers->set('X-Api-Key', generateToken(true));
            }
            else
            {
                $_SESSION['timeout'] = strtotime( $session_expiration_time );   
            }
                
        }        
    };

    /*-----------Sesion-------------*/
    $app->post('/Login', $seguridad, 'Login');
    $app->get('/GetEstadoSesion', $seguridad, $ChecarSesion, 'GetEstadoSesion');
    $app->get('/CerrarSesion', $seguridad, 'CerrarSesion');
    $app->put('/SetAplicacion', $seguridad, 'SetAplicacion');


    $app->run(); 


?>