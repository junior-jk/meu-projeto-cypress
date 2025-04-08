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

  it('Não deve permitir deletar produto que está em carrinho', () => {
    cy.api({
      method: 'DELETE',
      url: `/produtos/${produtoId}`,
      headers: { Authorization: token },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.eq('Não é permitido excluir produto que faz parte de carrinho');
      expect(response.body).to.have.property('idCarrinhos');
      expect(response.body.idCarrinhos).to.be.an('array').and.not.be.empty;
      cy.log(`Produtos vinculados ao carrinho: ${JSON.stringify(response.body.idCarrinhos)}`);  
    });
  });
});
