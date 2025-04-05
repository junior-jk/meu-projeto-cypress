/// <reference types="cypress" />
import { faker } from '@faker-js/faker';

describe('Testes de API - ServRest', () => {
    let userIdUsuario;
    let nomeUsuario;
    let emailUsuario;
    let password;
    let token;
    let produtoId;

    before(() => {
        // Criar usuário
        const usuario = {
            nome: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            administrador: 'true'
        };

        cy.api('POST', '/usuarios', usuario)
        .then((response) => {
            expect(response.status).to.eq(201);
            userIdUsuario = response.body._id;
            nomeUsuario = usuario.nome;
            emailUsuario = usuario.email;
            password = usuario.password;
        });
    });

    beforeEach(() => {
        
        // Fazer login para obter o token
        cy.api({
            method: 'POST',
            url: '/login',           
            body: ({
                email: emailUsuario,
                password: password
            }),
            }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq('Login realizado com sucesso'); 

            token = response.body.authorization;
        });
    });

    it('POST - Deve cadastrar um novo produto', () => {
        const produto = {
            nome: faker.commerce.productName(),
            preco: faker.number.int(),
            descricao: faker.commerce.productDescription(),
            quantidade: faker.number.int(),
        };

        cy.api({
            method: 'POST',
            url: '/produtos',
            headers: { Authorization: `${token}` },
            body: produto
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            expect(response.body).to.have.property('_id');

            produtoId = response.body._id; // Guardar o ID do produto para buscar depois

            cy.log(`Produto criado: ${produto.nome} - ID: ${produtoId}`);
        });
    });

    it('GET - Deve buscar os detalhes do produto pelo ID', () => {
        cy.api({
            method: 'GET',
            url: `/produtos/${produtoId}`,
            headers: { Authorization: `${token}` }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('_id', produtoId);
        });
    });

    it('GET - Deve falhar ao buscar o produto pelo ID', () => {
        cy.api({
            method: 'GET',
            url: '/produtos/124556d',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq('Produto não encontrado');
        });
    });

    it('GET - Deve buscar todos os produtos', () => {
        cy.api({
            method: 'GET',
            url: '/produtos'
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.produtos).to.be.an('array');
        });
    });
 });
   
