import express from 'express';
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', socket => {
  console.log('WS connected......');
  socket.on('orderChangeStatus', ({ status, user, order }) => {
    io.sockets.emit(`order_${user}`, {
      status,
      order,
    });
  });
  // socket.on('installmentChangeStatus', ({ status, user, installment }) => {
  // 	io.sockets.emit(`installment_${user}`, {
  // 		status,
  // 		installment,
  // 	});
  // });
  // socket.on('installmentMoney', ({ email, installment }) => {
  // 	var installments = [];
  // 	installments.push(installment);
  // 	io.sockets.emit('newInstallmentMoney', {
  // 		newInstallments: installments.length,
  // 		email,
  // 	});=-=-
  // });
  socket.on('order', ({ email, order }) => {
    const orders = [];
    orders.push(order);
    io.sockets.emit('newOrder', {
      newOrders: orders.length,
      email,
    });
  });
  // socket.on('installment', ({ email, installment }) => {
  // 	var installments = [];
  // 	installments.push(installment);
  // 	io.sockets.emit('newInstallment', {
  // 		newInstallments: installments.length,
  // 		email,
  // 	});
  // });
});

const PORT = 8081;
app.use(cors());
app.listen(PORT, () => {
  console.log('Socket runing in port: ' + PORT);
});
