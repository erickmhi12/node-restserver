const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');


const fs = require('fs');

const path = require('path');

app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se seleccionado ningun archivo'
            }
        });
    };

    //Valida Tipo de archivos
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'Los tipos permitidos son : ' + tiposValidos.join(', '),

            }
        })
    }



    let archivoNormal = req.files.archivo;

    let nombreCortado = archivoNormal.name.split('.');

    let extension = nombreCortado[nombreCortado.length - 1];



    //Extensiones permitidas

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'La extension del archivo no permitido las extensiones permitidas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        })

    }
    //cambiar nombre del archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds() }.${extension}`;

    archivoNormal.mv(`uploads/${tipo}/${ nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        //Aqui, imagen cargada

        // res.json({
        //     ok: true,
        //     message: 'Imagen subida correctamente'
        // })
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    })

});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            //Eliminar la imagen subida debido a un error
            borraArchivo(nombreArchivo, 'usuarios');

            res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            //Eliminar la imagen subida debido a que el usuario no existe
            borraArchivo(nombreArchivo, 'usuarios');

            res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo(usuarioDB, 'usuarios');

        usuarioDB.img = nombreArchivo;


        //guardar modificaciones de usuarios
        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })
    });
}


function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen.img }`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }

}



function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos')
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos')
            res.status(400).json({
                ok: false,
                err: {
                    message: 'El id del producto no existe'
                }
            })
        }
        borraArchivo(productoDB, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        })
    });



}


module.exports = app;