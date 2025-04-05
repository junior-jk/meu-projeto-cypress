import { faker } from '@faker-js/faker';

describe('Cadastrar usuário, fazer login, criar produtos e adicionar ao carrinho', () => {
    let userIdUsuario;
    let nomeUsuario;
    let emailUsuario;
    let password;
    let token;
    let produtoCriado;
    let produtoCriado2;
    let quantidadeProduto1;
    let quantidadeProduto2;

    before(() => {
        const userData = {
            nome: faker.person.fullName(),
            email: faker.internet.email(),
            password: 'Teste@123',  // Evita problemas com caracteres especiais
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
            cy.log(`Usuário criado: ${userIdUsuario} - ${nomeUsuario}`);

            // Login com o usuário criado
            return cy.api({
                method: 'POST',
                url: '/login',
                body: {
                    email: emailUsuario,
                    password: password
                }
            });
        }).then((response) => {
            expect(response.status).to.eq(200);
            token = response.body.authorization;
            cy.log(`Token gerado: ${token}`);

            // Criar produto 1
            quantidadeProduto1 = faker.number.int({ min: 1, max: 10 }); // Garantindo quantidade suficiente
            return cy.api({
                method: 'POST',
                url: '/produtos',
                headers: { Authorization: token },
                body: {
                    nome: faker.commerce.productName(),
                    preco: faker.number.int({ min: 10, max: 100 }),
                    descricao: faker.commerce.productDescription(),
                    quantidade: quantidadeProduto1
                }
            });
        }).then((response) => {
            expect(response.status).to.eq(201);
            produtoCriado = response.body._id;
            cy.log(`Produto 1 criado: ${produtoCriado}`);

            // Criar produto 2
            quantidadeProduto2 = faker.number.int({ min: 1, max: 10 });
            return cy.api({
                method: 'POST',
                url: '/produtos',
                headers: { Authorization: token },
                body: {
                    nome: faker.commerce.productName(),
                    preco: faker.number.int({ min: 10, max: 100 }),
                    descricao: faker.commerce.productDescription(),
                    quantidade: quantidadeProduto2
                }
            });
        }).then((response) => {
            expect(response.status).to.eq(201);
            produtoCriado2 = response.body._id;
            cy.log(`Produto 2 criado: ${produtoCriado2}`);

            // Adicionar produtos ao carrinho
            return cy.api({
                method: 'POST',
                url: '/carrinhos',
                headers: { Authorization: token },
                body: {
                    produtos: [
                        { idProduto: produtoCriado, quantidade: quantidadeProduto1 },
                        { idProduto: produtoCriado2, quantidade: quantidadeProduto2 }
                    ]
                }
            });
        }).then((response) => {
            expect(response.status).to.eq(201);
            cy.log('Produtos adicionados ao carrinho');
        });
    });

    // ✅ TESTE PRINCIPAL
    it('Deve garantir que os produtos foram adicionados ao carrinho', () => {
        cy.api({
            method: 'GET',
            url: '/carrinhos',
            headers: { Authorization: token },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('carrinhos');
            expect(response.body.carrinhos).to.be.an('array').and.not.be.empty;
            cy.log(`Carrinho recuperado com sucesso: ${JSON.stringify(response.body.carrinhos)}`);
        });
    });
});
