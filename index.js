import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

// criar uma instância (objeto) do express
const app = express();

// api publica - qualquer origem pode acessar
app.use(cors());

// permite passar json no corpo da requisição (POST e PUT)
app.use(express.json());

// endpoint de teste
app.get("/", (request, response) => {
  response.send("Olá, express!");
});

const carros = [];

app.post("/carros", (request, response) => {
  const { modelo, marca, ano, cor, preco } = request.body;

  if (!modelo || !marca || !ano) {
    return response.status(400).json({
      message: "Modelo, marca e ano são obrigatórios.",
    });
  }

  const novoCarro = {
    id: uuidv4(),
    modelo,
    marca,
    ano,
    cor,
    preco,
  };

  carros.push(novoCarro);

  return response.status(201).json({
    message: "Carro adicionado com sucesso!",
    carro: novoCarro,
  });
});

// app.get("/carros", (request, response) => {
//   if (carros.length === 0) {
//     return response.status(404).json({
//       message: "Nenhum carro encontrado!",
//     });
//   }

//   return response.json(carros);
// });

// app.get("/carros/:marca", (request, response) => {
//   const carro = carros.find((carro) => carro.marca === marca);

//   if (!carro) {
//     return response.status(404).json({
//       message: "Carro/marca não encontrada!",
//     });
//   }

//   return response.status(200).json({
//     message: "Carro/marca encontrado(s) com sucesso!",
//     carro,
//   });
// });

app.get("/carros", (request, response) => {
  const { marca } = request.query;

  const veiculosFiltrados = carros.filter(
    (carro) => carro.marca.toLowerCase() === marca.toLocaleLowerCase()
  );

  if (veiculosFiltrados.length === 0) {
    return response.status(404).json({
      message: "Nenhum carro encontrado.",
    });
  }

  return response.status(200).json(veiculosFiltrados);
});

app.put("/carros/:id", (request, response) => {
  const { id } = request.params; // pegando paremetros da rota
  const { cor, preco } = request.body; // pegando o corpo da requisição

  const carro = carros.find((carro) => carro.id === id);

  if (!carro) {
    return response.status(404).json({
      message: "Veículo não encontrado!",
    });
  }

  carro.cor = cor;
  carro.preco = preco;

  return response.status(200).json({
    message: "Veículo atualizado com sucesso!",
    carro: carro,
  });
});

app.delete("/carros/:id", (request, response) => {
  const { id } = request.params;

  const carroIndex = carros.findIndex((carro) => carro.id === id);

  if (carroIndex === -1) {
    return response.status(404).json({
      message: "Veículo não encontrado.",
    });
  }

  const [deletedCarro] = carros.splice(carroIndex, 1);

  return response.status(200).json({
    message: "Veículo deletado com sucesso!",
    carro: deletedCarro,
  });
});

const adminUsers = [];

app.post("/signup", async (request, response) => {
  try {
    const { username, email, password } = request.body;

    if (username === "" || email === "" || password === "") {
      return response.status(400).json({
        message: "Username, email ou password não podem ser vazios.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o salt -> sequencia aleatória

    const existingUser = adminUsers.find((user) => user.username === username);

    if (existingUser) {
      return response.status(400).json({
        message: "Usuário já existe.",
      });
    }

    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
    };

    adminUsers.push(newUser);

    return response.status(201).json({
      message: "Admin cadastrado com sucesso.",
      newUser,
    });
  } catch (error) {
    response.status(500).json({
      message: "Erro ao registrar admin",
      erro: error,
    });
  }
});

app.post("/login", async (request, response) => {
  try {
    const { email, password } = request.body;

    const user = adminUsers.find((user) => user.email === email);

    if (!user) {
      return response.status(404).json({
        message: "Admin não encontrado.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return response.status(400).json({
        message: "Credenciais inválidas.",
      });
    }

    return response.status(200).json({
      message: "Login feito com sucesso.",
    });
  } catch (error) {
    response.status(500).json({
      message: "Erro ao fazer login",
      erro: error,
    });
  }
});

app.listen(3002, () => {
  console.log("Servidor rodando na porta 3002!");
});
