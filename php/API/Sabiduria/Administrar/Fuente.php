<?php
	
function GetFuente()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT FuenteId, Nombre, NombreTipoFuente, TipoFuenteId, Frase, Posicion, Nota FROM FuenteVista";

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

function AgregarFuente()
{
    $request = \Slim\Slim::getInstance()->request();
    $fuente = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Fuente (TipoFuenteId, Nombre, Frase, Posicion, Nota) 
            VALUES( :TipoFuenteId, :Nombre, :Frase, :Posicion, :Nota)";

    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("TipoFuenteId", $fuente->TipoFuente->TipoFuenteId);
        $stmt->bindParam("Nombre", $fuente->Nombre);
        $stmt->bindParam("Frase", $fuente->Frase);
        $stmt->bindParam("Posicion", $fuente->Posicion);
        $stmt->bindParam("Nota", $fuente->Nota);

        $stmt->execute();
        $fuenteId = $db->lastInsertId();
        

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $countAutor = count($fuente->Autor);
    
    if($countAutor>0)  
    {
        $sql = "INSERT INTO FuentePorAutor (FuenteId, AutorId) VALUES";
        
        for($k=0; $k<$countAutor; $k++)
        {
            $sql .= " (".$fuenteId.", ".$fuente->Autor[$k]->AutorId."),";
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
    
    $countEtiqueta = count($fuente->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        $sql = "INSERT INTO FuentePorEtiqueta (FuenteId, EtiquetaId) VALUES";
        
        for($k=0; $k<$countEtiqueta; $k++)
        {
            $sql .= " (".$fuenteId.", ".$fuente->Etiqueta[$k]->EtiquetaId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();

            $db->commit();
            $db = null; 

            echo '[{"Estatus": "Exitoso"}, {"Id": "'.$fuenteId.'"}]';
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

        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$fuenteId.'"}]';
    }
}

function EditarFuente()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $fuente = json_decode($request->getBody());
   
    $sql = "UPDATE Fuente SET Nombre='".$fuente->Nombre."', TipoFuenteId='".$fuente->TipoFuente->TipoFuenteId."', Frase = '".$fuente->Frase."', 
    Posicion = '".$fuente->Posicion."', Nota = '".$fuente->Nota."' WHERE FuenteId=".$fuente->FuenteId;
    
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
    
    $sql = "DELETE FROM FuentePorAutor WHERE FuenteId=".$fuente->FuenteId;
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
    
    $sql = "DELETE FROM FuentePorEtiqueta WHERE FuenteId=".$fuente->FuenteId;
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
    
    $countAutor = count($fuente->Autor);
    
    if($countAutor>0)  
    {
        $sql = "INSERT INTO FuentePorAutor (FuenteId, AutorId) VALUES";
        
        for($k=0; $k<$countAutor; $k++)
        {
            $sql .= " (".$fuente->FuenteId.", ".$fuente->Autor[$k]->AutorId."),";
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
    
    $countEtiqueta = count($fuente->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        $sql = "INSERT INTO FuentePorEtiqueta (FuenteId, EtiquetaId) VALUES";
        
        for($k=0; $k<$countEtiqueta; $k++)
        {
            $sql .= " (".$fuente->FuenteId.", ".$fuente->Etiqueta[$k]->EtiquetaId."),";
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


/*------------------------------------- Relaciones de la fuente --------------------------------------------*/
function GetFuenteAutor($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM AutorVista a, FuentePorAutor fa 
    WHERE fa.AutorId = a.AutorId AND fa.FuenteId = ".$id;

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

function GetFuenteEtiqueta()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT Nombre, EtiquetaId, FuenteId FROM FuenteEtiquetaVista";

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

function GetAutoresFuente()
{
    global $app;
    global $session_expiration_time;

    $sql = "SELECT * FROM FuenteAutorVista";

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        echo '[ { "Estatus": "Exito"}, {"Autor":'.json_encode($response).'} ]'; 
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
