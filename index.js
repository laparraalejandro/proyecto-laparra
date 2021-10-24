const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Contenedor = require('./Contenedor');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use( express.json() );
app.use( express.urlencoded( { extended: true }) );

app.use( express.static('public') );

app.set('view engine', 'ejs');

const port = 8080;
const productosContenedor = new Contenedor('./data/productos.json');


io.on('connection', async socket => {
    console.log(`¡Nuevo cliente conectado! socketid: ${socket.id}`);

    socket.on('new-product',async product => {
      await productosContenedor.save(product);
      const products = await productosContenedor.getAll();

      io.sockets.emit('products', products);
    });
});

app.get('/lista-productos', async (req, res) => {
  const lista = await productosContenedor.getAll();
  res.render('../views/pages/lista-productos', {
    message: 'success',
    data: lista
  });
})

app.get('/form', async (req, res) => {
 
  res.render('../views/pages/form');
})

app.post('/api/products', async (req, res) => {
  
  const nuevoProducto = req.body;

  const idProductoGuardado = await productosContenedor.save(nuevoProducto);

    res.redirect('/lista-productos')

    res.send({
      message: 'Producto guardado',
      data: {
        ...nuevoProducto,
        id: idProductoGuardado
      }
  });

})

const server = httpServer.listen(port, () => 
    console.log(`Servidor abierto en http://localhost:${port}/`)
)

server.on('error', error => console.log('Error en servidor:', error));