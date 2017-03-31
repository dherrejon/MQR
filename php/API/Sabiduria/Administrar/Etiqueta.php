<?php
	
function GetEtiqueta()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT EtiquetaId, Nombre, Activo FROM Etiqueta";

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

function AgregarEtiqueta()
{
    $request = \Slim\Slim::getInstance()->request();
    $etiqueta = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Etiqueta (Nombre, Activo) VALUES(:Nombre, :Activo)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $etiqueta->Nombre);
        $stmt->bindParam("Activo", $etiqueta->Activo);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarEtiqueta()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $etiqueta = json_decode($request->getBody());
   
    $sql = "UPDATE Etiqueta SET Nombre='".$etiqueta->Nombre."', Activo = '".$etiqueta->Activo."'  WHERE EtiquetaId=".$etiqueta->EtiquetaId."";
    
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

function ActivarDesactivarEtiqueta()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    try 
    {
        $db = getConnection();
        
        $sql = "UPDATE Etiqueta SET Activo = ".$datos[0]." WHERE EtiquetaId = ".$datos[1]."";
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
    
?>
