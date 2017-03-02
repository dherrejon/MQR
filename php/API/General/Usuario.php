<?php

function GetUsuarios()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT UsuarioId, Nombre, Apellidos, NombreUsuario, Correo, Activo FROM Usuario";

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        echo json_encode($response);  
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

function ActivarDesactivarUsuario()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    try 
    {
        $db = getConnection();
        
        $sql = "UPDATE Usuario SET Activo = ".$datos[0]." WHERE UsuarioId = ".$datos[1]."";
        $stmt = $db->prepare($sql);
        $stmt->execute();
    
        $db = null;
        
        echo '[{"Estatus": "Exito"}]';
    }
    catch(PDOException $e) 
    {
        echo '[{"Estatus":"Fallo"}]';
        //echo ($sql);
        $app->status(409);
        $app->stop();
    }
}

function GetPermisoUsuario($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT p.PermisoId FROM Permiso p, PermisoPorUsuario pu 
    WHERE pu.PermisoId = p.PermisoId AND pu.UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        echo json_encode($response);  
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}


/*-------------------- Contraseña ------------------------*/
function CambiarPasswordPorUsuario()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $usuario = json_decode($request->getBody());
    
    $db;
    $stmt;
    $response;
    $sql = "SELECT COUNT(*) as count FROM Usuario WHERE UsuarioId='".$usuario[0]."' AND Password = '".$usuario[1]."'";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
    } 
    catch(PDOException $e) 
    {
        //echo $e;
        echo '[ { "Estatus": "Fallo" } ]';
        //$app->status(409);
        $app->stop();
    }
    
    if($response[0]->count != "1")
    {
        echo '[ { "Estatus": "ErrorPassword" } ]';
        $db = null;
        $app->stop();
    }
    else
    {   
        $sql = "UPDATE Usuario SET Password='".$usuario[2]."' WHERE UsuarioId=".$usuario[0]."";

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $db = null;
            //if($stmt->rowCount() == 1)
            echo '[{"Estatus":"Exitoso"}]';
        }
        catch(PDOException $e) 
        {
            echo ($e);
            echo '[{"Estatus":"Fallo"}]';
            $app->status(409);
            $app->stop();
        }
    }
}

/*---------------------  Permiso --------------*/
function GetPermiso()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT PermisoId, Nombre, AplicacionId, Clave, NombreAplicacion FROM PermisoVista";

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        echo '[ { "Estatus": "Exitoso"}, {"Permiso":'.json_encode($response).'} ]';
        
        //echo json_encode($response);  
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

?>