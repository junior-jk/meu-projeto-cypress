import { faker } from '@faker-js/faker';

describe('Cadastrar e Atualizar Produto', () => {
    let userIdUsuario;
    let nomeUsuario;
    let emailUsuario;
    let password;
    let token;
    let produtoCriado;

    before(() => {
        const userData = {
            nome: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),  
            administrador: 'true'
        };

        // Criar usuário
        cy.api({
            method: 'POST',
            url: '/usuarios',
            body: userData
        }).then((response) => {
            expect(response.status).to.eq(201);
            userIdUsuario = response.body._id;
            nomeUsuario = userData.nome;
            emailUsuario = userData.email;
            password = userData.password;
            cy.log(`Usuário criado: ${userIdUsuario}`, `${nomeUsuario})`);

            // Login com o usuário criado
            return cy.api({
                method: 'POST',
                url: '/login',
                body: { email: emailUsuario, 
                    password: password }
            });
        }).then((response) => {
            expect(response.status).to.eq(200);
            token = response.body.authorization;
            cy.log(`Token recebido: ${token}`);
        });
    });


    it('POST - Cadastrar um novo produto', () => {
        const produto = {              
        
            nome: faker.commerce.productName(),
            preco: faker.number.int(),
            descricao: faker.commerce.productDescription(),
            quantidade: faker.number.int(),
        };

        cy.api({
            method: 'POST',
            url: '/produtos',
            headers: { Authorization: `${token}` }, // Inclui o token no header
            body: produto
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            expect(response.body).to.have.property('_id');

            produtoCriado = response.body;
            cy.log(`Produto criado: ${produto.nome} - ID: ${produtoCriado._id}`);
            });
        });
    it('DELETE - Deve deletar um produto pelo ID', () => {
        cy.api({
            method: 'DELETE',
            url: `/produtos/${produtoCriado._id}`,
            headers: { Authorization: `${token}` },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq('Registro excluído com sucesso');    
         });
    });
    it('GET - Deve buscar os detalhes do produto pelo ID', () => {
        cy.api({
            method: 'GET',
            url: `/produtos/${produtoCriado._id}`,
            headers: { Authorization: `${token}` },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq('Produto não encontrado');
        });
    })
});
