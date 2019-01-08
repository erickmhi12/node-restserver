const express = require('express');


const { verificaToken, verificaAdmin_Role } = require('../middlewares/autentificacion');

let app = express();

let Producto = require('../models/producto');

//==========================================
//Obtener todos los productos
//==========================================

app.get('/productos', verificaToken, (req, res) => {
    //trae todos los productos
    //populate: usuario categoria
    //paginado

    //Obtiene el limite para sacar la paginacion
    let limite = req.query.limite || 10;
    //Convierte la informacion en entero
    limite = Number(limite);

    // obtiene desde donde obtiene los datos para la paginacion
    let desde = req.query.desde || 0;
    //Convierte la informacion en entero
    desde = Number(desde);


    Producto.find({ disponible: true })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .sort('producto:nombre')
        .skip(desde)
        .limit(limite)
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            })
        })
})

//==========================================
//Obtener todos los productos por id
//==========================================

app.get('/productos/:id', verificaToken, (req, res) => {
    //trae todos los productos por ID
    //populate: usuario categoria

    let id = req.params.id;
    let body = req.body;


    Producto.findById(id, body)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoBD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoBD) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID del producto no existe'
                    }
                })
            }

            res.json({
                ok: true,
                producto: productoBD
            })
        })
})


//==========================================
//Buscar productos 
//==========================================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        })
})

//==========================================
//Crear un  productos 
//==========================================

app.post('/productos', verificaToken, (req, res) => {
    //Grabar el usuario
    //Grabar la categoria del listado
    let body = req.body;


    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    })

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });

})


//==========================================
//Actualizar un  productos 
//==========================================

app.put('/productos/:id', verificaToken, (req, res) => {
    //Grabar el usuario
    //Grabar la categoria del listado.

    let id = req.params.id;
    let body = req.body;

    let modifProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria
    }

    Producto.findByIdAndUpdate(id, modifProducto, { new: true, runValidators: true })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID del producto no existe'
                    }
                })
            }
            res.json({
                ok: true,
                producto: productoDB
            })
        })
})

//==========================================
//Delete  un  productos 
//==========================================

app.delete('/productos/:id', verificaToken, (req, res) => {
    //Grabar el usuario
    //Grabar la categoria del listado

    let id = req.params.id;

    let deleteProducto = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, deleteProducto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID del producto no existe'
                }
            })
        }

        res.json({
            ok: true,
            producto: 'Producto eliminado'
        })
    })
})




module.exports = app;