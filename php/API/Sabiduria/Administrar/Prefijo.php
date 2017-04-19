<?php
	
function GetPrefijo()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT PrefijoId, Nombre, Abreviacion FROM Prefijo WHERE PrefijoId > 0";

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

function AgregarPrefijo()
{
    $request = \Slim\Slim::getInstance()->request();
    $abreviacion = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Prefijo (Nombre, Abreviacion) VALUES(:Nombre, :Abreviacion)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $abreviacion->Nombre);
        $stmt->bindParam("Abreviacion", $abreviacion->Abreviacion);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        $db = null;
    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarPrefijo()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $abreviacion = json_decode($request->getBody());
   
    $sql = "UPDATE Prefijo SET Nombre='".$abreviacion->Nombre."', Abreviacion = '".$abreviacion->Abreviacion."'  WHERE PrefijoId=".$abreviacion->PrefijoId."";
    
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
