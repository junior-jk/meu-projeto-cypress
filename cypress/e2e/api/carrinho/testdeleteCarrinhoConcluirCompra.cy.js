import { faker } from '@faker-js/faker';

describe('Deletar um carrinho', () => { 
    let userIdUsuario;
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
            password: 'Teste@123', // Evita problemas com caracteres especiais
            administrador: 'true'
        };

        // Criar usuário
        cy.api({
            method: 'POST',
            url: '/usuarios',
            body: userData   
        }).then((response) => {
            cy.log(`Resposta criação usuário: ${JSON.stringify(response.body)}`);
            expect(response.status).to.eq(201);
            userIdUsuario = response.body._id;
            emailUsuario = userData.email;
            password = userData.password;

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
            cy.log(`Resposta login: ${JSON.stringify(response.body)}`);
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', 'Login realizado com sucesso');
            token = response.body.authorization;

            // Criar produto 1
            quantidadeProduto1 = faker.number.int({ min: 1, max: 10 }); // Garantindo quantidade suficiente
            return cy.api({
                method: 'POST',
                url: '/produtos',
                headers: { Authorization: token },
                body: {
                    nome: faker.commerce.productName(),
                    preco: faker.number.int({ min: 1, max: 10 }),
                    descricao: faker.commerce.productDescription(),
                    quantidade: quantidadeProduto1 
                }
            });
        }).then((response) => {
            cy.log(`Resposta criação produto 1: ${JSON.stringify(response.body)}`);
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            produtoCriado = response.body._id;

            // Criar produto 2
            quantidadeProduto2 = faker.number.int({ min: 1, max: 10 });
            return cy.api({
                method: 'POST', 
                url: '/produtos',
                headers: { Authorization: token }, 
                body: {
                    nome: faker.commerce.productName(),
                    preco: faker.number.int({ min: 1, max: 10 }),
                    descricao: faker.commerce.productDescription(),
                    quantidade: quantidadeProduto2
                }
            });
        }).then((response) => {
            cy.log(`Resposta criação produto 2: ${JSON.stringify(response.body)}`);
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            produtoCriado2 = response.body._id;

            // Adicionar produtos ao carrinho
            return cy.api({
                method: 'POST', 
                url: '/carrinhos',
                headers: { Authorization: token },     
                body: {
                    produtos: [         
                        { idProduto: produtoCriado, quantidade: quantidadeProduto1  }, // Garantindo estoque suficiente
                        { idProduto: produtoCriado2, quantidade: quantidadeProduto2 }
                    ]
                }    
            });
        }).then((response) => {
            cy.log(`Resposta adicionar ao carrinho: ${JSON.stringify(response.body)}`);
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            cy.log('Produtos adicionados ao carrinho');
        });
    });

    // ✅ TESTE PRINCIPAL
    it('Deve deletar um carrinho', () => {
        cy.api({
            method: 'DELETE',
            url: '/carrinhos/concluir-compra',
            headers: { Authorization: token }
        }).then((response) => {
            cy.log(`Resposta DELETE carrinho: ${JSON.stringify(response.body)}`);
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', 'Registro excluído com sucesso');
            
            cy.log('Registro excluído com sucesso');
        });         
    });
});
