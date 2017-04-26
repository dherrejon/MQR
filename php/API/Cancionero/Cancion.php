<?php
	
function GetCancion($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT CancionId, Titulo FROM Cancion WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Cancion":'.json_encode($response).'} ]'; 
        $db = null;
 
    } 
    catch(PDOException $e) 
    {
        echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

function GetCancionTodas()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT CancionId, Titulo FROM Cancion";

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Cancion":'.json_encode($response).'} ]'; 
        $db = null;
 
    } 
    catch(PDOException $e) 
    {
        echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

function AgregarCancion()
{
    $request = \Slim\Slim::getInstance()->request();
    //$cancion = json_decode($request->getBody());
    global $app;
    
    $cancion = json_decode($_POST['cancion']);
    
    if($_FILES['file']['error'] == 0)
    {
        $name = $_FILES['file']['name'];

        $archivo = addslashes(file_get_contents($_FILES['file']['tmp_name']));
        
         $sql = "INSERT INTO Cancion (UsuarioId, Titulo, Cancionero, NombreArchivo) VALUES(:UsuarioId, :Titulo, '".$archivo."', :NombreArchivo)";
    }
    else
    {
        echo '[ { "Estatus": "No se puedo leer el archivo" } ]';
        $app->stop();
    }

    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("UsuarioId", $cancion->UsuarioId);
        $stmt->bindParam("Titulo", $cancion->Titulo);
        $stmt->bindParam("NombreArchivo", $cancion->NombreArchivo);

        $stmt->execute();
        
        $cancionId = $db->lastInsertId();
        //echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        //$db = null;

    } catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $countArtista = count($cancion->Artista);
    
    if($countArtista>0)  
    {
        //Artistas Nuevos
        for($k=0; $k<$countArtista; $k++)
        {
            if($cancion->Artista[$k]->ArtistaId == "-1")
            {
                $sql = "INSERT INTO Artista (UsuarioId, Nombre) VALUES ('".$cancion->UsuarioId."', '".$cancion->Artista[$k]->Nombre."')";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    $stmt->execute();
                    
                    $cancion->Artista[$k]->ArtistaId = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    //echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }
        
        $sql = "INSERT INTO ArtistaPorCancion (CancionId, ArtistaId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countArtista; $k++)
        {
            $sql .= " (".$cancionId.", ".$cancion->Artista[$k]->ArtistaId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
            echo '[{"Estatus": "Exitoso"}, {"CancionId":'.$cancionId.'} ]';
            $db->commit();
            $db = null;
        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallo"}]';
            //echo $e;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    else
    {
        
        echo '[{"Estatus": "Exitoso"}, {"CancionId":'.$cancionId.'} ]';
        $db->commit();
        $db = null;
    }
}

function EditarCancion()
{
    $request = \Slim\Slim::getInstance()->request();
    //$cancion = json_decode($request->getBody());
    global $app;
    
    $cancion = json_decode($_POST['cancion']);
    
    if($cancion->ArchivoSeleccionado)
    {
        if($_FILES['file']['error'] == 0)
        {
            $name = $_FILES['file']['name'];

            $archivo = addslashes(file_get_contents($_FILES['file']['tmp_name']));

             $sql = "UPDATE Cancion SET Titulo = :Titulo, Cancionero = '".$archivo."', NombreArchivo = '".$cancion->NombreArchivo."' WHERE CancionId = ".$cancion->CancionId;
        }
        else
        {
            echo '[ { "Estatus": "No se puedo leer el archivo" } ]';
            $app->stop();
        }
    }
    else
    {
         $sql = "UPDATE Cancion SET Titulo = :Titulo WHERE CancionId = ".$cancion->CancionId;
    }

    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Titulo", $cancion->Titulo);

        $stmt->execute();
        //echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        //$db = null;

    } catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM ArtistaPorCancion WHERE CancionId=".$cancion->CancionId;
    try 
    {
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        //echo $e;
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $countArtista = count($cancion->Artista);
    
    if($countArtista > 0)  
    {
        //Artistas Nuevos
        for($k=0; $k<$countArtista; $k++)
        {
            if($cancion->Artista[$k]->ArtistaId == "-1")
            {
                $sql = "INSERT INTO Artista (UsuarioId, Nombre) VALUES ('".$cancion->UsuarioId."', '".$cancion->Artista[$k]->Nombre."')";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    $stmt->execute();
                    
                    $cancion->Artista[$k]->ArtistaId = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    //echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }
        
        $sql = "INSERT INTO ArtistaPorCancion (CancionId, ArtistaId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countArtista; $k++)
        {
            $sql .= " (".$cancion->CancionId.", ".$cancion->Artista[$k]->ArtistaId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
            echo '[{"Estatus": "Exitoso"}]';
            $db->commit();
            $db = null;
        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallo"}]';
            //echo $e;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    else
    {
        echo '[{"Estatus": "Exitoso"}]';
        $db->commit();
        $db = null;
    }
}

function BorrarCancion()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $cancion = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Cancion WHERE CancionId = ".$cancion;
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

/*------------------------------------- Relaciones de la cancion --------------------------------------------*/
function GetArtistaPorCancion($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM CancionVista 
    WHERE UsuarioId = ".$id;

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

function GetArtistaPorCancionTodos()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM CancionVista";

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

function GetCancionero($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT Cancionero, NombreArchivo FROM Cancion 
    WHERE CancionId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $response[0]->Cancionero =  base64_encode($response[0]->Cancionero);
        
        echo '[ { "Estatus": "Exito"}, {"Cancionero":'.json_encode($response).'} ]'; 
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
