'use strict'

//IMPORTACIONES
var Categoria = require("../modelos/categoria.model");
var Factura = require("../modelos/factura.model");
var Producto = require("../modelos/producto.model");
var Usuario = require("../modelos/usuario.model");

var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");

function admin(req, res) {
    var usuarioModel = Usuario();
    usuarioModel.nombre = "Administrador"
    usuarioModel.username = "Admin"
    usuarioModel.rol = "ROL_ADMIN"

    Usuario.find({
        nombre: "Administrador"
    }).exec((err, adminoEncontrado) => {
        if (err) return console.log({ mensaje: "Error creando al Administrador" });
        if (adminoEncontrado.length >= 1) {
            return console.log("El Admin fue creado");
        } else {
            bcrypt.hash("123456", null, null, (err, passwordEncriptada) => {
                usuarioModel.password = passwordEncriptada;
                usuarioModel.save((err, usuarioguardado) => {
                    if (err) return console.log({ mensaje: "Error en la peticion" });
                    if (usuarioguardado) {
                        console.log("Admin listo");
                    } else {
                        console.log({ mensaje: "Admin no esta listo" });
                    }
                })
            })
        }
    })
}

function agregarUsuario(req, res) {
    var usuarioModel = new Usuario();
    var params = req.body;

    if (params.nombre && params.password) {
        usuarioModel.nombre = params.nombre;
        usuarioModel.username = params.username;
        usuarioModel.rol = 'ROL_CLIENTE';
        Usuario.find({ username: usuarioModel.username }).exec((err, usuariosEncontrados) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (usuariosEncontrados && usuariosEncontrados.length >= 1) {
                return res.status(500).send({ mensaje: 'Este Usuario ya existe' });
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                    usuarioModel.password = passwordEncriptada;

                    usuarioModel.save((err, usuarioGuardado) => {

                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                        if (usuarioGuardado) {
                            res.status(200).send({ usuarioGuardado })
                        } else {
                            res.status(404).send({ mensaje: 'No se pudo registrar el Usuario' })
                        }
                    })
                })
            }
        })
    }
}

function login(req, res) {
    var params = req.body;

    Usuario.findOne({ username: params.username }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (usuarioEncontrado) {
            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada) => {
                if (err) return res.status(500).send({ mensaje: "Error en la petición" });
                if (passVerificada) {
                    if (params.getToken == "true") {
                        return res.status(200).send({
                            token: jwt.createToken(usuarioEncontrado)
                        });
                    } else {
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({ usuarioEncontrado });
                    }
                } else {
                    return res.status(500).send({ mensaje: "El Usuario no se pudo identificar" });
                }
            })
        } else {
            return res.status(500).send({ mensaje: "Error buscando al Usuario" })
        }
    })
}

function editarUsuario(req, res) {
    var idUsuario = req.user.sub;
    var params = req.body;
    delete params.password;

    Usuario.find({ username: params.username }).exec((err, Encontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (Encontrada && Encontrada.length >= 1) {
            return res.status(500).send({ mensaje: 'El username ya esta en uso' });
        }

        if (req.user.rol != "ROL_ADMIN") {
            Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se a podido editar al Usuario' });
                return res.status(200).send({ usuarioActualizado })
            })
        } else {
            return res.status(500).send({ mensaje: 'No se puede editar un Administrador' });
        }

    })

}

function eliminarUsuario(req, res) {
    var idUsuario = req.user.sub;

    if (req.user.rol === "ROL_ADMIN") {
        return res.status(500).send({ mensaje: "No se puede eliminar un Administrador" });
    }

    Usuario.findByIdAndDelete(idUsuario, (err, usuarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!usuarioEliminado) return res.status(500).send({ mensaje: "No se pudo Eliminar el usuario" });
        return res.status(200).send({ mensaje: "Se elimino el Usuario" });
    })
}

module.exports = {
    admin,
    agregarUsuario,
    login,
    editarUsuario,
    eliminarUsuario
}