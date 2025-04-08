import { faker } from '@faker-js/faker';

describe('Excluir produto vinculado a carrinho', () => {
  let token;
  let produtoId;

  before(() => {
    // Criar usuário admin
    const usuario = {
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'teste@123',
      administrador: 'true'
    };

    cy.api('POST', 'https://serverest.dev/usuarios', usuario).then(() => {
      // Logar
      cy.api('POST', 'https://serverest.dev/login', {
        email: usuario.email,
        password: usuario.password
      }).then((res) => {
        token = res.body.authorization;

        // Criar produto
        const produto = {
          nome: faker.commerce.productName(),
          preco: 100,
          descricao: 'Produto de teste',
          quantidade: 1
        };

        cy.api({
          method: 'POST',
          url: 'https://serverest.dev/produtos',
          headers: { Authorization: token },
          body: produto
        }).then((resProduto) => {
          produtoId = resProduto.body._id;

          // Criar carrinho com esse produto
          cy.api({
            method: 'POST',
            url: 'https://serverest.dev/carrinhos',
            headers: { Authorization: token },
            body: {
              produtos: [
                {
                  idProduto: produtoId,
                  quantidade: 1
                }
              ]
            }
          });
        });
      });
    });
  });
  
describe('Excluir carrinho', () => {
    it('Delete -Rota exclusiva para administradores', () => {
      cy.api({
        method: 'DELETE',
        url: `/carrinhos/`,
        headers: { Authorization: token },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(405);
        expect(response.body.message).to.eq("Não é possível realizar DELETE em /carrinhos/. Acesse https://serverest.dev para ver as rotas disponíveis e como utilizá-las.");
      });
    });
  });
});
