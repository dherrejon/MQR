<?php
	
function GetTipoInformacion()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT TipoInformacionId, Nombre FROM TipoInformacion";

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

function AgregarTipoInformacion()
{
    $request = \Slim\Slim::getInstance()->request();
    $tipoInformacion = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO TipoInformacion (Nombre) VALUES(:Nombre)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $tipoInformacion->Nombre);

        $stmt->execute();
        
        $db = null;
        
        echo '[{"Estatus": "Exitoso"}]';

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarTipoInformacion()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $tipoInformacion = json_decode($request->getBody());
   
    $sql = "UPDATE TipoInformacion SET Nombre='".$tipoInformacion->Nombre."' WHERE TipoInformacionId =".$tipoInformacion->TipoInformacionId."";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db = null;

        echo '[{"Estatus":"Exitoso"}]';
    }
    catch(PDOException $e) 
    {    
        echo '[{"Estatus": "Fallido"}]';
        $app->status(409);
        $app->stop();
    }
}
    
?>
