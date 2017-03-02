<?php
	
function GetTipoFuente()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT TipoFuenteId, Nombre FROM TipoFuente";

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

function AgregarTipoFuente()
{
    $request = \Slim\Slim::getInstance()->request();
    $tipoFuente = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO TipoFuente (Nombre) VALUES(:Nombre)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $tipoFuente->Nombre);

        $stmt->execute();
        
        $db = null;
        
        echo '[{"Estatus": "Exitoso"}]';

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarTipoFuente()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $tipoFuente = json_decode($request->getBody());
   
    $sql = "UPDATE TipoFuente SET Nombre='".$tipoFuente->Nombre."' WHERE TipoFuenteId =".$tipoFuente->TipoFuenteId."";
    
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
