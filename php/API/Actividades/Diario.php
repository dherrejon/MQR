<?php
	
function GetDiario($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT DiarioId, Notas, Fecha FROM Diario WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Diario":'.json_encode($response).'} ]'; 
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

//------------- Otas operaciones -----------------

function GetEtiquetaPorDiario($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT DiarioId, EtiquetaId, Nombre FROM EtiquetaDiarioVista WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Etiqueta":'.json_encode($response).'} ]'; 
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

function GetTemaPorDiario($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT DiarioId, TemaActividadId, Tema FROM TemaDiarioVista WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Tema":'.json_encode($response).'} ]'; 
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



    
?>
