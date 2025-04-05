import { faker } from '@faker-js/faker';

describe('Cadastrar Usuario, fazer login, criar produtos e buscar carrinho', () => {
    let userIdUsuario;
    let nomeUsuario;
    let emailUsuario;
    let password;
    let token;
    let produtoCriado;
    let produtoCriado2;

    it('Deve cadastrar um usuario, logar, criar produtos e buscar carrinho', () => {
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
            cy.log(`Usuário criado: ${userIdUsuario} - ${nomeUsuario}`);

            // Login com o usuário criado
            cy.api({
                method: 'POST',
                url: '/login',
                body: {
                    email: emailUsuario,
                    password: password
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', 'Login realizado com sucesso');
                token = response.body.authorization;
                cy.log(`Usuario logado: ${userIdUsuario} - ${nomeUsuario}`);

                // Criar produto 1
                cy.api({
                    method: 'POST',
                    url: '/produtos',
                    headers: { Authorization: `${token}` },
                    body: {
                        nome: faker.commerce.productName(),
                        preco: faker.number.int({ min: 10, max: 100 }),
                        descricao: faker.commerce.productDescription(),
                        quantidade: faker.number.int({ min: 1, max: 10 }),
                    }
                }).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
                    produtoCriado = response.body._id;
                    cy.log(`Produto criado: ${produtoCriado}`);

                    // Criar produto 2
                    cy.api({
                        method: 'POST',
                        url: '/produtos',
                        headers: { Authorization: `${token}` },
                        body: {
                            nome: faker.commerce.productName(),
                            preco: faker.number.int({ min: 10, max: 100 }),
                            descricao: faker.commerce.productDescription(),
                            quantidade: faker.number.int({ min: 1, max: 10 }),
                        }
                    }).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
                        produtoCriado2 = response.body._id;
                        cy.log(`Produto criado: ${produtoCriado2}`);

                        // Adicionar produtos ao carrinho
                        cy.api({
                            method: 'POST',
                            url: '/carrinhos',
                            headers: { Authorization: `${token}` },
                            body: {
                                produtos: [
                                    { idProduto: produtoCriado, quantidade: 1 },
                                    { idProduto: produtoCriado2, quantidade: 2 }
                                ]
                            }
                        }).then((response) => {
                            expect(response.status).to.eq(201);
                            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
                            cy.log('Produtos adicionados ao carrinho');

                            // Buscar carrinho
                            cy.api({
                                method: 'GET',
                                url: '/carrinhos',
                                headers: { Authorization: `${token}` },
                            }).then((response) => {
                                expect(response.status).to.eq(200);
                                expect(response.body).to.have.property('carrinhos');
                                expect(response.body.carrinhos).to.be.an('array').and.not.be.empty;
                                cy.log(`Carrinho recuperado com sucesso: ${JSON.stringify(response.body.carrinhos)}`);
                            });
                        });
                    });
                });
            });
        });
    });
});
