import { faker } from "@faker-js/faker";

describe('Token ausente ou invalido', () => {  
    let token;

    it('Deve retornar erro ao usar token inválido na criação de produto', () => {
      const produto = {
        nome: faker.commerce.productName(),
        preco: faker.number.int(),
        descricao: faker.commerce.productDescription(),
        quantidade: faker.number.int()
      };
  
      cy.api({
        method: 'POST',
        url: '/produtos',
        body: produto,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
      });
   });
});