const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autentificacion');

let app = express();

let Categoria = require('../models/categoria');

const _ = require('underscore');


//====================================================
//Mostrar todas las categorias
//====================================================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .populate('usuario', 'nombre email')
        .sort('descripcion')
        .exec((err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                categoriaDB
            })
        });
})


//====================================================
//Mostrar todas las categorias por ID
//====================================================
app.get('/categoria/:id', verificaToken, (req, res) => {
    //Categoria.findByID

    let id = req.params.id;
    let body = req.body;

    Categoria.findById(id, body, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Categoria no esta definida'
                }

            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })

    });
});


//====================================================
//Crear nueva categorias
//====================================================
app.post('/categoria', verificaToken, (req, res) => {
    //Regresa la nueva categoria
    //req.usuario._id;

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id

    })

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

})


//====================================================
//Actualizar nombre de la categorias
//====================================================
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id
    let body = req.body

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada en la base de Datos'
                }

            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });
});


//====================================================
//borrar categoria
//====================================================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //Solo se pueda admin puede borrar categorias
    //Validar token

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada en la base de Datos'
                }

            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

})



module.exports = app;