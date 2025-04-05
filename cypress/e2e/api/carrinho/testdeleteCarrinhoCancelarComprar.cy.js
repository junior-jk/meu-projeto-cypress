import { faker } from '@faker-js/faker';

describe('Deletar carrinho', () => {
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
            password: 'Teste@123', // Senha fixa para evitar caracteres especiais        
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
            emailUsuario = userData.email;
            password = userData.password;
            nomeUsuario = userData.nome;
            cy.log(`Usuário criado: ${userIdUsuario}`);

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
                    quantidade: quantidadeProduto1,  
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
                    preco: faker.number.int({ min: 1, max: 10 }),
                    descricao: faker.commerce.productDescription(),
                    quantidade: quantidadeProduto2,
                }
            });
        }).then((response) => {
            expect(response.status).to.eq(201);
            produtoCriado2 = response.body._id;
            cy.log(`Produto 2 criado: ${produtoCriado2}`);

            // Adicionar produtos ao carrinho com quantidades dentro do estoque
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
            expect(response.status).to.eq(201);
            cy.log('Produtos adicionados ao carrinho');
        });
    });

    it('Deve deletar um carrinho', () => {
        cy.api({
            method: 'DELETE',
            url: '/carrinhos/cancelar-compra',
            headers: { Authorization: token }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', 'Registro excluído com sucesso. Estoque dos produtos reabastecido');
            cy.log('Registro excluído com sucesso. Estoque dos produtos reabastecidos.');                                            
        });
    });
});
