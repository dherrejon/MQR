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
        if($_FILES['file']['error'] == 0)
        {
            $name = $_FILES['file']['name'];
            $ext = pathinfo($name, PATHINFO_EXTENSION);

            $archivo = addslashes(file_get_contents($_FILES['file']['tmp_name']));

            $sql = "INSERT INTO Informacion (Titulo, TipoInformacionId, FuenteId, OrigenInformacionId, Contenido, Archivo, NombreArchivo, ExtensionArchivo, Seccion, Observacion, Hecho)
                            VALUES(:Titulo, :TipoInformacionId, :FuenteId, :OrigenInformacionId, :Contenido, '".$archivo."', '".$informacion->NombreArchivo."', '".$ext."', :Seccion, :Observacion, :Hecho)";
        }
        else
        {
            echo '[ { "Estatus": "Fallo" } ]';
            $app->stop();
        }
    }
    else
    {
        $sql = "INSERT INTO Informacion (Titulo, TipoInformacionId, FuenteId, OrigenInformacionId, Contenido, Seccion, Observacion, Hecho)
                        VALUES(:Titulo, :TipoInformacionId, :FuenteId, :OrigenInformacionId, :Contenido, :Seccion, :Observacion, :Hecho)";
    }

    $informacionId;
    try
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Titulo", $informacion->Titulo);
        $stmt->bindParam("TipoInformacionId", $informacion->TipoInformacion->TipoInformacionId);
        $stmt->bindParam("FuenteId", $informacion->Fuente->FuenteId);
        $stmt->bindParam("OrigenInformacionId", $informacion->OrigenInformacion->OrigenInformacionId);
        $stmt->bindParam("Contenido", $informacion->Contenido);
        $stmt->bindParam("Seccion", $informacion->Seccion);
        $stmt->bindParam("Observacion", $informacion->Observacion);
				$stmt->bindParam("Hecho", $informacion->Hecho);

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


     $countTema = count($informacion->Tema);

    if($countTema>0)
    {
        for($k=0; $k<$countTema; $k++)
        {
            if($informacion->Tema[$k]->TemaId == "-1")
            {
                $sql = "INSERT INTO Tema (Nombre) VALUES (:Tema)";

                try
                {
                    $stmt = $db->prepare($sql);

                    $stmt->bindParam("Tema", $informacion->Tema[$k]->Nombre);

                    $stmt->execute();

                    $informacion->Tema[$k]->TemaId = $db->lastInsertId();
                }
                catch(PDOException $e)
                {
                    echo '[{"Estatus": "Fallo"}]';
                    echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }

        $sql = "INSERT INTO TemaPorInformacion (InformacionId, TemaId) VALUES";

        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$informacionId.", ".$informacion->Tema[$k]->TemaId."),";
        }

        $sql = rtrim($sql,",");

        try
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
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

    $countEtiqueta = count($informacion->Etiqueta);

    if($countEtiqueta>0)
    {
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($informacion->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";

                try
                {
                    $stmt = $db->prepare($sql);

                    $stmt->bindParam("UsuarioId", $informacion->UsuarioId);
                    $stmt->bindParam("Nombre", $informacion->Etiqueta[$k]->Nombre);

                    $stmt->execute();

                    $informacion->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
                }
                catch(PDOException $e)
                {
                    echo '[{"Estatus": "Fallo"}]';
                    echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }

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

            echo '[{"Estatus": "Exitoso"}, {"Id": "'.$informacionId.'"}, {"Etiqueta":'.json_encode($informacion->Etiqueta).'}, {"Tema":'.json_encode($informacion->Tema).'}]';
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
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$informacionId.'"}, {"Etiqueta":'.json_encode($informacion->Etiqueta).'}, {"Tema":'.json_encode($informacion->Tema).'}]';
        $db->commit();
        $db = null;
    }
}

function EditarInformacion()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();

    $informacion = json_decode($_POST['informacion']);

    if(($informacion->OrigenInformacion->OrigenInformacionId == "2" || $informacion->OrigenInformacion->OrigenInformacionId == "3") && $informacion->ArchivoSeleccionado)
    {
        if($_FILES['file']['error'] == 0)
        {
            $name = $_FILES['file']['name'];

            $ext = pathinfo($name, PATHINFO_EXTENSION);

            $archivo = addslashes(file_get_contents($_FILES['file']['tmp_name']));

            $sql = "UPDATE Informacion SET Titulo= :Titulo, TipoInformacionId='".$informacion->TipoInformacion->TipoInformacionId."',
            FuenteId=".$informacion->Fuente->FuenteId.", OrigenInformacionId='".$informacion->OrigenInformacion->OrigenInformacionId."', Contenido = :Contenido,
            Archivo = '".$archivo."', NombreArchivo = '".$name."', ExtensionArchivo = '".$ext."', Seccion = '".$informacion->Seccion."', Observacion = :Observacion, Hecho = :Hecho
            WHERE InformacionId=".$informacion->InformacionId;
        }
        else
        {
            echo '[ { "Estatus": "Fallo" } ]';
            $app->stop();
        }
    }
    else
    {
        $sql = "UPDATE Informacion SET Titulo= :Titulo, TipoInformacionId='".$informacion->TipoInformacion->TipoInformacionId."',
        FuenteId=".$informacion->Fuente->FuenteId.", OrigenInformacionId='".$informacion->OrigenInformacion->OrigenInformacionId."', Contenido = :Contenido, Seccion = '".$informacion->Seccion."', Observacion = :Observacion, Hecho = :Hecho
        WHERE InformacionId=".$informacion->InformacionId;
    }

    try
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Titulo", $informacion->Titulo);
        $stmt->bindParam("Contenido", $informacion->Contenido);
        $stmt->bindParam("Observacion", $informacion->Observacion);
				$stmt->bindParam("Hecho", $informacion->Hecho);

        $stmt->execute();
    }
    catch(PDOException $e)
    {
        echo '[{"Estatus": "Fallido"}]';
        echo $e;
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

    $sql = "DELETE FROM TemaPorInformacion WHERE InformacionId=".$informacion->InformacionId;
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

    $countTema = count($informacion->Tema);

    if($countTema>0)
    {
        for($k=0; $k<$countTema; $k++)
        {
            if($informacion->Tema[$k]->TemaId == "-1")
            {
                $sql = "INSERT INTO Tema (Nombre) VALUES (:Tema)";

                try
                {
                    $stmt = $db->prepare($sql);

                    $stmt->bindParam("Tema", $informacion->Tema[$k]->Nombre);

                    $stmt->execute();

                    $informacion->Tema[$k]->TemaId = $db->lastInsertId();
                }
                catch(PDOException $e)
                {
                    echo '[{"Estatus": "Fallo"}]';
                    echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }

        $sql = "INSERT INTO TemaPorInformacion (InformacionId, TemaId) VALUES";

        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$informacion->InformacionId.", ".$informacion->Tema[$k]->TemaId."),";
        }

        $sql = rtrim($sql,",");

        try
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
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

    $countEtiqueta = count($informacion->Etiqueta);

    if($countEtiqueta>0)
    {
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($informacion->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";

                try
                {
                    $stmt = $db->prepare($sql);

                    $stmt->bindParam("UsuarioId", $informacion->UsuarioId);
                    $stmt->bindParam("Nombre", $informacion->Etiqueta[$k]->Nombre);

                    $stmt->execute();

                    $informacion->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
                }
                catch(PDOException $e)
                {
                    echo '[{"Estatus": "Fallo"}]';
                    echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }

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

            echo '[{"Estatus": "Exitoso"}, {"Etiqueta":'.json_encode($informacion->Etiqueta).'}, {"Tema":'.json_encode($informacion->Tema).'}]';
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

        echo '[{"Estatus": "Exitoso"}, {"Etiqueta":'.json_encode($informacion->Etiqueta).'}, {"Tema":'.json_encode($informacion->Tema).'}]';
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

function GetEtiquetasInformacion()
{
    global $app;
    global $session_expiration_time;


    $sql = "SELECT e.Nombre, ie.EtiquetaId, ie.InformacionId FROM EtiquetaPorInformacion ie INNER JOIN Etiqueta e ON e.EtiquetaId = ie.EtiquetaId";

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

function GetTemaInformacion()
{
    global $app;
    global $session_expiration_time;


    $sql = "SELECT InformacionId, TemaId, Nombre FROM TemaInformacionVista";

    try
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;

        echo '[ { "Estatus": "Exito"}, {"Tema":'.json_encode($response).'} ]';
    }
    catch(PDOException $e)
    {
        echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

function GetArchivoInformacion($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT Archivo, NombreArchivo, ExtensionArchivo FROM Informacion WHERE InformacionId = '".$id."'";

    try
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);

        $response[0]->Archivo =  base64_encode($response[0]->Archivo);

        $db = null;

        echo '[ { "Estatus": "Exito"}, {"Archivo":'.json_encode($response).'} ]';
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
