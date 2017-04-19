<?php
	
function GetAutor()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT AutorId, Nombre, Apellidos, PrefijoId, Abreviacion FROM AutorVista";

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

function AgregarAutor()
{
    $request = \Slim\Slim::getInstance()->request();
    $autor = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Autor (Nombre, Apellidos, PrefijoId) VALUES(:Nombre, :Apellidos, :PrefijoId)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $autor->Nombre);
        $stmt->bindParam("Apellidos", $autor->Apellidos);
        $stmt->bindParam("PrefijoId", $autor->Prefijo->PrefijoId);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        $db = null;

    } 
    catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarAutor()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $autor = json_decode($request->getBody());
   
    $sql = "UPDATE Autor SET Nombre='".$autor->Nombre."', Apellidos = '".$autor->Apellidos."', PrefijoId = '".$autor->Prefijo->PrefijoId."'  WHERE AutorId=".$autor->AutorId."";
    
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
