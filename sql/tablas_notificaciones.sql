-- -----------------------------------------------------
-- Table `Amistad`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Amistad` (
  `AmistadId` INT NOT NULL AUTO_INCREMENT,
  `UsuarioIdRemitente` INT NOT NULL,
  `UsuarioIdDestinatario` INT NOT NULL,
  `Aceptada` INT(1) NOT NULL,
  PRIMARY KEY (`AmistadId`),
  INDEX `fk_amistad_usuarioIdRemitente_idx` (`UsuarioIdRemitente` ASC),
  CONSTRAINT `fk_amistad_UsuarioIdRemitente`
    FOREIGN KEY (`UsuarioIdRemitente`)
    REFERENCES `Usuario` (`UsuarioId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `Notificacion` date("Y-m-d H:i:s");
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Notificacion` (
  `NotificacionId` INT NOT NULL AUTO_INCREMENT,
  `DestinatarioId` INT NOT NULL,
  `ElementoId` INT NOT NULL,
  `NoLeida` INT(1) NOT NULL,
  `NombreRemitente` VARCHAR(500) NOT NULL,
  `Tipo` VARCHAR(120) NOT NULL,
  `Operacion` VARCHAR(120) NOT NULL,
  `Fecha` DATETIME NOT NULL,
  `Mensaje` VARCHAR(250) NOT NULL,
  PRIMARY KEY (`NotificacionId`),
  INDEX `fk_notificacion_destinatarioId_idx` (`DestinatarioId` ASC),
  CONSTRAINT `fk_notificacion_DestinatarioId`
    FOREIGN KEY (`DestinatarioId`)
    REFERENCES `Usuario` (`UsuarioId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- View `VistaSolicitudAmistadEnviada`
-- -----------------------------------------------------
CREATE VIEW `VistaSolicitudAmistadEnviada` AS
SELECT `a`.`AmistadId` AS `SolicitudId`,
`a`.`UsuarioIdRemitente` AS `UsuarioIdRemitente`,
`u`.`Nombre` AS `NombreUsuarioDestinatario`,
`u`.`Apellidos` AS `ApellidosUsuarioDestinatario`,
`u`.`Correo` AS `CorreoDestinatario`,
`a`.`UsuarioIdDestinatario` AS `UsuarioIdDestinatario`,
`a`.`Aceptada` AS `Aceptada`
FROM `Usuario` `u`
JOIN `Amistad` `a`
ON `u`.`UsuarioId` = `a`.`UsuarioIdDestinatario`;


-- -----------------------------------------------------
-- View `VistaSolicitudAmistadRecibida`
-- -----------------------------------------------------
CREATE VIEW `VistaSolicitudAmistadRecibida` AS
SELECT `a`.`AmistadId` AS `SolicitudId`,
`a`.`UsuarioIdRemitente` AS `UsuarioIdRemitente`,
`u`.`Nombre` AS `NombreUsuarioRemitente`,
`u`.`Apellidos` AS `ApellidosUsuarioRemitente`,
`u`.`Correo` AS `CorreoRemitente`,
`a`.`UsuarioIdDestinatario` AS `UsuarioIdDestinatario`,
`a`.`Aceptada` AS `Aceptada`
FROM `Usuario` `u`
JOIN `Amistad` `a`
ON `u`.`UsuarioId` = `a`.`UsuarioIdRemitente`;
