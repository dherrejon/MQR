<?php
	
function GetArtista($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT ArtistaId, Nombre, UsuarioId FROM Artista WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Artista":'.json_encode($response).'} ]'; 
        $db = null;
 
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

function AgregarArtista()
{
    $request = \Slim\Slim::getInstance()->request();
    $artista = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Artista (Nombre, UsuarioId) VALUES(:Nombre, :UsuarioId)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $artista->Nombre);
        $stmt->bindParam("UsuarioId", $artista->UsuarioId);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarArtista()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $artista = json_decode($request->getBody());
   
    $sql = "UPDATE Artista SET Nombre='".$artista->Nombre."' WHERE ArtistaId =".$artista->ArtistaId."";
    
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

function BorrarArtista()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $artista = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Artista WHERE ArtistaId=".$artista;
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
        $db = null;
        echo '[ { "Estatus": "Exitoso" } ]';
        
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        //echo $e;
        $app->status(409);
        $app->stop();
    }

}
    
?>
