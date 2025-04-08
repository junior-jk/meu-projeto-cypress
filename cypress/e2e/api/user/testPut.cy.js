import { faker } from '@faker-js/faker';

describe('Cadastrar, logar e atualizar um usuário', () => {
    let userIdUsuario;
    let token;
    let emailUsuario;
    let passwordUsuario;
    let nomeUsuario;

    beforeEach(() => {
        const IdUser = {
            nome: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            administrador: 'true'
        };

        // 🔹 Criar o usuário
        cy.api({
            method: 'POST',
            url: '/usuarios',
            body: IdUser
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('_id');

            userIdUsuario = response.body._id;
            emailUsuario = IdUser.email;
            passwordUsuario = IdUser.password;
            nomeUsuario = IdUser.nome;

            cy.log(`Usuário criado: ${nomeUsuario} - ID: ${userIdUsuario}`);

            // 🔹 Fazer login com o usuário criado
            return cy.api({
                method: 'POST',
                url: '/login',
                body: { email: emailUsuario, 
                    password: passwordUsuario 
                }
            });
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('authorization');

            token = response.body.authorization;
        });
    });

    it('Deve atualizar o usuário criado', () => {
        const novoUsuario = {
            nome: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            administrador: 'true'
        };

        // 🔹 Atualizar usuário
        cy.api({
            method: 'PUT',
            url: `/usuarios/${userIdUsuario}`,
            headers: { 
                Authorization: token 
            },
            body: novoUsuario
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq('Registro alterado com sucesso');
            cy.log(`Usuário atualizado: ${novoUsuario.nome}`);
        });

        // 🔹 Validar atualização
        cy.api({
            method: 'GET',
            url: `/usuarios/${userIdUsuario}`,
            headers: { 
                Authorization: token 
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.nome).to.eq(novoUsuario.nome);
            expect(response.body.email).to.eq(novoUsuario.email);
            cy.log(`Validação concluída: ${response.body.nome}`);
        });
    });

    it('GET - Deve falhar id inexistente', () => {
        cy.api({
            method: 'GET',
            url: '/usuarios/1278345', // Usando o _id do usuario criado
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq('Usuário não encontrado');
            
        });
    })
});