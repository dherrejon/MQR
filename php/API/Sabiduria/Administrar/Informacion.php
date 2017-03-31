<?php
	
function GetInformacion()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM InformacionVista";

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        foreach ($response as $file) 
        {
            $file->Archivo =  base64_encode($file->Archivo);
        }
        
        echo '[ { "Estatus": "Exito"}, {"Informacion":'.json_encode($response).'} ]';
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

function AgregarInformacion()
{
    $request = \Slim\Slim::getInstance()->request();
    //$informacion = json_decode($request->getBody());
    $informacion = json_decode($_POST['informacion']);
    global $app;
    
    if($informacion->OrigenInformacion->OrigenInformacionId == "2" || $informacion->OrigenInformacion->OrigenInformacionId == "3" && $informacion->ArchivoSeleccionado)
    {
        $name = $_FILES['file']['name'];
        $ext = pathinfo($name, PATHINFO_EXTENSION);
        
        $archivo = addslashes(file_get_contents($_FILES['file']['tmp_name']));
        
        $sql = "INSERT INTO Informacion (TemaId, TipoInformacionId, FuenteId, OrigenInformacionId, Contenido, Archivo, NombreArchivo, ExtensionArchivo) 
                        VALUES(:TemaId, :TipoInformacionId, :FuenteId, :OrigenInformacionId, :Contenido, '".$archivo."', '".$informacion->NombreArchivo."', '".$ext."')";
        
        
        
    }
    else
    {
        $sql = "INSERT INTO Informacion (TemaId, TipoInformacionId, FuenteId, OrigenInformacionId, Contenido) 
                        VALUES(:TemaId, :TipoInformacionId, :FuenteId, :OrigenInformacionId, :Contenido)";
    }
    
    $informacionId;
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("TemaId", $informacion->Tema->TemaId);
        $stmt->bindParam("TipoInformacionId", $informacion->TipoInformacion->TipoInformacionId);
        $stmt->bindParam("FuenteId", $informacion->Fuente->FuenteId);
        $stmt->bindParam("OrigenInformacionId", $informacion->OrigenInformacion->OrigenInformacionId);
        $stmt->bindParam("Contenido", $informacion->Contenido);

        $stmt->execute();
        
        $informacionId = $db->lastInsertId();
        

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $countEtiqueta = count($informacion->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        $sql = "INSERT INTO EtiquetaPorInformacion (InformacionId, EtiquetaId) VALUES";
        
        for($k=0; $k<$countEtiqueta; $k++)
        {
            $sql .= " (".$informacionId.", ".$informacion->Etiqueta[$k]->EtiquetaId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
            echo '[{"Estatus": "Exitoso"}, {"Estatus": "'.$informacionId.'"}]';
            $db->commit();
            $db = null;
        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallido"}]';
            echo $e;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    else
    {
        echo '[{"Estatus": "Exitoso"}, {"Estatus": "'.$informacionId.'"}]';
        $db->commit();
        $db = null;
    }
}

function EditarInformacion()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();

    $informacion = json_decode($_POST['informacion']);
    
    if($informacion->OrigenInformacion->OrigenInformacionId == "2" || $informacion->OrigenInformacion->OrigenInformacionId == "3" && $informacion->ArchivoSeleccionado)
    {
        $name = $_FILES['file']['name'];
        $ext = pathinfo($name, PATHINFO_EXTENSION);
        
        $archivo = addslashes(file_get_contents($_FILES['file']['tmp_name']));
        
        $sql = "UPDATE Informacion SET TemaId='".$informacion->Tema->TemaId."', TipoInformacionId='".$informacion->TipoInformacion->TipoInformacionId."',
        FuenteId='".$informacion->Fuente->FuenteId."', OrigenInformacionId='".$informacion->OrigenInformacion->OrigenInformacionId."', Contenido = '".$informacion->Contenido."',
        Archivo = '".$archivo."', NombreArchivo = '".$name."', ExtensionArchivo = '".$ext."'
        WHERE InformacionId=".$informacion->InformacionId;
    }
    else
    {
        $sql = "UPDATE Informacion SET TemaId='".$informacion->Tema->TemaId."', TipoInformacionId='".$informacion->TipoInformacion->TipoInformacionId."',
        FuenteId='".$informacion->Fuente->FuenteId."', OrigenInformacionId='".$informacion->OrigenInformacion->OrigenInformacionId."', Contenido = '".$informacion->Contenido."'
        WHERE InformacionId=".$informacion->InformacionId;
    }
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->execute();
    }
    catch(PDOException $e) 
    {    
        echo '[{"Estatus": "Fallido"}]';
        echo $sql;
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM EtiquetaPorInformacion WHERE InformacionId=".$informacion->InformacionId;
    try 
    {
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        echo $e;
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $countEtiqueta = count($informacion->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        $sql = "INSERT INTO EtiquetaPorInformacion (InformacionId, EtiquetaId) VALUES";
        
        for($k=0; $k<$countEtiqueta; $k++)
        {
            $sql .= " (".$informacion->InformacionId.", ".$informacion->Etiqueta[$k]->EtiquetaId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();

            $db->commit();
            $db = null; 

            echo '[{"Estatus": "Exitoso"}]';
        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallido"}]';
            echo $e;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    else
    {
        $db->commit();
        $db = null; 

        echo '[{"Estatus": "Exitoso"}]';
    }
}


/*------------- Datos de la información -------------------*/
function GetInformacionEtiqueta($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT e.Nombre, e.EtiquetaId FROM EtiquetaPorInformacion ei INNER JOIN Etiqueta e ON ei.EtiquetaId = e.EtiquetaId
    WHERE  ei.InformacionId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        echo '[ { "Estatus": "Exito"}, {"Etiqueta":'.json_encode($response).'} ]';
    } 
    catch(PDOException $e) 
    {
        echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}
   
?>
