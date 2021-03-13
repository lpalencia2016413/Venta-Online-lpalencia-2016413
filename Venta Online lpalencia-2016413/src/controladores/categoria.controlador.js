'use strict'

//IMPORTACIONES
var Categoria = require("../modelos/categoria.model");
var Factura = require("../modelos/factura.model");
var Producto = require("../modelos/producto.model");
var Usuario = require("../modelos/usuario.model");

var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");

function defaultt(req, res) {
    var categoriaModel = Categoria();
    categoriaModel.nombre = "Juegos"
    Categoria.find({
        nombre: "Juegos"
    }).exec((err, CategoriaEncontrada) => {
        if (err) return console.log({ mensaje: "Error al crear la categoria" });
        if (CategoriaEncontrada.length >= 1) {
            return console.log("La categoria fue creada");
        } else {
            categoriaModel.save((err, CategoriaGuardada) => {
                if (err) return console.log({ mensaje: "Error en la peticion" });
                if (CategoriaGuardada) {
                    console.log("Categoria lista");
                } else {
                    console.log({ mensaje: "La categoria no esta lista" });
                }
            })
        }
    })
}

function agregarCategoria(req, res) {
    var categoriaModel = new Categoria();
    var params = req.body;
    if (req.user.rol == "ROL_ADMIN") {
        if (params.nombre) {
            categoriaModel.nombre = params.nombre;
            Categoria.find({ nombre: categoriaModel.nombre }).exec((err, CategoriaEncontrada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (CategoriaEncontrada && CategoriaEncontrada.length >= 1) {
                    return res.status(500).send({ mensaje: 'La categoria ya existe' });
                } else {
                    categoriaModel.save((err, CategoriaGuardada) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar categoria' });
                        if (CategoriaGuardada) {
                            res.status(200).send({ CategoriaGuardada })
                        } else {
                            res.status(404).send({ mensaje: 'No se pudo registrar la categoria' })
                        }
                    })
                }
            })

        }
    } else {
        return res.status(500).send({ mensaje: 'Los clientes no pueden agregar categorias' });
    }
}

function eliminarCategoria(req, res) {
    var idCategoria = req.params.id;
    var params = req.body;
    if (req.user.rol != "ROL_ADMIN") {
        return res.status(500).send({ mensaje: "Los clientes no pueden eliminar categoria" });
    }

    if (idCategoria == "6045877ce197982404d6520a") {
        return res.status(500).send({ mensaje: "No se puede borrar esta categoria" });
    }


    Categoria.findByIdAndDelete(idCategoria, (err, usuarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!usuarioEliminado) return res.status(500).send({ mensaje: "No se pudo Eliminar la categoria" });
        return res.status(200).send({ mensaje: "Se elimino la categoria" });
    })

    Producto.updateMany({ idCategoria: idCategoria }, params, { new: true }, (err, productoActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoActualizado) return res.status(500).send({ mensaje: 'No se pudo editar el producto' });
    })
}

function editarCategoria(req, res) {
    var idCategoria = req.params.id;
    var params = req.body;

    Categoria.find({ nombre: params.nombre }).exec((err, CategoriaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (CategoriaEncontrada && CategoriaEncontrada.length >= 1) {
            return res.status(500).send({ mensaje: 'Esta categoria ya existe' });
        }
        if (req.user.rol == "ROL_ADMIN") {
            Categoria.findByIdAndUpdate(idCategoria, params, { new: true }, (err, CategoriaActualizada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!CategoriaActualizada) return res.status(500).send({ mensaje: 'No se puso editar la categoria' });
                return res.status(200).send({ CategoriaActualizada })
            })
        } else {
            return res.status(500).send({ mensaje: 'Los clientes no pueden editar categorias' });
        }
    })
}

function obtenerCategorias(req, res) {
    Categoria.find().exec((err, categorias) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!categorias) return res.status(500).send({ mensaje: 'Error en la consutla de Usuarios o no tiene datos' });
        return res.status(200).send({ categorias });
    })
}


module.exports = {
    defaultt,
    agregarCategoria,
    eliminarCategoria,
    editarCategoria,
    obtenerCategorias
}