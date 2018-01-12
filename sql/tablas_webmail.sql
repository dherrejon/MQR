--
-- Estructura de tabla para la tabla `Usuario`
--

-- CREATE TABLE IF NOT EXISTS `Usuario` (
--   `UsuarioId` int(11) NOT NULL,
--   `Nombre` varchar(250) NOT NULL,
--   `Apellidos` varchar(250) NOT NULL,
--   `NombreUsuario` varchar(120) NOT NULL,
--   `Correo` varchar(120) NOT NULL,
--   `Password` varchar(32) NOT NULL,
--   `Activo` tinyint(1) NOT NULL,
--   `EtiquetaMsn` tinyint(4) NOT NULL DEFAULT '0'
-- ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `Usuario`
--

-- INSERT INTO `Usuario` (`UsuarioId`, `Nombre`, `Apellidos`, `NombreUsuario`, `Correo`, `Password`, `Activo`, `EtiquetaMsn`) VALUES
-- (1, 'Javier', 'Santoyo Morales', 'Javi', 'engsantoyo@gmail.com', '202cb962ac59075b964b07152d234b70', 1, 0);

-- --------------------------------------------------------


-- -----------------------------------------------------
-- Table `Correo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Correo` (
  `CorreoId` INT NOT NULL AUTO_INCREMENT,
  `UsuarioId` INT NOT NULL,
  `Nombre` VARBINARY(368) COMMENT 'str_length=360',
  `Cuenta` VARBINARY(80) NOT NULL COMMENT 'str_lenght=64',
  `Servidor` VARBINARY(48) NOT NULL COMMENT 'str_length=32',
  `IMAP` VARCHAR(512),
  `PuertoIMAP` VARCHAR(32),
  `SMTP` VARCHAR(512),
  `PuertoSMTP` VARCHAR(32),
  `Password` VARBINARY(144) COMMENT 'str_length=128',
  `TokenAcceso` VARBINARY(2064) COMMENT 'str_length=2048',
  `TokenRenovacion` VARBINARY(528) COMMENT 'str_length=512',
  `TipoToken` VARBINARY(128) COMMENT 'str_length=120',
  `Expiracion` INT,
  `TiempoRegistro` INT,
  `TiempoComprobacion` INT,
  PRIMARY KEY (`CorreoId`),
  INDEX `fk_correo_usuarioId_idx` (`UsuarioId` ASC),
  CONSTRAINT `fk_correo_UsuarioId`
    FOREIGN KEY (`UsuarioId`)
    REFERENCES `Usuario` (`UsuarioId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `Contactos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Contacto` (
  `ContactoId` INT NOT NULL AUTO_INCREMENT,
  `CorreoId` INT NOT NULL,
  `CorreoElectronico` VARBINARY(64) NOT NULL COMMENT 'str_lenght=60',
  PRIMARY KEY (`ContactoId`),
  INDEX `fk_contacto_correoId_idx` (`CorreoId` ASC),
  CONSTRAINT `fk_contacto_CorreoId`
    FOREIGN KEY (`CorreoId`)
    REFERENCES `Correo` (`CorreoId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB DEFAULT CHARSET=utf8;
