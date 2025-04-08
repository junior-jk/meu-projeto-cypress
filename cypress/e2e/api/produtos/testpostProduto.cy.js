import { faker } from '@faker-js/faker';

describe('Cadastrar Produto', () => {
    let userIdUsuario; 
    let nomeUsuario; 
    let emailUsuario; 
    let password;
    let token;
    let produtoCriado;

    before(() => {
        // Criar usuário administrador
        const usuario = {
            nome: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            administrador: 'true'
        };

        cy.api({
            method: 'POST',
            url: '/usuarios',
            body: usuario
        }).then((response) => {
            expect(response.status).to.eq(201);
            userIdUsuario = response.body._id;
            nomeUsuario = usuario.nome;
            emailUsuario = usuario.email;
            password = usuario.password;
            cy.log(`Usuário criado: ${nomeUsuario} - ID: ${userIdUsuario}`);

            // Fazer login para obter o token
            cy.api({
                method: 'POST',
                url: '/login',
                body: { email: emailUsuario, password: password }
            });
        }).then((response) => {
            expect(response.status).to.eq(200);
            token = response.body.authorization;
            cy.log(`Token gerado: ${token}`);
        });
    });

    it('POST - Cadastrar um novo produto', () => {
        const produto = {
            nome: faker.commerce.productName(),
            preco: faker.number.int({ min: 10, max: 1000 }),
            descricao: faker.commerce.productDescription(),
            quantidade: faker.number.int({ min: 1, max: 100 })
        };

        cy.api({
            method: 'POST',
            url: '/produtos',
            headers: { Authorization: `${token}` }, // Formato correto do token
            body: produto
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            expect(response.body).to.have.property('_id');

            produtoCriado = response.body;
            cy.log(`Produto criado: ${produto.nome} - ID: ${produtoCriado._id}`);
        });
    });
});
