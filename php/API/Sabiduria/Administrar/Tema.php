<?php
	
function GetTema()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT TemaId, Nombre FROM Tema";

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

function AgregarTema()
{
    $request = \Slim\Slim::getInstance()->request();
    $tema = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Tema (Nombre) VALUES(:Nombre)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $tema->Nombre);

        $stmt->execute();
        
        $db = null;
        
        echo '[{"Estatus": "Exitoso"}]';

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarTema()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $tema = json_decode($request->getBody());
   
    $sql = "UPDATE Tema SET Nombre='".$tema->Nombre."' WHERE TemaId =".$tema->TemaId."";
    
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
