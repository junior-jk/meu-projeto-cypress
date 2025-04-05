import { faker } from '@faker-js/faker';

describe('Testes de Login na API ServeRest', () => {
  let email, password, userId, token;

  before(() => {
    // Gerando dados aleatórios
    email = faker.internet.email();
    password = faker.internet.password();

    // Criando o usuário antes de tentar o login
    cy.api({
      method: 'POST',
      url: '/usuarios',
      body: {
        nome: faker.person.fullName(),
        email: email,
        password: password,
        administrador: 'true'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.message).to.eq('Cadastro realizado com sucesso');
      expect(response.body._id).to.exist;

      // Armazenando o _id do usuário
      userId = response.body._id;
    });
  });

  it('Deve fazer login com sucesso', () => {
    cy.api({
      method: 'POST',
      url: '/login',
      body: {
        email: email,
        password: password
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('authorization');

      // Salvando o token para uso nos próximos testes
      token = response.body.authorization;
    });
  });

  it('Deve buscar os detalhes do usuário pelo _id', () => {
    cy.api({
      method: 'GET',
      url: `/usuarios/${userId}`, // Usando o _id do usuário criado
      headers: {
        Authorization: token // Enviando o token de autenticação
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('_id', userId);
      expect(response.body).to.have.property('nome');
      expect(response.body).to.have.property('email', email);
    });
  });

  it('Deve atualizar os dados do usuário', () => {
    const novoNome = faker.person.fullName();
    const novoEmail = faker.internet.email();

    cy.api({
      method: 'PUT',
      url: `/usuarios/${userId}`, // Usando o _id do usuário criado
      headers: {
        Authorization: token // Enviando o token de autenticação
      },
      body: {
        nome: novoNome,
        email: novoEmail,
        password: password,
        administrador: 'false' // Alterando a permissão
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.message).to.eq('Registro alterado com sucesso');

    });

    // Verificando se os dados foram realmente atualizados
    cy.api({
      method: 'GET',
      url: `/usuarios/${userId}`,
      headers: {
        Authorization: token
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body._id).to.eq(userId);
      expect(response.body.nome).to.eq(novoNome);
      expect(response.body.email).to.eq(novoEmail);
      expect(response.body.password).to.eq(password); // Validando que a senha não foi alterada
      expect(response.body.administrador).to.eq('false'); // Validando alteração da permissão
    });
  });

  it('Deve excluir o usuário', () => {
    cy.api({
      method: 'DELETE',
      url: `/usuarios/${userId}`,
      headers: {
        Authorization: token
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.message).to.eq('Registro excluído com sucesso');
    });
  });
});
