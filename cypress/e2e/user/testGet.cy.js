import { faker } from '@faker-js/faker';

describe('Buscar todos Usuario', () => {

let userIdUsuario; 
let nomeUsuario; 
let emailUsuario; 
let password;
let token;

    beforeEach(() => {
    });
    
    it('GET - Deve buscar os dados do usuario', () => {
        cy.api({
            method: 'GET',
            url: '/usuarios',            
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.usuarios).to.have.an('array');
        });
    });

    it('GET - Deve buscar usuario pelo id', () => {  // pre requisito para testar o get pelo id
        
        const userId = {
            nome: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            administrador: 'true'
        }

        cy.api({
            method: 'Post',
            url: '/usuarios', // Usando o _id do usuário criado
            body: userId
        }).then((response) => {
            nomeUsuario = userId.nome;
            emailUsuario = userId.email;
            password = userId.password;
            userIdUsuario = response.body._id;

        cy.api({
            method: 'Post',
            url: '/login', // Usando o _id do usuário criado
            body: {email: emailUsuario, 
                password: password, }, 
                }).then((response) => {
                    token = response.body.authorization;
                    
        cy.api({
            method: 'GET',
            url: `/usuarios/${userIdUsuario}`, // Usando o _id do usuário criado
            headers: {
                Authorization: token // Enviando o token de autenticação
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.nome).to.equal(nomeUsuario);
            expect(response.body.email).to.equal(emailUsuario);
                });
            });
        });
    });

    it('GET - Deve falhar id inexistente', () => {
        cy.api({
            method: 'GET',
            url: '/usuarios/12345', // Usando o _id do usuário criado
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq('Usuário não encontrado');
        });
    })
});
