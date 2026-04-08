const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

// 🔴 PONÉ TU ACCESS TOKEN REAL
mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN
});
// =======================
// CREAR PREFERENCIA
// =======================

app.post("/crear-preferencia", async (req, res) => {
  const carrito = req.body;

  try {
    const preference = {
      items: carrito.map(p => ({
        title: p.nombre,
        unit_price: Number(p.precio),
        quantity: p.cantidad || 1
      }))
    };

    const preferenceClient = new Preference(client);

    const response = await preferenceClient.create({
      body: preference
    });

    res.json({ init_point: response.init_point });

  } catch (error) {
    console.log(error);
    res.status(500).send("Error");
  }
});

// =======================
// GUARDAR PEDIDOS
// =======================

app.post("/guardar-pedido", (req, res) => {
  const pedido = req.body;

  let pedidos = [];

  if (fs.existsSync("pedidos.json")) {
    pedidos = JSON.parse(fs.readFileSync("pedidos.json"));
  }

  const nuevoPedido = {
    id: Date.now(), // 🔥 ID único
    ...pedido,
    estado: "pendiente",
    fecha: new Date()
  };

  pedidos.push(nuevoPedido);

  fs.writeFileSync("pedidos.json", JSON.stringify(pedidos, null, 2));

  res.json({ ok: true, pedido: nuevoPedido });
});

// =======================
// WEBHOOK MERCADOPAGO
// =======================

app.post("/webhook", (req, res) => {
  console.log("🔔 Webhook recibido:", req.body);

  // 🔥 ACÁ PODÉS MEJORAR DESPUÉS:
  // - verificar pago real
  // - buscar pedido por ID
  // - cambiar estado a "pagado"

  let pedidos = [];

  if (fs.existsSync("pedidos.json")) {
    pedidos = JSON.parse(fs.readFileSync("pedidos.json"));
  }

  // 🟡 DEMO: marca el último pedido como pagado
  if (pedidos.length > 0) {
    pedidos[pedidos.length - 1].estado = "pagado";
  }

  fs.writeFileSync("pedidos.json", JSON.stringify(pedidos, null, 2));

  res.sendStatus(200);
});

// =======================

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor corriendo");
});